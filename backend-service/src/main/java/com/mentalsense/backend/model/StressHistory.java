package com.mentalsense.backend.model;

import jakarta.persistence.*;

import java.time.Instant;
@Entity
public class StressHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Double stressScore;
    @Column(name = "typing_speed")
    private Double typingSpeed;
    @Column(name = "avg_key_hold")
    private Double avgKeyHold;
    @Column(name = "backspace_rate")
    private Double backspaceRate;

    private Instant createdAt = Instant.now();


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Double getStressScore() { return stressScore; }
    public void setStressScore(Double stressScore) { this.stressScore = stressScore; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public void setTypingSpeed(double typingSpeed) {
    }

    public void setRawSample(String rawText) {
    }

    public void setAvgKeyHold(double avgKeyHold) {
    }

    public void setBackspaceRate(double backspaceRate) {
    }
}
