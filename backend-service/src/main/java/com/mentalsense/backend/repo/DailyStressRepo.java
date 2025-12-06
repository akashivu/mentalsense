package com.mentalsense.backend.repo;

import com.mentalsense.backend.model.DailyStress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyStressRepo extends JpaRepository<DailyStress, Long> {

    Optional<DailyStress> findByUserIdAndDay(Long userId, LocalDate day);

    List<DailyStress> findByUserIdAndDayAfterOrderByDayAsc(Long userId, LocalDate day);

    List<DailyStress> findByUserIdOrderByDayDesc(Long userId);


    @Query("SELECT AVG(d.avgStress) FROM DailyStress d " +
            "WHERE d.userId = :userId AND d.day >= :start AND d.day < :end")
    Double avgStressBetween(@Param("userId") Long userId,
                            @Param("start") LocalDate start,
                            @Param("end") LocalDate end);
}
