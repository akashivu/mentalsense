package com.mentalsense.backend.repo;

import com.mentalsense.backend.model.StressHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface StressHistoryRepo extends JpaRepository<StressHistory, Long> {


    List<StressHistory> findByUserIdOrderByCreatedAtAsc(Long userId);


    @Query("SELECT DISTINCT sh.userId FROM StressHistory sh")
    List<Long> findDistinctUserIds();

    List<StressHistory> findByUserIdAndCreatedAtBetween(Long userId, Instant from, Instant to);
    @Query(value = """
    SELECT EXTRACT(HOUR FROM sh.created_at) AS hour,
           AVG(sh.stress_score)          AS avg_stress
    FROM stress_history sh
    WHERE sh.user_id = :uid
      AND sh.created_at >= :from
    GROUP BY EXTRACT(HOUR FROM sh.created_at)
    ORDER BY hour
    """,
            nativeQuery = true)
    List<Object[]> findHourlyAvgStress(@Param("uid") Long uid,
                                       @Param("from") Instant from);
    @Query(value = """
    SELECT EXTRACT(DOW FROM sh.created_at) AS dow,
           AVG(sh.stress_score)           AS avg_stress
    FROM stress_history sh
    WHERE sh.user_id = :uid
      AND sh.created_at >= :from
      AND sh.stress_score IS NOT NULL
    GROUP BY EXTRACT(DOW FROM sh.created_at)
    ORDER BY dow
    """,
            nativeQuery = true)
    List<Object[]> findDowAvgStress(@Param("uid") Long uid,
                                    @Param("from") Instant from);
    @Query(value = """
    SELECT DATE(sh.created_at) AS day,
           COUNT(sh.id)        AS cnt
    FROM stress_history sh
    WHERE sh.user_id = :uid
      AND sh.created_at >= :from
    GROUP BY DATE(sh.created_at)
    ORDER BY day
    """,
            nativeQuery = true)
    List<Object[]> findDailyEngagement(@Param("uid") Long uid,
                                       @Param("from") Instant from);
    @Query("""
    SELECT AVG(sh.stressScore)
    FROM StressHistory sh
    WHERE sh.userId = :uid
      AND sh.createdAt >= :from
      AND sh.createdAt < :to
""")
    Double avgStressBetween(
            @Param("uid") Long uid,
            @Param("from") Instant from,
            @Param("to") Instant to
    );

}