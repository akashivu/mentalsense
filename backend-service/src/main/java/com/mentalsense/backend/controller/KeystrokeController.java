package com.mentalsense.backend.controller;

import org.springframework.web.bind.annotation.*;
import com.mentalsense.backend.model.KeystrokeLog;
import com.mentalsense.backend.repo.KeystrokeRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/keystroke")
public class KeystrokeController {

    @Autowired
    private KeystrokeRepo repo;

    @PostMapping("/log")
    public ResponseEntity<?> log(@RequestBody KeystrokeLog payload) {
        KeystrokeLog saved = repo.save(payload);
        return ResponseEntity.ok(saved);
    }
}

