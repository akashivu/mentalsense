package com.mentalsense.backend.service;

import com.mentalsense.backend.model.KeystrokeBaseline;
import com.mentalsense.backend.repo.KeystrokeBaselineRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class KeystrokeBaselineService {

    @Autowired
    private KeystrokeBaselineRepo repo;

    public KeystrokeBaseline updateBaseline(
            Long userId,
            double dwell,
            double flight,
            double pause,
            double errorRate
    ) {
        KeystrokeBaseline b =
                repo.findById(userId).orElseGet(() -> init(userId));

        int n = b.getSamples();

        b.setMeanDwell(updateMean(b.getMeanDwell(), dwell, n));
        b.setStdDwell(updateStd(b.getStdDwell(), b.getMeanDwell(), dwell, n));

        b.setMeanFlight(updateMean(b.getMeanFlight(), flight, n));
        b.setStdFlight(updateStd(b.getStdFlight(), b.getMeanFlight(), flight, n));

        b.setMeanPause(updateMean(b.getMeanPause(), pause, n));
        b.setStdPause(updateStd(b.getStdPause(), b.getMeanPause(), pause, n));

        b.setErrorRate(updateMean(b.getErrorRate(), errorRate, n));

        b.setSamples(n + 1);
        b.setUpdatedAt(Instant.now());

        return repo.save(b);
    }

    private KeystrokeBaseline init(Long userId) {
        KeystrokeBaseline b = new KeystrokeBaseline();
        b.setUserId(userId);
        b.setMeanDwell(0.0);
        b.setStdDwell(1.0);
        b.setMeanFlight(0.0);
        b.setStdFlight(1.0);
        b.setMeanPause(0.0);
        b.setStdPause(1.0);
        b.setErrorRate(0.0);
        b.setSamples(0);
        return b;
    }

    private double updateMean(double oldMean, double x, int n) {
        return (n == 0) ? x : oldMean + (x - oldMean) / (n + 1);
    }

    private double updateStd(double oldStd, double mean, double x, int n) {
        if (n < 2) return 1.0;
        return Math.sqrt(((n - 1) * oldStd * oldStd + (x - mean) * (x - mean)) / n);
    }
}
