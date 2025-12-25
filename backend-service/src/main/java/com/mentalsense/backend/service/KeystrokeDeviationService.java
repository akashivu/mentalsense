package com.mentalsense.backend.service;

import com.mentalsense.backend.model.KeystrokeBaseline;
import org.springframework.stereotype.Service;

@Service
public class KeystrokeDeviationService {

    public double deviation(Double x, Double mean, Double std) {
        if (std == null || std == 0.0) return 0.0;
        if (x == null || mean == null) return 0.0;
        return Math.abs(x - mean) / std;
    }

    public double computeDeviation(
            KeystrokeBaseline b,
            Double dwell,
            Double flight,
            Double pause
    ) {
        double z1 = deviation(dwell, b.getMeanDwell(), b.getStdDwell());
        double z2 = deviation(flight, b.getMeanFlight(), b.getStdFlight());
        double z3 = deviation(pause, b.getMeanPause(), b.getStdPause());

        return (z1 + z2 + z3) / 3.0;
    }

    public double deviationToStress(double deviation) {
        return Math.min(1.0, deviation / 3.0);
    }
}

