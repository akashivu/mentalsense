package com.mentalsense.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mentalsense.backend.model.EmotionPrediction;
import com.mentalsense.backend.model.StressHistory;
import com.mentalsense.backend.repo.EmotionPredictionRepo;
import com.mentalsense.backend.repo.StressHistoryRepo;
import com.mentalsense.backend.repo.UserRepo;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/predict")
public class PredictionController {

    @Autowired private EmotionPredictionRepo repo;
    @Autowired private StressHistoryRepo historyRepo;
    @Autowired private RestTemplate restTemplate;
    @Autowired private UserRepo userRepo;

    private final ObjectMapper mapper = new ObjectMapper();

    // ML endpoints (local during development)
    private final String ML_URL      = "http://localhost:8000/predict/combined";
    private final String ML_TEXT_URL = "http://localhost:8000/predict/emotion_text";


    // Combined Prediction (text + keystroke)
    @PostMapping("/combined")
    public ResponseEntity<?> predictCombined(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        try {
            String rawText    = getString(body, "raw_text");
            Object eventTimes = body.get("event_times");
            Object kfObj      = body.get("keystroke_features");

            // Require at least one input source
            if (isEmpty(rawText) && eventTimes == null && kfObj == null) {
                return bad("Provide raw_text or event_times or keystroke_features");
            }

            // Build ML request payload
            Map<String, Object> mlReq = new HashMap<>();
            mlReq.put("raw_text", rawText);
            if (eventTimes != null)     mlReq.put("event_times", eventTimes);
            if (kfObj != null)          mlReq.put("keystroke_features", kfObj);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(mlReq, headers);

            // Best-effort ML call
            Map<String, Object> mlRes = callMl(ML_URL, entity);
            if (mlRes == null) return fail("ML returned null");

            Map<String, Object> textMetrics = castMap(mlRes.get("text_metrics"));

            Double textStress = null;
            if (textMetrics != null) {
                textStress = getDouble(textMetrics.get("text_stress_score"));
                if (textStress == null) {
                    textStress = getDouble(textMetrics.get("score"));
                }
            }

            Double keystrokeScore = getDouble(mlRes.get("keystroke_score"));
            Double combinedScore  = getDouble(mlRes.get("combined_stress_score"));

            if (combinedScore == null) {
                return fail("ML did not return combined_stress_score");
            }

            Long userId = getUserId(request);

            // Adjust combined score using user's baseline (if available)
            Double adjustedScore = adjustByBaseline(userId, combinedScore);

            // Persist EmotionPrediction (text metrics + combined)
            EmotionPrediction ep = new EmotionPrediction();
            ep.setUserId(userId);
            ep.setText(rawText);

            if (textMetrics != null) {
                ep.setLabel(String.valueOf(textMetrics.getOrDefault("label", "")));
                try {
                    Object scoresObj = textMetrics.get("scores") != null
                            ? textMetrics.get("scores")
                            : textMetrics;
                    ep.setScoresJson(mapper.writeValueAsString(scoresObj));
                } catch (Exception ignored) {}
            }

            if (textStress != null) {
                ep.setStressScore(textStress);   // store text-only score too
            }

            ep.setCombinedScore(adjustedScore);  // baseline-adjusted combined
            ep.setRawCombinedScore(combinedScore);
            ep.setCreatedAt(Instant.now());
            repo.save(ep);

            // Save derived StressHistory (used for trends/graphs)
            StressHistory sh = new StressHistory();
            sh.setUserId(userId);
            sh.setStressScore(adjustedScore);     // overall (combined, adjusted)
            sh.setKeystrokeScore(keystrokeScore); // keystroke-only
            sh.setTextScore(textStress);          // text-only
            sh.setCreatedAt(Instant.now());
            historyRepo.save(sh);

            return ok(Map.of(
                    "mode", "combined",
                    "combined_score", adjustedScore,
                    "raw_combined_score", combinedScore,
                    "text_score", textStress,
                    "keystroke_score", keystrokeScore,
                    "text_metrics", textMetrics,       // used by frontend EmotionBox
                    "prediction_id", ep.getId()
            ));

        } catch (Exception ex) {
            return fail(ex.getMessage());
        }
    }


