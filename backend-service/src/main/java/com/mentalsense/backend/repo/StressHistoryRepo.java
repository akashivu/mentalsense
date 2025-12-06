package com.mentalsense.backend.repo;

import com.mentalsense.backend.model.StressHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface StressHistoryRepo extends JpaRepository<StressHistory, Long> {



    List<StressHistory> findByUserIdOrderByCreatedAtAsc(Long userId);

    List<StressHistory> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT DISTINCT sh.userId FROM StressHistory sh")
    List<Long> findDistinctUserIds();

    List<StressHistory> findByUserIdAndCreatedAtBetween(
            Long userId,
            Instant from,
            Instant to
    );



    // Combined
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
    List<Object[]> findHourlyAvgCombined(@Param("uid") Long uid,
                                         @Param("from") Instant from);

    // Keystroke-only
    @Query(value = """
        SELECT EXTRACT(HOUR FROM sh.created_at) AS hour,
               AVG(sh.keystroke_score)         AS avg_stress
        FROM stress_history sh
        WHERE sh.user_id = :uid
          AND sh.created_at >= :from
          AND sh.keystroke_score IS NOT NULL
        GROUP BY EXTRACT(HOUR FROM sh.created_at)
        ORDER BY hour
        """,
            nativeQuery = true)
    List<Object[]> findHourlyAvgKeystroke(@Param("uid") Long uid,
                                          @Param("from") Instant from);

    // Emotion/text-only
    @Query(value = """
        SELECT EXTRACT(HOUR FROM sh.created_at) AS hour,
               AVG(sh.text_score)              AS avg_stress
        FROM stress_history sh
        WHERE sh.user_id = :uid
          AND sh.created_at >= :from
          AND sh.text_score IS NOT NULL
        GROUP BY EXTRACT(HOUR FROM sh.created_at)
        ORDER BY hour
        """,
            nativeQuery = true)
    List<Object[]> findHourlyAvgText(@Param("uid") Long uid,
                                     @Param("from") Instant from);


    @Deprecated
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




    // Combined
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
    List<Object[]> findDowAvgCombined(@Param("uid") Long uid,
                                      @Param("from") Instant from);

    // Keystroke-only
    @Query(value = """
        SELECT EXTRACT(DOW FROM sh.created_at) AS dow,
               AVG(sh.keystroke_score)        AS avg_stress
        FROM stress_history sh
        WHERE sh.user_id = :uid
          AND sh.created_at >= :from
          AND sh.keystroke_score IS NOT NULL
        GROUP BY EXTRACT(DOW FROM sh.created_at)
        ORDER BY dow
        """,
            nativeQuery = true)
    List<Object[]> findDowAvgKeystroke(@Param("uid") Long uid,
                                       @Param("from") Instant from);

    // Emotion/text-only
    @Query(value = """
        SELECT EXTRACT(DOW FROM sh.created_at) AS dow,
               AVG(sh.text_score)             AS avg_stress
        FROM stress_history sh
        WHERE sh.user_id = :uid
          AND sh.created_at >= :from
          AND sh.text_score IS NOT NULL
        GROUP BY EXTRACT(DOW FROM sh.created_at)
        ORDER BY dow
        """,
            nativeQuery = true)
    List<Object[]> findDowAvgText(@Param("uid") Long uid,
                                  @Param("from") Instant from);


    @Deprecated
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



    // Combined
    @Query(value = """
        SELECT DATE(sh.created_at) AS day,
               AVG(sh.stress_score) AS avg_stress
        FROM stress_history sh
        WHERE sh.user_id = :uid
          AND sh.created_at >= :from
          AND sh.stress_score IS NOT NULL
        GROUP BY DATE(sh.created_at)
        ORDER BY day
        """,
            nativeQuery = true)
    List<Object[]> findDailyAvgCombined(@Param("uid") Long uid,
                                        @Param("from") Instant from);

    // Keystroke-only
    @Query(value = """
        SELECT DATE(sh.created_at) AS day,
               AVG(sh.keystroke_score) AS avg_stress
        FROM stress_history sh
        WHERE sh.user_id = :uid
          AND sh.created_at >= :from
          AND sh.keystroke_score IS NOT NULL
        GROUP BY DATE(sh.created_at)
        ORDER BY day
        """,
            nativeQuery = true)
    List<Object[]> findDailyAvgKeystroke(@Param("uid") Long uid,
                                         @Param("from") Instant from);

    // Emotion/text-only
    @Query(value = """
        SELECT DATE(sh.created_at) AS day,
               AVG(sh.text_score) AS avg_stress
        FROM stress_history sh
        WHERE sh.user_id = :uid
          AND sh.created_at >= :from
          AND sh.text_score IS NOT NULL
        GROUP BY DATE(sh.created_at)
        ORDER BY day
        """,
            nativeQuery = true)
    List<Object[]> findDailyAvgText(@Param("uid") Long uid,
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



    // Combined
    @Query("""
        SELECT AVG(sh.stressScore)
        FROM StressHistory sh
        WHERE sh.userId = :uid
          AND sh.createdAt >= :from
          AND sh.createdAt < :to
        """)
    Double avgCombinedBetween(
            @Param("uid") Long uid,
            @Param("from") Instant from,
            @Param("to") Instant to
    );

    // Keystroke
    @Query("""
        SELECT AVG(sh.keystrokeScore)
        FROM StressHistory sh
        WHERE sh.userId = :uid
          AND sh.createdAt >= :from
          AND sh.createdAt < :to
          AND sh.keystrokeScore IS NOT NULL
        """)
    Double avgKeystrokeBetween(
            @Param("uid") Long uid,
            @Param("from") Instant from,
            @Param("to") Instant to
    );

    // Emotion/text
    @Query("""
        SELECT AVG(sh.textScore)
        FROM StressHistory sh
        WHERE sh.userId = :uid
          AND sh.createdAt >= :from
          AND sh.createdAt < :to
          AND sh.textScore IS NOT NULL
        """)
    Double avgTextBetween(
            @Param("uid") Long uid,
            @Param("from") Instant from,
            @Param("to") Instant to
    );


    @Deprecated
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
