package com.mentalsense.backend.repo;

import com.mentalsense.backend.model.StressHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;

public interface StressHistoryRepo extends JpaRepository<StressHistory, Long> {


    List<StressHistory> findByUserIdOrderByCreatedAtAsc(Long userId);


    @Query("SELECT DISTINCT sh.userId FROM StressHistory sh")
    List<Long> findDistinctUserIds();

    List<StressHistory> findByUserIdAndCreatedAtBetween(Long userId, Instant from, Instant to);
}