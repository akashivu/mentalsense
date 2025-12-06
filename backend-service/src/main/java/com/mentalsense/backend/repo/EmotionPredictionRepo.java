package com.mentalsense.backend.repo;

import com.mentalsense.backend.model.EmotionPrediction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmotionPredictionRepo extends JpaRepository<EmotionPrediction, Long> {

    List<EmotionPrediction> findByUserIdOrderByCreatedAtDesc(Long userId);


    @Query("SELECT e FROM EmotionPrediction e " +
            "WHERE e.userId = :uid AND e.combinedScore > :threshold " +
            "ORDER BY e.createdAt DESC")
    List<EmotionPrediction> findAnomaliesForUser(
            @Param("uid") Long userId,
            @Param("threshold") double threshold,
            Pageable pageable
    );


    @Query("SELECT e.combinedScore FROM EmotionPrediction e " +
            "WHERE e.userId = :uid AND e.combinedScore IS NOT NULL " +
            "ORDER BY e.createdAt DESC")
    List<Double> findTopCombinedScoresForUser(
            @Param("uid") Long userId,
            Pageable pageable
    );
}
