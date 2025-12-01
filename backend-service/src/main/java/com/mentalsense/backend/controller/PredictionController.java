package com.mentalsense.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mentalsense.backend.model.EmotionPrediction;
import com.mentalsense.backend.model.StressHistory;
import com.mentalsense.backend.model.User;
import com.mentalsense.backend.repo.EmotionPredictionRepo;
import com.mentalsense.backend.repo.StressHistoryRepo;
import com.mentalsense.backend.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/predict")
public class PredictionController {

    @Autowired
    private EmotionPredictionRepo repo;

    @Autowired
    private StressHistoryRepo historyRepo;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private UserRepo userRepo;

    private final ObjectMapper mapper = new ObjectMapper();

    private final String ML_URL = "http://localhost:8000/predict/combined";
    private final String ML_TEXT_URL = "http://localhost:8000/predict/text";

    @PostMapping("/combined")
    public ResponseEntity<?> predictCombined(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        try {
            Object rawTextObj = body.get("raw_text");
            Object eventTimesObj = body.get("event_times");
            Object kfObj = body.get("keystroke_features");
            String rawText = rawTextObj != null ? String.valueOf(rawTextObj) : "";

            if ((rawText == null || rawText.trim().isEmpty()) && eventTimesObj == null && kfObj == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Provide raw_text or event_times or keystroke_features"));
            }

            Map<String, Object> mlReq = new HashMap<>();
            mlReq.put("raw_text", rawText);
            if (eventTimesObj != null) mlReq.put("event_times", eventTimesObj);
            if (kfObj != null) mlReq.put("keystroke_features", kfObj);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(mlReq, headers);

            ResponseEntity<Map> mlRes;
            try {
                mlRes = restTemplate.postForEntity(ML_URL, entity, Map.class);
            } catch (RestClientException ex) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", "ml service unavailable", "detail", ex.getMessage()));
            }

            if (!mlRes.getStatusCode().is2xxSuccessful() || mlRes.getBody() == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "ml service failed", "ml_response", mlRes.getBody()));
            }

            Map mlBody = mlRes.getBody();

            Object textMetricsObj = mlBody.get("text_metrics");
            Object combinedObj = mlBody.get("combined_stress_score");

            if (textMetricsObj == null || combinedObj == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "ml returned unexpected payload", "ml_body", mlBody));
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> textMetrics = (Map<String, Object>) textMetricsObj;

            String label = textMetrics.getOrDefault("label", "").toString();
            Double textStress = extractDoubleSafely(textMetrics.get("text_stress_score")).orElse(null);
            Double combinedScore = extractDoubleSafely(combinedObj).orElse(null);

            if (combinedScore == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "ml did not return numeric combined_stress_score", "ml_body", mlBody));
            }

            Long userId = null;
            Object uAttr = request.getAttribute("userId");
            if (uAttr instanceof Number) userId = ((Number) uAttr).longValue();
            else if (uAttr instanceof String) {
                try { userId = Long.parseLong((String) uAttr); } catch (Exception ignored) {}
            }

            double adjustedScore = combinedScore;
            try {
                if (userId != null) {
                    java.util.Optional<User> userOpt = userRepo.findById(userId);
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        adjustedScore = computeAdjustedScore(combinedScore, user.getBaselineStress());
                    }
                } else {
                    adjustedScore = computeAdjustedScore(combinedScore, null);
                }
            } catch (Exception ex) {
                adjustedScore = combinedScore;
            }

            EmotionPrediction ep = new EmotionPrediction();
            ep.setUserId(userId);
            ep.setText(rawText);
            ep.setLabel(label);
            if (textStress != null) ep.setStressScore(textStress);
            ep.setCombinedScore(adjustedScore);
            ep.setCreatedAt(Instant.now());

            try {
                ep.setRawCombinedScore(combinedScore);
            } catch (Throwable ignored) {}

            try {
                Object scoresObj = textMetrics.get("scores");
                if (scoresObj != null) ep.setScoresJson(mapper.writeValueAsString(scoresObj));
            } catch (Exception ex) {}

            try {
                if (kfObj != null) ep.setKeystrokeJson(mapper.writeValueAsString(kfObj));
                else if (body.containsKey("keystroke_features")) ep.setKeystrokeJson(mapper.writeValueAsString(body.get("keystroke_features")));
            } catch (Exception ex) {}

            repo.save(ep);

            StressHistory sh = new StressHistory();
            sh.setUserId(userId);
            sh.setStressScore(adjustedScore);
            sh.setCreatedAt(Instant.now());
            historyRepo.save(sh);

            Map<String, Object> resp = new HashMap<>();
            resp.put("combined_score", adjustedScore);
            resp.put("raw_combined_score", combinedScore);
            resp.put("text_metrics", textMetrics);
            resp.put("keystroke_score", mlBody.get("keystroke_score"));
            resp.put("prediction_id", ep.getId());

            return ResponseEntity.ok(resp);

        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/emotion_text")
    public ResponseEntity<?> predictTextOnly(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        try {
            Object rawTextObj = body.get("raw_text");
            if (rawTextObj == null) rawTextObj = body.get("rawText");
            String rawText = rawTextObj != null ? String.valueOf(rawTextObj) : "";

            if (rawText.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Provide raw_text"));
            }

            Map<String, Object> mlReq = Map.of("raw_text", rawText);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(mlReq, headers);

            ResponseEntity<Map> mlRes;
            try {
                mlRes = restTemplate.postForEntity(ML_TEXT_URL, entity, Map.class);
            } catch (RestClientException ex) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", "ml text service unavailable", "detail", ex.getMessage()));
            }

            if (!mlRes.getStatusCode().is2xxSuccessful() || mlRes.getBody() == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "ml service failed", "ml_response", mlRes.getBody()));
            }

            Map mlBody = mlRes.getBody();

            Object textMetricsObj = mlBody.get("text_metrics");
            Object textScoreObj = mlBody.get("text_stress_score");

            if (textMetricsObj == null && textScoreObj == null) {
                textMetricsObj = mlBody.get("metrics");
                textScoreObj = mlBody.get("stress_score");
            }

            if (textMetricsObj == null && textScoreObj == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "ml returned unexpected payload", "ml_body", mlBody));
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> textMetrics = textMetricsObj instanceof Map ? (Map<String, Object>) textMetricsObj : null;
            Double rawTextScore = extractDoubleSafely(textScoreObj).orElse(null);

            if (rawTextScore == null && textMetrics != null) {
                rawTextScore = extractDoubleSafely(textMetrics.get("text_stress_score"))
                        .orElse(extractDoubleSafely(textMetrics.get("score")).orElse(null));
            }

            Long userId = null;
            Object uAttr = request.getAttribute("userId");
            if (uAttr instanceof Number) userId = ((Number) uAttr).longValue();
            else if (uAttr instanceof String) {
                try { userId = Long.parseLong((String) uAttr); } catch (Exception ignored) {}
            }

            double adjustedScore = rawTextScore == null ? 0.0 : rawTextScore;
            try {
                if (userId != null) {
                    java.util.Optional<User> userOpt = userRepo.findById(userId);
                    if (userOpt.isPresent()) {
                        adjustedScore = computeAdjustedScore(rawTextScore, userOpt.get().getBaselineStress());
                    } else {
                        adjustedScore = computeAdjustedScore(rawTextScore, null);
                    }
                } else {
                    adjustedScore = computeAdjustedScore(rawTextScore, null);
                }
            } catch (Exception ex) {
                adjustedScore = rawTextScore == null ? 0.0 : rawTextScore;
            }

            EmotionPrediction ep = new EmotionPrediction();
            ep.setUserId(userId);
            ep.setText(rawText);
            if (textMetrics != null) {
                ep.setLabel(String.valueOf(textMetrics.getOrDefault("label", "")));
                try {
                    Object scoresObj = textMetrics.get("scores") != null ? textMetrics.get("scores") : textMetrics;
                    ep.setScoresJson(mapper.writeValueAsString(scoresObj));
                } catch (Exception e) {}
            }
            if (rawTextScore != null) ep.setStressScore(rawTextScore);
            ep.setCombinedScore(adjustedScore);
            ep.setRawCombinedScore(rawTextScore);
            ep.setCreatedAt(Instant.now());
            repo.save(ep);

            StressHistory sh = new StressHistory();
            sh.setUserId(userId);
            sh.setStressScore(adjustedScore);
            sh.setCreatedAt(Instant.now());
            historyRepo.save(sh);

            Map<String, Object> resp = new HashMap<>();
            resp.put("adjusted_score", adjustedScore);
            resp.put("raw_score", rawTextScore);
            resp.put("text_metrics", textMetrics);
            resp.put("prediction_id", ep.getId());

            return ResponseEntity.ok(resp);

        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", ex.getMessage()));
        }
    }

    private java.util.Optional<Double> extractDoubleSafely(Object val) {
        if (val == null) return java.util.Optional.empty();
        if (val instanceof Number) {
            return java.util.Optional.of(((Number) val).doubleValue());
        }
        if (val instanceof String) {
            try {
                return java.util.Optional.of(Double.parseDouble((String) val));
            } catch (NumberFormatException ignored) {}
        }
        return java.util.Optional.empty();
    }

    private double computeAdjustedScore(Double combinedScore, Double baseline) {
        if (combinedScore == null) return 0.0;
        double b = (baseline == null) ? 0.0 : baseline;
        if (b < 0.0 || b > 1.0) {
            b = Math.max(0.0, Math.min(1.0, b));
        }
        double shifted = (combinedScore - b) + 0.5;
        return Math.max(0.0, Math.min(1.0, shifted));
    }
}
