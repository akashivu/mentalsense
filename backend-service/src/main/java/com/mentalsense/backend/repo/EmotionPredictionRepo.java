package com.mentalsense.backend.repo;



import com.mentalsense.backend.model.EmotionPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmotionPredictionRepo extends JpaRepository<EmotionPrediction, Long> {
    List<EmotionPrediction> findByUserIdOrderByCreatedAtDesc(Long userId);
}
