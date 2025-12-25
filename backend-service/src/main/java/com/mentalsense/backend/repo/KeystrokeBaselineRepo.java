package com.mentalsense.backend.repo;

import com.mentalsense.backend.model.KeystrokeBaseline;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KeystrokeBaselineRepo extends JpaRepository<KeystrokeBaseline, Long> {
}
