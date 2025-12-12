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


    // Local ML service base URL (development)
    private static final String ML_BASE = "http://localhost:8000";


    @GetMapping("/user/{id}/trend")
    public ResponseEntity<?> trend(@PathVariable Long id) {
        List<StressHistory> history = historyRepo.findByUserIdOrderByCreatedAtAsc(id);

        // Extract numeric stressScore values, skip non-numeric / null entries
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

        // Ensure we always send exactly `required` values to ML
        // - If no history, send zeros
        // - If fewer than required, pad with last known value
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
            // ML rejected the payload — surface ML response for easier debugging
            logger.error("ML service rejected payload: {} -> {}", req, bad.getResponseBodyAsString());
            Map<String, Object> err = Map.of("error", "ML service rejected payload", "details", bad.getResponseBodyAsString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        } catch (Exception e) {
            // Generic ML failure handling
            logger.error("ML service call failed", e);
            Map<String, Object> err = Map.of("error", "ML service error", "details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }



    // Note: duplicate logger variable left here (unused).
    private static final Logger log = LoggerFactory.getLogger(UserMlController.class);

}
