package com.mentalsense.backend.controller;

import org.springframework.web.bind.annotation.*;
import com.mentalsense.backend.model.KeystrokeLog;
import com.mentalsense.backend.repo.KeystrokeRepo;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;


import java.util.Map;

@RestController
@RequestMapping("/keystroke")
public class KeystrokeController {

    @Autowired
    private KeystrokeRepo repo;

    @PostMapping("/log")
    public ResponseEntity<?> log(@RequestBody KeystrokeLog payload,HttpServletRequest request) {
        Object uid = request.getAttribute("userId");
        if(uid == null) return ResponseEntity.status(401).body(Map.of("error","Unauthorized"));
        Long userId = (Long) uid;
        payload.setUserId(userId);
        KeystrokeLog saved = repo.save(payload);
        return ResponseEntity.ok(saved);
    }
}

