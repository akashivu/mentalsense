package com.mentalsense.backend.controller;

import com.mentalsense.backend.model.StressHistory;
import com.mentalsense.backend.repo.StressHistoryRepo;
import org.springframework.web.bind.annotation.*;
import com.mentalsense.backend.model.KeystrokeLog;
import com.mentalsense.backend.repo.KeystrokeRepo;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;


import java.util.Map;

@RestController
@RequestMapping("/keystroke")
public class KeystrokeController {

    @Autowired
    private KeystrokeRepo repo;
    @Autowired
    private StressHistoryRepo stressHistoryRepo;
    @Autowired
    private RestTemplate restTemplate;
    @PostMapping("/log")
    public ResponseEntity<?> log(@RequestBody Map<String, Object> body, HttpServletRequest request) {

        Object uid = request.getAttribute("userId");
        if (uid == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        Long userId;
        if (uid instanceof Number) userId = ((Number) uid).longValue();
        else userId = Long.valueOf(uid.toString());


        Object rawTextObj = body.get("raw_text");
        if (rawTextObj == null) rawTextObj = body.get("rawSample");
        String rawText = rawTextObj == null ? "" : rawTextObj.toString();

        Map<String, Object> mlReq = Map.of(
                "event_times", body.get("event_times"),   // may be null or list
                "raw_text", rawText
        );

        Double mlStress = null;
        try {

            ResponseEntity<Map> mlRes = restTemplate.postForEntity("http://localhost:8000/predict/keystroke", mlReq, Map.class);
            Map mlBody = mlRes.getBody();
            if (mlBody != null) {

                if (mlBody.get("stress_score") != null) {
                    mlStress = Double.valueOf(mlBody.get("stress_score").toString());
                } else if (mlBody.get("confidence") != null) {
                    mlStress = Double.valueOf(mlBody.get("confidence").toString());
                } else if (mlBody.get("score") != null) {
                    mlStress = Double.valueOf(mlBody.get("score").toString());
                }
            }
        } catch (Exception ex) {

            System.err.println("ML call failed: " + ex.getMessage());
        }


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


            if (body.get("event_times") instanceof java.util.List) {
                try {

                    k.setEventTimes((java.util.List<Integer>) body.get("event_times"));
                } catch (ClassCastException ignored) {

                } catch (NoSuchMethodError ignored) {

                }
            }


            savedKeystroke = repo.save(k);

        } catch (Exception e) {

            KeystrokeLog k = new KeystrokeLog();
            k.setUserId(userId);
            k.setRawSample(rawText);
            savedKeystroke = repo.save(k);
        }


        StressHistory history = new StressHistory();
        history.setUserId(userId);
        history.setRawSample(rawText);
        history.setTypingSpeed(savedKeystroke.getTypingSpeed());
        history.setAvgKeyHold(savedKeystroke.getAvgKeyHold());
        history.setBackspaceRate(savedKeystroke.getBackspaceRate());
        history.setStressScore(mlStress);
        history.setCreatedAt(java.time.Instant.now());

        StressHistory savedHistory = stressHistoryRepo.save(history);


        return ResponseEntity.ok(Map.of(
                "keystroke", savedKeystroke,
                "history", savedHistory,
                "ml_called", mlStress != null
        ));
    }

}

