package com.mentalsense.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "stress_history")
public class StressHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;


    @Column(name = "stress_score")
    private Double stressScore;


    @Column(name = "keystroke_score")
    private Double keystrokeScore;


    @Column(name = "text_score")
    private Double textScore;


    @Column(name = "typing_speed")
    private Double typingSpeed;

    @Column(name = "avg_key_hold")
    private Double avgKeyHold;

    @Column(name = "backspace_rate")
    private Double backspaceRate;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();




    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Double getStressScore() {
        return stressScore;
    }
    public void setStressScore(Double stressScore) {
        this.stressScore = stressScore;
    }

    public Double getKeystrokeScore() {
        return keystrokeScore;
    }
    public void setKeystrokeScore(Double keystrokeScore) {
        this.keystrokeScore = keystrokeScore;
    }

    public Double getTextScore() {
        return textScore;
    }
    public void setTextScore(Double textScore) {
        this.textScore = textScore;
    }

    public Double getTypingSpeed() {
        return typingSpeed;
    }
    public void setTypingSpeed(Double typingSpeed) {
        this.typingSpeed = typingSpeed;
    }

    public Double getAvgKeyHold() {
        return avgKeyHold;
    }
    public void setAvgKeyHold(Double avgKeyHold) {
        this.avgKeyHold = avgKeyHold;
    }

    public Double getBackspaceRate() {
        return backspaceRate;
    }
    public void setBackspaceRate(Double backspaceRate) {
        this.backspaceRate = backspaceRate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }


}
