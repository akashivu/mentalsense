package com.mentalsense.backend.controller;

import com.mentalsense.backend.model.StressHistory;
import com.mentalsense.backend.repo.StressHistoryRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.*;

@RestController
@RequestMapping("/user")

public class UserModelController {

    @Autowired
    private StressHistoryRepo stressRepo;
    @Value("${ml.base.url}")
    private String mlBase;

    @Autowired
    private RestTemplate restTemplate;




    @PostMapping("/{userId}/train-models")
    public ResponseEntity<?> trainModels(
            @PathVariable Long userId,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        try {
            if (body == null) body = new HashMap<>();

            // If caller didn't supply values, gather user stress history values
            if (!body.containsKey("values")) {
                List<StressHistory> list = stressRepo.findByUserIdOrderByCreatedAtAsc(userId);
                List<Double> arr = new ArrayList<>();
                for (StressHistory sh : list) {
                    if (sh.getStressScore() != null) {
                        arr.add(sh.getStressScore());
                    }
                }
                body.put("values", arr);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            // Forward training request to mL service
            String url = mlBase + "/user/" + userId + "/train-models";

            ResponseEntity<Map> mlRes = restTemplate.postForEntity(url, entity, Map.class);

            return ResponseEntity.status(mlRes.getStatusCode()).body(mlRes.getBody());
        } catch (RestClientException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(
                    Map.of("error", "ML service unavailable", "detail", ex.getMessage())
            );
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", ex.getMessage())
            );
        }
    }


    @PostMapping("/{userId}/trend")
    public ResponseEntity<?> getTrend(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> body
    ) {
        try {
            // Expect past_values in payload
            if (!body.containsKey("past_values")) {
                return ResponseEntity.badRequest().body(Map.of("error", "past_values required"));
            }

            Map<String, Object> mlReq = new HashMap<>();
            mlReq.put("past_values", body.get("past_values"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(mlReq, headers);

            // Delegate trend prediction to per-user ML endpoint
            String url = mlBase + "/user/" + userId + "/trend";

            ResponseEntity<Map> mlRes = restTemplate.postForEntity(url, entity, Map.class);

            return ResponseEntity.status(mlRes.getStatusCode()).body(mlRes.getBody());

        } catch (RestClientException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "ML service unavailable", "detail", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }


    @PostMapping("/{userId}/anomaly")
    public ResponseEntity<?> anomaly(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> body
    ) {
        try {
            Map<String, Object> mlReq = new HashMap<>();

            // Support multiple input styles for anomaly detection
            if (body.containsKey("value")) {
                mlReq.put("value", body.get("value"));
            }
            if (body.containsKey("features")) {
                mlReq.put("features", body.get("features"));
            }
            if (body.containsKey("multi_features")) {
                mlReq.put("multi_features", body.get("multi_features"));
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(mlReq, headers);

            // Call generic anomaly endpoint on ML service
            String url = mlBase + "/predict/anomaly";

            ResponseEntity<Map> mlRes = restTemplate.postForEntity(url, entity, Map.class);

            return ResponseEntity.status(mlRes.getStatusCode()).body(mlRes.getBody());

        } catch (RestClientException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "ML service unavailable", "detail", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/{userId}/anomalies")
    public ResponseEntity<?> getAnomalies(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "30") int limit
    ) {

        // TODO implement server-side anomalies listing (currently returns empty list)
        return ResponseEntity.ok(Collections.emptyList());
    }

}
