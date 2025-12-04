package com.mentalsense.backend.controller;

import com.mentalsense.backend.model.DailyStress;
import com.mentalsense.backend.model.StressHistory;
import com.mentalsense.backend.repo.DailyStressRepo;
import com.mentalsense.backend.repo.StressHistoryRepo;
import com.mentalsense.backend.repo.UserRepo;
import com.mentalsense.backend.model.User;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.mentalsense.backend.model.EmotionPrediction;
import com.mentalsense.backend.repo.EmotionPredictionRepo;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {

    private final StressHistoryRepo stressHistoryRepo;
    private final UserRepo userRepo;
    private final DailyStressRepo dailyStressRepo;
    private final EmotionPredictionRepo emotionPredictionRepo;

    public UserController(StressHistoryRepo stressHistoryRepo,
                          UserRepo userRepo,
                          DailyStressRepo dailyStressRepo,EmotionPredictionRepo emotionPredictionRepo) {
        this.stressHistoryRepo = stressHistoryRepo;
        this.userRepo = userRepo;
        this.dailyStressRepo = dailyStressRepo;
        this.emotionPredictionRepo=emotionPredictionRepo;
    }

    @PutMapping("/{id}/baseline")
    public ResponseEntity<?> updateBaseline(@PathVariable Long id,
                                            @RequestBody Map<String, Object> body) {
        Optional<User> uOpt = userRepo.findById(id);
        if (uOpt.isEmpty()) return ResponseEntity.status(404).build();
        User u = uOpt.get();
        if (body.containsKey("baselineTypingSpeed"))
            u.setBaselineTypingSpeed(Double.valueOf(body.get("baselineTypingSpeed").toString()));
        if (body.containsKey("baselineStress"))
            u.setBaselineStress(Double.valueOf(body.get("baselineStress").toString()));
        userRepo.save(u);
        return ResponseEntity.ok(u);
    }

    @PutMapping("/{id}/baseline/compute")
    public ResponseEntity<?> computeBaseline(@PathVariable Long id) {
        List<StressHistory> list = stressHistoryRepo.findByUserIdOrderByCreatedAtAsc(id);
        if (list == null || list.size() < 5) {
            return ResponseEntity.badRequest().body(Map.of("error", "need 5+ samples"));
        }

        int N = 20;
        List<StressHistory> last = list.size() > N
                ? list.subList(list.size() - N, list.size())
                : list;

        double baseline = last.stream()
                .mapToDouble(StressHistory::getStressScore)
                .average()
                .orElse(0.0);

        User u = userRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        u.setBaselineStress(baseline);
        userRepo.save(u);

        return ResponseEntity.ok(Map.of("baseline", baseline));
    }

    @GetMapping("/{id}/daily-stress")
    public ResponseEntity<?> getDailyStress(
            @PathVariable Long id,
            @RequestParam(defaultValue = "7") int days,
            HttpServletRequest request) {


        Object uAttr = request.getAttribute("userId");
        if (uAttr == null || !id.equals(Long.valueOf(uAttr.toString()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "not allowed"));
        }


        LocalDate from = LocalDate.now().minusDays(days);


        List<DailyStress> list =
                dailyStressRepo.findByUserIdAndDayAfterOrderByDayAsc(id, from);


        List<Map<String, Object>> res = list.stream()
                .map(ds -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("day", ds.getDay().toString());
                    m.put("avgStress", ds.getAvgStress());
                    return m;
                })
                .toList();

        return ResponseEntity.ok(res);
    }
    @GetMapping("/{id}/anomalies")
    public ResponseEntity<?> getAnomalies(
            @PathVariable Long id,
            @RequestParam(defaultValue = "30") int limit,
            HttpServletRequest request) {


        Object uAttr = request.getAttribute("userId");
        if (uAttr == null || !id.equals(Long.valueOf(uAttr.toString()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "not allowed"));
        }


        if (limit <= 0) limit = 10;
        if (limit > 200) limit = 200;

        double threshold = 0.75;


        Pageable pageable = PageRequest.of(0, limit);


        List<EmotionPrediction> list =
                emotionPredictionRepo.findAnomaliesForUser(id, threshold, pageable);


        List<Map<String, Object>> res = list.stream()
                .map(ep -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("timestamp", ep.getCreatedAt());
                    m.put("score", ep.getCombinedScore());
                    return m;
                })
                .toList();

        return ResponseEntity.ok(res);
    }

}
