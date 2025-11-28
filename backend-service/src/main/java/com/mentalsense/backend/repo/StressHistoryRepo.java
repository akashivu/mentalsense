package com.mentalsense.backend.repo;

import com.mentalsense.backend.model.StressHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StressHistoryRepo extends JpaRepository<StressHistory, Long> {
    List<StressHistory> findByUserIdOrderByCreatedAtAsc(Long userId);
}
