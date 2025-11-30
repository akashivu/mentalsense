package com.mentalsense.backend.job;

import com.mentalsense.backend.model.DailyStress;
import com.mentalsense.backend.model.StressHistory;
import com.mentalsense.backend.repo.DailyStressRepo;
import com.mentalsense.backend.repo.StressHistoryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.*;
import java.util.List;

@Component
public class DailyAggregationJob {

    @Autowired
    private StressHistoryRepo historyRepo;

    @Autowired
    private DailyStressRepo dailyRepo;


    @Scheduled(cron = "0 5 0 * * ?")
    public void aggregateDaily() {

        LocalDate yesterday = LocalDate.now().minusDays(1);

        Instant from = yesterday.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant to = yesterday.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        List<Long> userIds = historyRepo.findDistinctUserIds();

        for (Long uid : userIds) {

            List<StressHistory> list =
                    historyRepo.findByUserIdAndCreatedAtBetween(uid, from, to);

            if (list.isEmpty()) continue;

            double avg = list.stream()
                    .mapToDouble(StressHistory::getStressScore)
                    .average()
                    .orElse(0.0);

            DailyStress ds = dailyRepo
                    .findByUserIdAndDay(uid, yesterday)
                    .orElse(new DailyStress());

            ds.setUserId(uid);
            ds.setDay(yesterday);
            ds.setAvgStress(avg);

            dailyRepo.save(ds);
        }
    }
}
