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



        Object uAttr = request.getAttribute("userId");
        if (uAttr == null || !id.equals(Long.valueOf(uAttr.toString()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "not allowed"));
        }


        List<StressHistory> list =
                stressHistoryRepo.findByUserIdOrderByCreatedAtAsc(id);

        return ResponseEntity.ok(list);
    }
    @GetMapping("/user/{id}/hourly-stress")
    public ResponseEntity<?> getHourlyStress(
            @PathVariable Long id,
            @RequestParam(defaultValue = "7") int days,
            HttpServletRequest request) {


        Object uAttr = request.getAttribute("userId");
        if (uAttr == null || !id.equals(Long.valueOf(uAttr.toString()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "not allowed"));
        }


        Instant from = Instant.now().minusSeconds(days * 24L * 3600L);

        var rows = stressHistoryRepo.findHourlyAvgStress(id, from);

        double[] byHour = new double[24];

        for (Object[] r : rows) {
            int hour = ((Number) r[0]).intValue();
            double avg = ((Number) r[1]).doubleValue();
            if (hour >= 0 && hour < 24) {
                byHour[hour] = avg;
            }
        }

        return ResponseEntity.ok(Map.of("hours", byHour));
    }
    @GetMapping("/user/{id}/dow-stress")
    public ResponseEntity<?> getDowStress(
            @PathVariable Long id,
            @RequestParam(defaultValue = "28") int days,
            HttpServletRequest request) {

        Object uAttr = request.getAttribute("userId");
        if (uAttr == null || !id.equals(Long.valueOf(uAttr.toString()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "not allowed"));
        }

        Instant from = Instant.now().minusSeconds(days * 24L * 3600L);
        var rows = stressHistoryRepo.findDowAvgStress(id, from);

        double[] byDow = new double[7];

        for (Object[] r : rows) {
            int dow = ((Number) r[0]).intValue();
            Number avgNum = (Number) r[1];
            if (avgNum == null) {
                continue;
            }
            double avg = avgNum.doubleValue();

            if (dow >= 0 && dow < 7) {
                byDow[dow] = avg;
            }
        }


        return ResponseEntity.ok(Map.of("dow", byDow));
    }
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

}

