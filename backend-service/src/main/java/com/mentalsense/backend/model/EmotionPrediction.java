package com.mentalsense.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "emotion_prediction")
public class EmotionPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(columnDefinition = "text")
    private String text;

    private String label;

    @Lob
    @Column(name = "scores_json", columnDefinition = "text")
    private String scoresJson;

    private Double stressScore;

    private Instant createdAt = Instant.now();


    public EmotionPrediction() {}


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getScoresJson() { return scoresJson; }
    public void setScoresJson(String scoresJson) { this.scoresJson = scoresJson; }

    public Double getStressScore() { return stressScore; }
    public void setStressScore(Double stressScore) { this.stressScore = stressScore; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
