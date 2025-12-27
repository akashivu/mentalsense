

export const DEMO_PREDICTIONS = [
  { ts: "2025-09-01T09:00:00Z", combined_score: 0.15 },
  { ts: "2025-09-01T15:00:00Z", combined_score: 0.18 },
  { ts: "2025-09-02T09:00:00Z", combined_score: 0.22 },
  { ts: "2025-09-02T15:00:00Z", combined_score: 0.25 },
  { ts: "2025-09-03T09:00:00Z", combined_score: 0.28 },
  { ts: "2025-09-03T15:00:00Z", combined_score: 0.32 },
  { ts: "2025-09-04T09:00:00Z", combined_score: 0.35 },
  { ts: "2025-09-04T15:00:00Z", combined_score: 0.38 },
  { ts: "2025-09-05T09:00:00Z", combined_score: 0.42 },
  { ts: "2025-09-05T15:00:00Z", combined_score: 0.45 },
  { ts: "2025-09-06T09:00:00Z", combined_score: 0.48 },
  { ts: "2025-09-06T15:00:00Z", combined_score: 0.52 },
  { ts: "2025-09-07T09:00:00Z", combined_score: 0.55 },
  { ts: "2025-09-07T15:00:00Z", combined_score: 0.53 },
  { ts: "2025-09-08T09:00:00Z", combined_score: 0.50 },
  { ts: "2025-09-08T15:00:00Z", combined_score: 0.47 },
  { ts: "2025-09-09T09:00:00Z", combined_score: 0.45 },
  { ts: "2025-09-09T15:00:00Z", combined_score: 0.48 },
  { ts: "2025-09-10T09:00:00Z", combined_score: 0.52 },
  { ts: "2025-09-10T15:00:00Z", combined_score: 0.55 },
  { ts: "2025-09-11T09:00:00Z", combined_score: 0.58 },
  { ts: "2025-09-11T15:00:00Z", combined_score: 0.62 },
  { ts: "2025-09-12T09:00:00Z", combined_score: 0.65 },
  { ts: "2025-09-12T15:00:00Z", combined_score: 0.68 },
  { ts: "2025-09-13T09:00:00Z", combined_score: 0.72 },
  { ts: "2025-09-13T15:00:00Z", combined_score: 0.75 },
  { ts: "2025-09-14T09:00:00Z", combined_score: 0.78 },
  { ts: "2025-09-14T15:00:00Z", combined_score: 0.82 },
  { ts: "2025-09-15T09:00:00Z", combined_score: 0.85 },
  { ts: "2025-09-15T15:00:00Z", combined_score: 0.83 },
  { ts: "2025-09-16T09:00:00Z", combined_score: 0.80 },
  { ts: "2025-09-16T15:00:00Z", combined_score: 0.77 },
  { ts: "2025-09-17T09:00:00Z", combined_score: 0.74 },
  { ts: "2025-09-17T15:00:00Z", combined_score: 0.71 },
  { ts: "2025-09-18T09:00:00Z", combined_score: 0.68 },
  { ts: "2025-09-18T15:00:00Z", combined_score: 0.65 },
  { ts: "2025-09-19T09:00:00Z", combined_score: 0.62 },
  { ts: "2025-09-19T15:00:00Z", combined_score: 0.59 },
  { ts: "2025-09-20T09:00:00Z", combined_score: 0.56 },
  { ts: "2025-09-20T15:00:00Z", combined_score: 0.53 },
  { ts: "2025-09-21T09:00:00Z", combined_score: 0.50 },
  { ts: "2025-09-21T15:00:00Z", combined_score: 0.47 },
  { ts: "2025-09-22T09:00:00Z", combined_score: 0.44 },
  { ts: "2025-09-22T15:00:00Z", combined_score: 0.41 },
];



export const DEMO_PAST = DEMO_PREDICTIONS.map(
  (p) => p.combined_score
);


export const DEMO_WEEKLY_STATS = {
  thisWeek: 0.47, 
  lastWeek: 0.55,   
  trend: "down",    
};


export const DEMO_HOURLY = [
  0.10, 0.08, 0.07, 0.06, 0.08, 0.12,
  0.22, 0.35, 0.48, 0.55, 0.60, 0.58, 
  0.56, 0.52, 0.50, 0.47, 0.44, 0.46, 
  0.50, 0.48, 0.40, 0.32, 0.22, 0.15, 
];


export const DEMO_DOW = [
  0.35,
  0.52, 
  0.58, 
  0.60, 
  0.54, 
  0.46, 
  0.38,
];



export const DEMO_MOOD_DAYS = Array.from({ length: 28 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (27 - i));

  const base = 0.42 + Math.sin(i / 4) * 0.08;
  const noise = Math.sin(i * 1.7) * 0.02;

  return {
    day: d.toISOString().split("T")[0],
    avgStress: Math.min(0.7, Math.max(0.3, base + noise)),
  };
});



export const DEMO_DAILY_TREND = [
  { day: "Mon", avgStress: 0.58 },
  { day: "Tue", avgStress: 0.61 },
  { day: "Wed", avgStress: 0.63 },
  { day: "Thu", avgStress: 0.56 },
  { day: "Fri", avgStress: 0.51 },
  { day: "Sat", avgStress: 0.45 },
  { day: "Sun", avgStress: 0.41 },
];
//--------------------------------------------------------------------------------------------------
export const DEMO_ENGAGEMENT = Array.from({ length: 30 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));

  const base = 6 + i * 0.6;          
  const wave = Math.sin(i / 4) * 2;  
  const dip = i % 7 === 0 ? -3 : 0;  

  return {
    date: d,
    count: Math.max(2, Math.round(base + wave + dip)),
  };
});

