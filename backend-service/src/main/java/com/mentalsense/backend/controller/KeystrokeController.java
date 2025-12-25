package com.mentalsense.backend.controller;

import com.mentalsense.backend.model.StressHistory;
import com.mentalsense.backend.repo.StressHistoryRepo;
import com.mentalsense.backend.model.KeystrokeLog;
import com.mentalsense.backend.repo.KeystrokeRepo;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/keystroke")
public class KeystrokeController {

    @Autowired
    private KeystrokeRepo repo;

    @Autowired
    private StressHistoryRepo stressHistoryRepo;

    @Autowired
    private RestTemplate restTemplate;
    @Value("${ml.base.url}")
    private String mlBase;

    @PostMapping("/log")
    public ResponseEntity<?> log(@RequestBody Map<String, Object> body, HttpServletRequest request) {

        // Ensure request is authenticated and get user id from JWT filter
        Object uid = request.getAttribute("userId");
        if (uid == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        Long userId;
        if (uid instanceof Number) {
            userId = ((Number) uid).longValue();
        } else {
            userId = Long.valueOf(uid.toString());
        }

        // Support two possible names for raw text from frontend
        Object rawTextObj = body.get("raw_text");
        if (rawTextObj == null) rawTextObj = body.get("rawSample");
        String rawText = rawTextObj == null ? "" : rawTextObj.toString();

        // Prepare ML request payload
        Map<String, Object> mlReq = Map.of(
                "user_id", userId,
                "event_times", body.get("event_times"),
                "raw_text", rawText
        );


        // Call keystroke ML service (best-effort — failure is non-fatal)
        Double mlStress = null;
        try {
            ResponseEntity<Map> mlRes = restTemplate.postForEntity(
                    mlBase + "/predict/keystroke",
                    mlReq,
                    Map.class
            );

            Map mlBody = mlRes.getBody();
            if (mlBody != null) {
                // The ML service may return the score under different keys
                if (mlBody.get("stress_score") != null) {
                    mlStress = Double.valueOf(mlBody.get("stress_score").toString());
                } else if (mlBody.get("confidence") != null) {
                    mlStress = Double.valueOf(mlBody.get("confidence").toString());
                } else if (mlBody.get("score") != null) {
                    mlStress = Double.valueOf(mlBody.get("score").toString());
                }
            }
        } catch (Exception ex) {
            // Log and continue — keystroke logging should not fail the whole request
            System.err.println("ML call failed: " + ex.getMessage());
        }

        // Persist keystroke features (tolerant parsing with fallback)
        KeystrokeLog savedKeystroke;
        try {
            KeystrokeLog k = new KeystrokeLog();
            k.setUserId(userId);

            if (body.get("typingSpeed") != null) {
                k.setTypingSpeed(Double.valueOf(body.get("typingSpeed").toString()));
            }
            if (body.get("avgKeyHold") != null) {
                k.setAvgKeyHold(Double.valueOf(body.get("avgKeyHold").toString()));
            }
            if (body.get("backspaceRate") != null) {
                k.setBackspaceRate(Double.valueOf(body.get("backspaceRate").toString()));
            }

            k.setRawSample(rawText);

            // event_times may be a List<Integer>; attempt to cast but ignore on failure
            if (body.get("event_times") instanceof java.util.List) {
                try {
                    k.setEventTimes((java.util.List<Integer>) body.get("event_times"));
                } catch (ClassCastException ignored) {
                } catch (NoSuchMethodError ignored) {
                }
            }

            savedKeystroke = repo.save(k);

        } catch (Exception e) {
            // If parsing fails, fall back to saving minimal record so we don't lose data
            KeystrokeLog k = new KeystrokeLog();
            k.setUserId(userId);
            k.setRawSample(rawText);
            savedKeystroke = repo.save(k);
        }

        // Create a StressHistory entry from saved keystroke + ML score
        StressHistory history = new StressHistory();
        history.setUserId(userId);

        history.setTypingSpeed(savedKeystroke.getTypingSpeed());
        history.setAvgKeyHold(savedKeystroke.getAvgKeyHold());
        history.setBackspaceRate(savedKeystroke.getBackspaceRate());

        if (mlStress != null) {
            history.setKeystrokeScore(mlStress);
            history.setStressScore(mlStress);
        } else {
            history.setKeystrokeScore(null);
            history.setStressScore(0.0); // default when ML not available
        }

        history.setCreatedAt(Instant.now());

        StressHistory savedHistory = stressHistoryRepo.save(history);

        // Return both the raw keystroke record and the derived history to frontend
        return ResponseEntity.ok(Map.of(
                "keystroke", savedKeystroke,
                "history", savedHistory,
                "ml_called", mlStress != null
        ));
    }

}
