package com.mentalsense.backend.controller;

import com.mentalsense.backend.model.StressHistory;
import com.mentalsense.backend.repo.StressHistoryRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserModelController {

    @Autowired
    private StressHistoryRepo stressRepo;

    @Autowired
    private RestTemplate restTemplate;

    private final String ML_BASE = "http://localhost:8000";


    @PostMapping("/{userId}/train-models")
    public ResponseEntity<?> trainModels(
            @PathVariable Long userId,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        try {
            if (body == null) body = new HashMap<>();


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

            String url = ML_BASE + "/user/" + userId + "/train-models";
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
            if (!body.containsKey("past_values")) {
                return ResponseEntity.badRequest().body(Map.of("error", "past_values required"));
            }


            Map<String, Object> mlReq = new HashMap<>();
            mlReq.put("past_values", body.get("past_values"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(mlReq, headers);

            String url = ML_BASE + "/user/" + userId + "/trend";
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
            headers.setContentType(MediaType.APPLICATION_JSON);HttpEntity<Map<String, Object>> entity = new HttpEntity<>(mlReq, headers);

            String url = ML_BASE + "/predict/anomaly";
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

        return ResponseEntity.ok(Collections.emptyList());
    }

}
