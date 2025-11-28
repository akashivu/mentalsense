package com.mentalsense.backend.controller;

import com.mentalsense.backend.model.StressHistory;
import com.mentalsense.backend.repo.StressHistoryRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@RestController
public class UserMlController {

    private static final Logger logger = LoggerFactory.getLogger(UserMlController.class);

    @Autowired
    private StressHistoryRepo historyRepo;

    @Autowired
    private RestTemplate template;


    private static final String ML_BASE = "http://localhost:8000";


    @GetMapping("/user/{id}/trend")
    public ResponseEntity<?> trend(@PathVariable Long id) {
        List<StressHistory> history = historyRepo.findByUserIdOrderByCreatedAtAsc(id);


        List<Double> values = history.stream()
                .map(StressHistory::getStressScore)
                .filter(Objects::nonNull)
                .map(v -> {
                    try {
                        if (v instanceof Number) return ((Number) v).doubleValue();
                        return Double.valueOf(v.toString());
                    } catch (Exception ex) {
                        logger.warn("Skipping non-numeric stressScore for user {}: {}", id, v);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        final int required = 10;


        if (values.isEmpty()) {
            for (int i = 0; i < required; i++) values.add(0.0);
        } else {
            while (values.size() < required) {
                values.add(values.get(values.size() - 1));
            }
        }

        List<Double> last10 = values.subList(values.size() - required, values.size());
        Map<String, Object> req = Map.of("past_values", last10);

        logger.debug("Calling ML trend for user {} with payload: {}", id, req);

        try {
            ResponseEntity<Map> res = template.postForEntity(ML_BASE + "/predict/trend", req, Map.class);
            return ResponseEntity.ok(res.getBody());
        } catch (HttpClientErrorException.BadRequest bad) {
            logger.error("ML service rejected payload: {} -> {}", req, bad.getResponseBodyAsString());
            Map<String, Object> err = Map.of("error", "ML service rejected payload", "details", bad.getResponseBodyAsString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        } catch (Exception e) {
            logger.error("ML service call failed", e);
            Map<String, Object> err = Map.of("error", "ML service error", "details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }



    private static final Logger log = LoggerFactory.getLogger(UserMlController.class);

    @PostMapping("/user/{id}/anomaly")
    public ResponseEntity<?> anomaly(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        try {

            List<StressHistory> history = historyRepo.findByUserIdOrderByCreatedAtAsc(id);


            List<Double> numeric = history.stream()
                    .map(StressHistory::getStressScore)
                    .filter(Objects::nonNull)
                    .map(v -> {
                        try {
                            if (v instanceof Number) return ((Number) v).doubleValue();
                            return Double.valueOf(v.toString());
                        } catch (Exception ex) {
                            logger.warn("Skipping non-numeric stressScore for user {}: {}", id, v);
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            final int REQUIRED = 10;
            boolean force = false;
            if (body != null && body.get("force") != null) {
                try {
                    force = Boolean.parseBoolean(body.get("force").toString());
                } catch (Exception ex) {

                }
            }

            if (numeric.size() < REQUIRED && !force) {
                return ResponseEntity.ok(Map.of(
                        "enoughData", false,
                        "count", numeric.size(),
                        "message", "Need at least 10 logs for anomaly detection"
                ));
            }



            List<Double> last10 = numeric.subList(Math.max(0, numeric.size() - REQUIRED), numeric.size());

            double avg = last10.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);


            Map<String, Object> mlPayload = Map.of("value", avg);

            logger.debug("Calling ML anomaly for user {} with last10={} avg={} payload={}", id, last10, avg, mlPayload);


            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(mlPayload, headers);


            ResponseEntity<Map> res;
            try {
                res = template.postForEntity(ML_BASE + "/predict/anomaly", entity, Map.class);
            } catch (org.springframework.web.client.HttpServerErrorException serverErr) {
                String resp = serverErr.getResponseBodyAsString();
                logger.error("ML service returned 5xx: {}", resp, serverErr);
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("error", "ML service error", "details", resp));
            } catch (org.springframework.web.client.ResourceAccessException rae) {
                logger.error("Cannot reach ML service", rae);
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("error", "ML service unreachable", "details", rae.getMessage()));
            }

            Map<?,?> mlBody = res.getBody();
            logger.debug("ML anomaly response status={}, body={}", res.getStatusCodeValue(), mlBody);


            return ResponseEntity.ok(Map.of(
                    "enoughData", true,
                    "last10", last10,
                    "avg", avg,
                    "ml", mlBody
            ));

        } catch (Exception e) {
            logger.error("Error computing anomaly for user " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error", "details", e.getMessage()));
        }
    }



}
