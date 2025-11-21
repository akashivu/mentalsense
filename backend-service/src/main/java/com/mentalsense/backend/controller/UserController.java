package com.mentalsense.backend.controller;



import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.mentalsense.backend.repo.UserRepo;
import com.mentalsense.backend.model.User;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.ResponseEntity;

@RestController
public class UserController {

    @Autowired
    private UserRepo userRepo;

    @PutMapping("/user/{id}/baseline")
    public ResponseEntity<?> updateBaseline(@PathVariable Long id, @RequestBody Map<String,Object> body) {
        Optional<User> uOpt = userRepo.findById(id);
        if(uOpt.isEmpty()) return ResponseEntity.status(404).build();
        User u = uOpt.get();
        if(body.containsKey("baselineTypingSpeed")) u.setBaselineTypingSpeed(Double.valueOf(body.get("baselineTypingSpeed").toString()));
        if(body.containsKey("baselineStress")) u.setBaselineStress(Double.valueOf(body.get("baselineStress").toString()));
        userRepo.save(u);
        return ResponseEntity.ok(u);
    }
}
