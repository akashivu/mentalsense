package com.mentalsense.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mentalsense.backend.model.EmotionPrediction;
import com.mentalsense.backend.model.StressHistory;
import com.mentalsense.backend.repo.EmotionPredictionRepo;
import com.mentalsense.backend.repo.StressHistoryRepo;
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

    private final ObjectMapper mapper = new ObjectMapper();

    private final String ML_URL = "http://localhost:8000/predict/combined";


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
                ex.printStackTrace();
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


            EmotionPrediction ep = new EmotionPrediction();
            ep.setUserId(userId);
            ep.setText(rawText);
            ep.setLabel(label);
            if (textStress != null) ep.setStressScore(textStress);
            ep.setCombinedScore(combinedScore);
            ep.setCreatedAt(Instant.now());


            try {
                Object scoresObj = textMetrics.get("scores");
                if (scoresObj != null) ep.setScoresJson(mapper.writeValueAsString(scoresObj));
            } catch (Exception ex) {

                ex.printStackTrace();
            }


            try {
                if (kfObj != null) ep.setKeystrokeJson(mapper.writeValueAsString(kfObj));
                else if (body.containsKey("keystroke_features")) ep.setKeystrokeJson(mapper.writeValueAsString(body.get("keystroke_features")));
            } catch (Exception ex) {
                ex.printStackTrace();
            }

            repo.save(ep);


            StressHistory sh = new StressHistory();
            sh.setUserId(userId);
            sh.setStressScore(combinedScore);
            sh.setCreatedAt(Instant.now());
            historyRepo.save(sh);


            return ResponseEntity.ok(Map.of(
                    "combined_score", combinedScore,
                    "text_metrics", textMetrics,
                    "keystroke_score", mlBody.get("keystroke_score"),
                    "prediction_id", ep.getId()
            ));

        } catch (Exception ex) {
            ex.printStackTrace();
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
}

