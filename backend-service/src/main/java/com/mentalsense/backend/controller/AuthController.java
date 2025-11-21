package com.mentalsense.backend.controller;



import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.mentalsense.backend.model.User;
import com.mentalsense.backend.repo.UserRepo;
import com.mentalsense.backend.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private JwtUtil jwtUtil;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String,String> body) {
        String email = body.get("email");
        if(email == null || body.get("password") == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email and password required"));
        }
        Optional<User> existing = userRepo.findByEmail(email);
        if(existing.isPresent()) return ResponseEntity.badRequest().body(Map.of("error","Email already registered"));

        User u = new User();
        u.setEmail(email);
        u.setName(body.get("name"));
        u.setPassword(encoder.encode(body.get("password")));
        userRepo.save(u);
        return ResponseEntity.ok(Map.of("message","registered","userId", u.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> body) {
        String email = body.get("email");
        String pass = body.get("password");
        if(email == null || pass == null) return ResponseEntity.badRequest().body(Map.of("error","email and password required"));
        Optional<User> userOpt = userRepo.findByEmail(email);
        if(userOpt.isEmpty()) return ResponseEntity.status(401).body(Map.of("error","invalid credentials"));
        User user = userOpt.get();
        if(!encoder.matches(pass, user.getPassword())) return ResponseEntity.status(401).body(Map.of("error","invalid credentials"));
        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(Map.of("token", token, "userId", user.getId(), "email", user.getEmail()));
    }
}

