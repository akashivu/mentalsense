package com.mentalsense.backend.repo;

import com.mentalsense.backend.model.DailyStress;
import com.mentalsense.backend.model.StressHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyStressRepo extends JpaRepository<DailyStress, Long> {

    Optional<DailyStress> findByUserIdAndDay(Long userId, LocalDate day);
    List<DailyStress> findByUserIdAndDayAfterOrderByDayAsc(Long userId, LocalDate day);
    List<DailyStress> findByUserIdOrderByDayDesc(Long userId);

}
