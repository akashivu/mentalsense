package com.mentalsense.backend.repo;


import org.springframework.data.jpa.repository.JpaRepository;
import com.mentalsense.backend.model.KeystrokeLog;

public interface KeystrokeRepo extends JpaRepository<KeystrokeLog, Long> { }
