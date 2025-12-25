package com.mentalsense.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "keystroke_baseline")
public class KeystrokeBaseline {

    @Id
    private Long userId;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Double getMeanDwell() {
        return meanDwell;
    }

    public void setMeanDwell(Double meanDwell) {
        this.meanDwell = meanDwell;
    }

    public Double getStdDwell() {
        return stdDwell;
    }

    public void setStdDwell(Double stdDwell) {
        this.stdDwell = stdDwell;
    }

    public Double getMeanFlight() {
        return meanFlight;
    }

    public void setMeanFlight(Double meanFlight) {
        this.meanFlight = meanFlight;
    }

    public Double getStdFlight() {
        return stdFlight;
    }

    public void setStdFlight(Double stdFlight) {
        this.stdFlight = stdFlight;
    }

    public Double getMeanPause() {
        return meanPause;
    }

    public void setMeanPause(Double meanPause) {
        this.meanPause = meanPause;
    }

    public Double getStdPause() {
        return stdPause;
    }

    public void setStdPause(Double stdPause) {
        this.stdPause = stdPause;
    }

    public Double getErrorRate() {
        return errorRate;
    }

    public void setErrorRate(Double errorRate) {
        this.errorRate = errorRate;
    }

    public Integer getSamples() {
        return samples;
    }

    public void setSamples(Integer samples) {
        this.samples = samples;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    private Double meanDwell;
    private Double stdDwell;

    private Double meanFlight;
    private Double stdFlight;

    private Double meanPause;
    private Double stdPause;

    private Double errorRate;

    private Integer samples;

    private Instant updatedAt;
}
