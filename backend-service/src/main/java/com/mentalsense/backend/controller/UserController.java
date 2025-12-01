package com.mentalsense.backend.controller;



import com.mentalsense.backend.model.StressHistory;
import com.mentalsense.backend.repo.StressHistoryRepo;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.mentalsense.backend.repo.UserRepo;
import com.mentalsense.backend.model.User;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class UserController {

    private final StressHistoryRepo stressHistoryRepo;
    private final UserRepo userRepo;

    public UserController(StressHistoryRepo stressHistoryRepo, UserRepo userRepo) {
        this.stressHistoryRepo = stressHistoryRepo;
        this.userRepo = userRepo;
    }

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
    @PutMapping("/{id}/baseline/compute")
    public ResponseEntity<?> computeBaseline(@PathVariable Long id) {
        List<StressHistory> list = stressHistoryRepo.findByUserIdOrderByCreatedAtAsc(id);
        if (list == null || list.size() < 5) {
            return ResponseEntity.badRequest().body(Map.of("error", "need 5+ samples"));
        }

        int N = 20;
        List<StressHistory> last = list.size() > N ? list.subList(list.size() - N, list.size()) : list;

        double baseline = last.stream()
                .mapToDouble(StressHistory::getStressScore)
                .average()
                .orElse(0.0);

        User u = userRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        u.setBaselineStress(baseline);
        userRepo.save(u);

        return ResponseEntity.ok(Map.of("baseline", baseline));
    }
}
