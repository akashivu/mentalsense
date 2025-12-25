import SummaryCard from "./SummaryCard";
import StressModeTabs from "./StressModeTabs";
import MiniSparkline from "./MiniSparkline";

/**
 * HeroStressCard (Controlled Component)
 *
 * Role:
 * - Visual controller for stress mode
 * - Displays executive stress summary
 * - Delegates state control to parent (Dashboard)
 * - Explains signals in a calm, human way
 */
export default function HeroStressCard({
  data,
  stressMode,
  onChange,
}) {
  const current = data?.[stressMode];

  if (!current) return null;

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-5 flex flex-col gap-4">

      {/* Mode Tabs (GLOBAL CONTROLLER) */}
      <StressModeTabs
        mode={stressMode}
        onChange={onChange}
      />

      {/* Microcopy under tabs (clarity for new users) */}
      <p className="text-xs text-gray-500 leading-snug">
        {stressMode === "keystroke" &&
          "Based on how your typing rhythm deviates from your usual pattern."}
        {stressMode === "text" &&
          "Based on emotional tone detected in your writing."}
        {stressMode === "combined" &&
          "A combined view using both typing behavior and text signals."}
      </p>

      {/* Core Stress Summary */}
      <SummaryCard
        score={current.current}
        trend={current.trend}
        mode={stressMode}
      />

      {/* Mini Trend */}
      <MiniSparkline data={current.weekly} />

      {/* Supportive explanation (mental-health safe) */}
      <div className="text-xs text-blue-600 font-medium">
        {stressMode === "keystroke" &&
          "This signal adapts over time as MentalSense learns your personal typing baseline."}
        {stressMode === "text" &&
          "This signal reflects emotional patterns in your writing, not specific words."}
        {stressMode === "combined" &&
          "This view blends multiple signals to give a more balanced estimate."}
      </div>
    </div>
  );
}