    // Text-Only Prediction
    @PostMapping("/emotion_text")
    public ResponseEntity<?> predictText(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        try {
            String rawText = getString(body, "raw_text");
            if (isEmpty(rawText)) {
                return bad("Provide raw_text");
            }

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(Map.of("text", rawText), createHeaders());

            Map<String, Object> mlRes = callMl(ML_TEXT_URL, entity);
            if (mlRes == null) return fail("ML returned null");

            Map<String, Object> result = castMap(mlRes.get("result"));
            if (result == null) {
                return fail("ML text endpoint returned no result");
            }

            Map<String, Object> textMetrics = result;

            Double rawTextScore = getDouble(result.get("text_stress_score"));
            if (rawTextScore == null) {
                rawTextScore = getDouble(result.get("score"));
            }

            if (rawTextScore == null) {
                return fail("ML did not return text_stress_score or score");
            }

            Long userId = getUserId(request);

            // For text-only, adjust by baseline but don't treat as overall combined
            Double adjustedScore = adjustByBaseline(userId, rawTextScore);

            EmotionPrediction ep = new EmotionPrediction();
            ep.setUserId(userId);
            ep.setText(rawText);

            ep.setLabel(String.valueOf(result.getOrDefault("label", "")));
            try {
                Object scoresObj = result.get("scores") != null
                        ? result.get("scores")
                        : result;
                ep.setScoresJson(mapper.writeValueAsString(scoresObj));
            } catch (Exception ignored) {}

            ep.setStressScore(rawTextScore);
            ep.setCombinedScore(adjustedScore);
            ep.setRawCombinedScore(rawTextScore);
            ep.setCreatedAt(Instant.now());
            repo.save(ep);

            // Perisst history but avoid polluting combined score (text-only shouldn't override combined)
            StressHistory sh = new StressHistory();
            sh.setUserId(userId);
            sh.setStressScore(null);      // keep combined empty for text-only entries
            sh.setTextScore(rawTextScore);
            sh.setKeystrokeScore(null);
            sh.setCreatedAt(Instant.now());
            historyRepo.save(sh);

            return ok(Map.of(
                    "mode", "text_only",
                    "adjusted_score", adjustedScore,
                    "raw_score", rawTextScore,
                    "text_metrics", textMetrics,   // used by frontend EmotionBox
                    "prediction_id", ep.getId()
            ));

        } catch (Exception ex) {
            return fail(ex.getMessage());
        }
    }



    private boolean isEmpty(String s) {
        return s == null || s.trim().isEmpty();
    }

    private String getString(Map<String, Object> body, String key) {
        Object v = body.get(key);
        return v == null ? "" : String.valueOf(v);
    }

    private Long getUserId(HttpServletRequest request) {
        Object u = request.getAttribute("userId");
        try {
            if (u instanceof Number) return ((Number) u).longValue();
            if (u instanceof String) return Long.parseLong((String) u);
        } catch (Exception ignored) {}
        return null;
    }

    private Double getDouble(Object v) {
        if (v == null) return null;
        try {
            if (v instanceof Number) return ((Number) v).doubleValue();
            return Double.parseDouble(v.toString());
        } catch (Exception ignored) {}
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> castMap(Object v) {
        if (v instanceof Map<?, ?>) {
            return (Map<String, Object>) v;
        }
        return null;
    }

    private HttpHeaders createHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        return h;
    }

    // Wrapper around RestTemplate call — returns null on failure
    private Map<String, Object> callMl(String url, HttpEntity<?> request) {
        try {
            ResponseEntity<Map> res = restTemplate.postForEntity(url, request, Map.class);
            if (res.getStatusCode().is2xxSuccessful()) {
                return res.getBody();
            }
        } catch (RestClientException ignored) {}
        return null;
    }

    // Shift score using user's baseline to normalize per-user values
    private double adjustByBaseline(Long userId, Double score) {
        if (score == null) return 0.0;

        try {
            if (userId == null) return score;

            var opt = userRepo.findById(userId);
            if (opt.isEmpty()) return score;

            Double baseline = opt.get().getBaselineStress();
            if (baseline == null) return score;

            double shifted = (score - baseline) + 0.5;
            return Math.max(0.0, Math.min(1.0, shifted));
        } catch (Exception e) {
            return score;
        }
    }

    private ResponseEntity<?> ok(Object body) {
        return ResponseEntity.ok(body);
    }

    private ResponseEntity<?> bad(String msg) {
        return ResponseEntity.badRequest().body(Map.of("error", msg));
    }

    private ResponseEntity<?> fail(String msg) {
        return ResponseEntity.status(500).body(Map.of("error", msg));
    }
}
