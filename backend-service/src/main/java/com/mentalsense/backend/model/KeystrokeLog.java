package com.mentalsense.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class KeystrokeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private double typingSpeed;
    private double avgKeyHold;
    private double backspaceRate;
    private String rawSample;

    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public double getTypingSpeed() {
        return typingSpeed;
    }

    public void setTypingSpeed(double typingSpeed) {
        this.typingSpeed = typingSpeed;
    }

    public double getAvgKeyHold() {
        return avgKeyHold;
    }

    public void setAvgKeyHold(double avgKeyHold) {
        this.avgKeyHold = avgKeyHold;
    }

    public double getBackspaceRate() {
        return backspaceRate;
    }

    public void setBackspaceRate(double backspaceRate) {
        this.backspaceRate = backspaceRate;
    }

    public String getRawSample() {
        return rawSample;
    }

    public void setRawSample(String rawSample) {
        this.rawSample = rawSample;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}