package com.mentalsense.backend.controller;

import com.mentalsense.backend.model.StressHistory;
import com.mentalsense.backend.repo.StressHistoryRepo;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
public class HistoryController {

    private final StressHistoryRepo stressHistoryRepo;

    public HistoryController(StressHistoryRepo stressHistoryRepo) {
        this.stressHistoryRepo = stressHistoryRepo;
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<?> getHistory(
            @PathVariable Long id,
            HttpServletRequest request) {

        // Only allow user to access their own history
        Object uAttr = request.getAttribute("userId");
        if (uAttr == null || !id.equals(Long.valueOf(uAttr.toString()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "not allowed"));
        }

        List<StressHistory> list =
                stressHistoryRepo.findByUserIdOrderByCreatedAtAsc(id);

        return ResponseEntity.ok(list);
    }

    @GetMapping({"/user/{id}/daily-stress", "/user/{id}/daily_stress"})
    public ResponseEntity<?> getDailyStress(
            @PathVariable Long id,
            @RequestParam(defaultValue = "14") int days,
            @RequestParam(defaultValue = "combined") String mode,
            HttpServletRequest request) {

        // Enforce user-level access control
        Object uAttr = request.getAttribute("userId");
        if (uAttr == null || !id.equals(Long.valueOf(uAttr.toString()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "not allowed"));
        }

        Instant from = Instant.now().minusSeconds(days * 24L * 3600L);

        // Pick stress source based on mode
        var rows = switch (mode.toLowerCase()) {
            case "keystroke" -> stressHistoryRepo.findDailyAvgKeystroke(id, from);
            case "emotion"   -> stressHistoryRepo.findDailyAvgText(id, from);
            default          -> stressHistoryRepo.findDailyAvgCombined(id, from);
        };

        // Normalize rows into a simple list of day → average stress
        var list = rows.stream().map(r -> {
            String day = r[0].toString();
            double avg = ((Number) r[1]).doubleValue();
            return Map.<String, Object>of(
                    "day", day,
                    "avgStress", avg,
                    "avg", avg
            );
        }).toList();

        return ResponseEntity.ok(list);
    }

    // Hourly stress trends
    @GetMapping("/user/{id}/hourly-stress")
    public ResponseEntity<?> getHourlyStress(
            @PathVariable Long id,
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(defaultValue = "combined") String mode,
            HttpServletRequest request) {

        Object uAttr = request.getAttribute("userId");
        if (uAttr == null || !id.equals(Long.valueOf(uAttr.toString()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "not allowed"));
        }

        Instant from = Instant.now().minusSeconds(days * 24L * 3600L);

        // Fetch hourly averages depending on mode
        var rows = switch (mode.toLowerCase()) {
            case "keystroke" -> stressHistoryRepo.findHourlyAvgKeystroke(id, from);
            case "emotion"   -> stressHistoryRepo.findHourlyAvgText(id, from);
            default          -> stressHistoryRepo.findHourlyAvgCombined(id, from);
        };

        double[] byHour = new double[24];

        // Each row: [hour, average_stress]
        for (Object[] r : rows) {
            int hour = ((Number) r[0]).intValue();
            double avg = ((Number) r[1]).doubleValue();
            if (hour >= 0 && hour < 24) {
                byHour[hour] = avg;
            }
        }

        return ResponseEntity.ok(Map.of("hours", byHour));
    }

    // Day-of-week stress pattern
    @GetMapping("/user/{id}/dow-stress")
    public ResponseEntity<?> getDowStress(
            @PathVariable Long id,
            @RequestParam(defaultValue = "28") int days,
            @RequestParam(defaultValue = "combined") String mode,
            HttpServletRequest request) {

        Object uAttr = request.getAttribute("userId");
        if (uAttr == null || !id.equals(Long.valueOf(uAttr.toString()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "not allowed"));
        }

        Instant from = Instant.now().minusSeconds(days * 24L * 3600L);

        // Day-of-week averages for different modes
        var rows = switch (mode.toLowerCase()) {
            case "keystroke" -> stressHistoryRepo.findDowAvgKeystroke(id, from);
            case "emotion"   -> stressHistoryRepo.findDowAvgText(id, from);
            default          -> stressHistoryRepo.findDowAvgCombined(id, from);
        };

        double[] byDow = new double[7];

        for (Object[] r : rows) {
            int dow = ((Number) r[0]).intValue();
            Number avgNum = (Number) r[1];
            if (avgNum == null) continue;

            double avg = avgNum.doubleValue();
            if (dow >= 0 && dow < 7) {
                byDow[dow] = avg;
            }
        }

        return ResponseEntity.ok(Map.of("dow", byDow));
    }

    // Engagement count (how many stress entries per day)
    @GetMapping("/user/{id}/engagement")
    public ResponseEntity<?> getEngagement(
            @PathVariable Long id,
            @RequestParam(defaultValue = "30") int days,
            HttpServletRequest request) {

        Object uAttr = request.getAttribute("userId");
        if (uAttr == null || !id.equals(Long.valueOf(uAttr.toString()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "not allowed"));
        }

        Instant from = Instant.now().minusSeconds(days * 24L * 3600L);
        var rows = stressHistoryRepo.findDailyEngagement(id, from);

        var list = rows.stream().map(r -> Map.of(
                "day", r[0].toString(),
                "count", ((Number) r[1]).intValue()
        )).toList();

        return ResponseEntity.ok(list);
    }

    @GetMapping("/user/{id}/weekly-stats")
    public ResponseEntity<?> getWeeklyStats(
            @PathVariable Long id,
            @RequestParam(defaultValue = "combined") String mode,
            HttpServletRequest request) {

        Object uAttr = request.getAttribute("userId");
        if (uAttr == null || !id.equals(Long.valueOf(uAttr.toString()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "not allowed"));
        }

        Instant now = Instant.now();
        Instant lastWeekStart = now.minusSeconds(7 * 24L * 3600L);
        Instant prevWeekStart = now.minusSeconds(14 * 24L * 3600L);

        // Compare average stress between two weeks
        double thisWeekAvg = getAvg(id, lastWeekStart, now, mode);
        double lastWeekAvg = getAvg(id, prevWeekStart, lastWeekStart, mode);

        String trend;
        if (thisWeekAvg > lastWeekAvg) trend = "increasing";
        else if (thisWeekAvg < lastWeekAvg) trend = "decreasing";
        else trend = "stable";

        return ResponseEntity.ok(Map.of(
                "thisWeek", thisWeekAvg,
                "lastWeek", lastWeekAvg,
                "trend", trend,
                "mode", mode
        ));
    }

    // Helper for averaging over a period
    private double getAvg(Long id, Instant from, Instant to, String mode) {
        Double avgObj = switch (mode.toLowerCase()) {
            case "keystroke" -> stressHistoryRepo.avgKeystrokeBetween(id, from, to);
            case "emotion"   -> stressHistoryRepo.avgTextBetween(id, from, to);
            default          -> stressHistoryRepo.avgCombinedBetween(id, from, to);
        };
        return avgObj != null ? avgObj : 0.0;
    }
}
