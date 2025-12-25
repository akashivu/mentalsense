package com.mentalsense.backend.controller;

import com.mentalsense.backend.model.EmotionPrediction;
import com.mentalsense.backend.repo.EmotionPredictionRepo;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;


@RestController
@RequestMapping("/emotion")
public class EmotionController {

    @Autowired
    private EmotionPredictionRepo repo;

    @Autowired
    private RestTemplate restTemplate;
    @Value("${ml.base.url}")
    private String mlBase;

    private final ObjectMapper mapper = new ObjectMapper();

    // Local ML model endpoint for emotion analysis


    @PostMapping("/text")
    public ResponseEntity<?> analyzeText(@RequestBody Map<String, String> body, HttpServletRequest request) {
        try {
            String text = body.get("text");
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "text required"));
            }

            // Call ML service with the input text
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(Map.of("text", text), headers);
            ResponseEntity<Map> mlRes =
                    restTemplate.postForEntity(
                            mlBase + "/predict/emotion_text",
                            entity,
                            Map.class
                    );


            // Basic validation of ML response
            if (!mlRes.getStatusCode().is2xxSuccessful()
                    || mlRes.getBody() == null
                    || !Boolean.TRUE.equals(mlRes.getBody().get("ok"))) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "ml service failed", "ml_response", mlRes.getBody()));
            }

            Map result = (Map) mlRes.getBody().get("result");
            String label = (String) result.get("label");
            Double stress = ((Number) result.get("stress_score")).doubleValue();
            Object scores = result.get("scores");

            // Extract user ID set by the JWT filter
            Long userId = null;
            Object uAttr = request.getAttribute("userId");
            if (uAttr instanceof Number) {
                userId = ((Number) uAttr).longValue();
            } else if (uAttr instanceof String) {
                try { userId = Long.parseLong((String) uAttr); } catch (Exception ignored) {}
            }

            // Save emotion analysis result
            EmotionPrediction ep = new EmotionPrediction();
            ep.setUserId(userId);
            ep.setText(text);
            ep.setLabel(label);
            ep.setScoresJson(mapper.writeValueAsString(scores));
            ep.setStressScore(stress);
            ep.setCreatedAt(Instant.now());

            repo.save(ep);

            return ResponseEntity.ok(Map.of(
                    "label", label,
                    "stress_score", stress,
                    "scores", scores,
                    "id", ep.getId()
            ));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }
}
