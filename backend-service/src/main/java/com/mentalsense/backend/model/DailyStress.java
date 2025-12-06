package com.mentalsense.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

@Entity
public class DailyStress {
    @Id
    @GeneratedValue
    private Long id;
    private Long userId;
    private Double avgStress;
    private LocalDate day;
    private Instant createdAt = Instant.now();

    public void setUserId(Long uid) {
        this.userId = uid;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public Double getAvgStress() {
        return avgStress;
    }

    public void setAvgStress(Double avgStress) {
        this.avgStress = avgStress;
    }

    public LocalDate getDay() {
        return day;
    }

    public void setDay(LocalDate day) {
        this.day = day;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}