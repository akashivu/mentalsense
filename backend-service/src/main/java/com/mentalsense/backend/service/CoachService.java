package com.mentalsense.backend.service;

import com.mentalsense.backend.repo.DailyStressRepo;
import com.mentalsense.backend.repo.EmotionPredictionRepo;
import com.mentalsense.backend.repo.StressHistoryRepo;
import com.mentalsense.backend.model.StressHistory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Service
public class CoachService {

    @Autowired
    private DailyStressRepo dailyStressRepo;

    @Autowired
    private StressHistoryRepo stressHistoryRepo;

    @Autowired
    private EmotionPredictionRepo emotionPredictionRepo;

    public Map<String, Object> buildAdvice(Long userId) {
        Map<String, Object> ctx = collectContext(userId);
        return generateAdvice(ctx);
    }

    // Gather signals used to generate user-specific advice
    private Map<String, Object> collectContext(Long userId) {
        Map<String, Object> ctx = new HashMap<>();

        LocalDate now = LocalDate.now();
        LocalDate lastWeekStart = now.minusDays(7);
        LocalDate prevWeekStart = now.minusDays(14);

        // Weekly averages (may return null from repo)
        Double thisWeekAvg = dailyStressRepo.avgStressBetween(userId, lastWeekStart, now);
        Double lastWeekAvg = dailyStressRepo.avgStressBetween(userId, prevWeekStart, lastWeekStart);
        if (thisWeekAvg == null) thisWeekAvg = 0.0;
        if (lastWeekAvg == null) lastWeekAvg = 0.0;

        // Small hysteresis (+/-0.05) to avoid jittery trend labels
        String trend;
        if (thisWeekAvg > lastWeekAvg + 0.05) {
            trend = "increasing";
        } else if (thisWeekAvg + 0.05 < lastWeekAvg) {
            trend = "decreasing";
        } else {
            trend = "stable";
        }

        ctx.put("thisWeekAvg", thisWeekAvg);
        ctx.put("lastWeekAvg", lastWeekAvg);
        ctx.put("trend", trend);

        // Latest individual score from history (most recent entry)
        List<StressHistory> history = stressHistoryRepo.findByUserIdOrderByCreatedAtDesc(userId);
        Double latestScore = history.isEmpty() ? null : history.get(0).getStressScore();
        ctx.put("latestScore", latestScore);

        // Hourly averages for last 7 days
        Instant from = Instant.now().minusSeconds(7L * 24 * 3600);
        double[] byHour = new double[24];
        List<Object[]> hourly = stressHistoryRepo.findHourlyAvgStress(userId, from);
        for (Object[] r : hourly) {
            int hour = ((Number) r[0]).intValue();
            double avg = ((Number) r[1]).doubleValue();
            if (hour >= 0 && hour < 24) {
                byHour[hour] = avg;
            }
        }
        ctx.put("byHour", byHour);

        // Day-of-week averages for last 28 days
        Instant fromDow = Instant.now().minusSeconds(28L * 24 * 3600);
        double[] byDow = new double[7];
        List<Object[]> dowRows = stressHistoryRepo.findDowAvgStress(userId, fromDow);
        for (Object[] r : dowRows) {
            int dow = ((Number) r[0]).intValue();   // 0–6 from native query (EXTRACT(DOW))
            double avg = ((Number) r[1]).doubleValue();
            if (dow >= 0 && dow < 7) {
                byDow[dow] = avg;
            }
        }
        ctx.put("byDow", byDow);

        // Count of recent very-high combined scores (used for escalation suggestions)
        List<Double> recentScores = emotionPredictionRepo
                .findTopCombinedScoresForUser(userId, PageRequest.of(0, 50));

        long highCount = recentScores.stream()
                .filter(score -> score != null && score > 0.75)
                .count();

        ctx.put("recentHighCount", highCount);

        return ctx;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> generateAdvice(Map<String, Object> ctx) {
        Double thisWeek = (Double) ctx.get("thisWeekAvg");
        Double lastWeek = (Double) ctx.get("lastWeekAvg");
        String trend = (String) ctx.get("trend");
        Double latest = (Double) ctx.get("latestScore");
        double[] byHour = (double[]) ctx.get("byHour");
        double[] byDow = (double[]) ctx.get("byDow");
        long recentHighCount = (Long) ctx.get("recentHighCount");

        List<String> tips = new ArrayList<>();
        List<String> tags = new ArrayList<>();

        // Severity buckets drive tone and escalation suggestions
        String severity;
        if (thisWeek >= 0.7 || (latest != null && latest >= 0.8)) {
            severity = "HIGH";
        } else if (thisWeek >= 0.4) {
            severity = "MEDIUM";
        } else {
            severity = "LOW";
        }

        String title;
        StringBuilder summary = new StringBuilder();

        // Human-friendly trend/title and short summary
        if ("increasing".equals(trend) && thisWeek > lastWeek) {
            title = "Your stress has been increasing recently";
            summary.append("Your average stress this week is higher than last week. ");
            tags.add("trend-up");
        } else if ("decreasing".equals(trend) && thisWeek < lastWeek) {
            title = "Nice work — your stress is improving";
            summary.append("Your average stress has decreased compared to last week. ");
            tags.add("trend-down");
        } else {
            title = "Your stress is relatively stable";
            summary.append("Your stress levels are relatively stable week-to-week. ");
            tags.add("stable");
        }

        if (latest != null) {
            summary.append("Your latest stress score is around ")
                    .append(Math.round(latest * 100))
                    .append("%.");
        }

        // Peak hour analysis — suggest concrete actions tied to time-of-day
        int peakHour = maxIndex(byHour);
        if (byHour[peakHour] > 0) {
            if (peakHour >= 21 || peakHour <= 5) {
                summary.append(" You tend to be most stressed at night.");
                tags.add("night-stress");
                tips.add("Avoid intense screen time at least 30 minutes before sleep.");
                tips.add("Try a short breathing exercise or journaling around " + peakHour + ":00.");
            } else if (peakHour >= 9 && peakHour <= 18) {
                summary.append(" You tend to be most stressed during work hours.");
                tags.add("work-stress");
                tips.add("Schedule a 5–10 minute break around " + peakHour + ":00.");
                tips.add("Try not to stack too many demanding tasks in that hour.");
            } else {
                summary.append(" You have a noticeable stress peak around " + peakHour + ":00.");
                tips.add("Plan a small pause or walk around that time.");
            }
        }

        // Day-of-week pattern — short actionable suggestions
        int peakDow = maxIndex(byDow);
        String[] dowNames = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
        if (byDow[peakDow] > 0) {
            summary.append(" Your most stressful day tends to be ").append(dowNames[peakDow]).append(".");
            tags.add("dow-pattern");
            if (peakDow >= 1 && peakDow <= 5) {
                tips.add("Try to plan something relaxing on " + dowNames[peakDow] + " evenings.");
            } else {
                tips.add("Protect your weekends by scheduling rest time, especially on " + dowNames[peakDow] + ".");
            }
        }

        // Escalation hints if many recent high scores
        if (recentHighCount >= 5) {
            tags.add("frequent-high");
            tips.add("You've had several very high stress moments recently. Consider talking to someone you trust about it.");
            tips.add("If stress feels unmanageable, consider reaching out to a mental health professional.");
        }

        // Generic fallback tips
        if (tips.isEmpty()) {
            tips.add("Take short breaks away from screens during the day.");
            tips.add("Pay attention to when your body feels tense and do a quick stretch.");
            tips.add("Try keeping a small log of what triggers your stress and what helps.");
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("severity", severity);
        resp.put("title", title);
        resp.put("summary", summary.toString());
        resp.put("tips", tips);
        resp.put("tags", tags);
        return resp;
    }

    // Utility: return index of max element (works with padded arrays)
    private int maxIndex(double[] arr) {
        int idx = 0;
        double max = Double.NEGATIVE_INFINITY;
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] > max) {
                max = arr[i];
                idx = i;
            }
        }
        return idx;
    }
}
