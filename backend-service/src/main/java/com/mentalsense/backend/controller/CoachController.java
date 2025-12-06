package com.mentalsense.backend.controller;

import com.mentalsense.backend.service.CoachService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/coach")
public class CoachController {

    @Autowired
    private CoachService coachService;

    @GetMapping("/advice")
    public ResponseEntity<?> getAdvice(HttpServletRequest request) {
        Object uAttr = request.getAttribute("userId");
        if (uAttr == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "not authenticated"));
        }

        Long userId = Long.valueOf(uAttr.toString());
        Map<String, Object> advice = coachService.buildAdvice(userId);
        return ResponseEntity.ok(advice);
    }
}
