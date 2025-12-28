
import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Briefcase,
  BookOpen,
  Sunrise,
  Sun,
  Moon,
  Bell,
  Hand,
  Target,
  Leaf,
  BarChart3,
  Check,
  ShieldCheck,
  Lock,
  Star,
} from "lucide-react";


const TOTAL_STEPS = 6;

const focusOptions = [
  { id: "work", label: "Work", description: "Stress from deadlines and meetings.", icon: <Briefcase className="w-4 h-4" /> },
  { id: "study", label: "Study", description: "Exams, assignments, and learning pressure.", icon: <BookOpen className="w-4 h-4" /> },
  { id: "general", label: "General", description: "Day-to-day life and personal stress.", icon: <Leaf className="w-4 h-4" /> },
];

const scheduleOptions = [
  { id: "morning", label: "Morning", description: "Active earlier in the day.", icon: <Sunrise className="w-4 h-4" /> },
  { id: "afternoon", label: "Afternoon", description: "Peak focus mid-day.", icon: <Sun className="w-4 h-4" /> },
  { id: "night", label: "Night", description: "You work/study late.", icon: <Moon className="w-4 h-4" /> },
];

const checkInOptions = [
  { id: "auto", label: "Automatic", description: "Gentle nudges based on signals.", icon: <Bell className="w-4 h-4" /> },
  { id: "manual", label: "Manual", description: "You log when you want.", icon: <Hand className="w-4 h-4" /> },
];

const goalOptions = [
  { id: "reduce_stress", label: "Reduce stress", description: "Feel calmer and less overwhelmed.", icon: <Leaf className="w-4 h-4" /> },
  { id: "improve_focus", label: "Improve focus", description: "Stay sharp during tasks.", icon: <Target className="w-4 h-4" /> },
  { id: "build_habits", label: "Build habits", description: "Small, sustainable changes.", icon: <Star className="w-4 h-4" /> },
  { id: "track_wellbeing", label: "Track well-being", description: "See patterns over time.", icon: <BarChart3 className="w-4 h-4" /> },
];


const stepVariants = {
  enterFromRight: { opacity: 0, x: 20, scale: 0.995 },
  enterFromLeft: { opacity: 0, x: -20, scale: 0.995 },
  center: { opacity: 1, x: 0, scale: 1 },
  exitToLeft: { opacity: 0, x: -12, scale: 0.995 },
  exitToRight: { opacity: 0, x: 12, scale: 0.995 },
};
const stepTransition = { duration: 0.36, ease: [0.2, 0.9, 0.2, 1] };

/* ================== main component ================== */
export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState("forward");
  const [formData, setFormData] = useState({
    name: "",
    focus: "",
    schedule: "",
    checkIns: "",
    consentData: false,
    consentCoach: false,
    goal: "",
  });

  const [completed, setCompleted] = useState(false);
  const percent = useMemo(() => Math.round((step / TOTAL_STEPS) * 100), [step]);
  const shouldReduceMotion = useReducedMotion();
  const inputRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
React.useEffect(() => {
  if (validationMessage) {
    const timer = setTimeout(() => {
      setValidationMessage("");
    }, 2000);

    return () => clearTimeout(timer);
  }
}, [validationMessage]);


const handleNext = () => {
  if (isTransitioning) return;

  // Step 4 validation
  if (
    step === 4 &&
    (!formData.focus || !formData.schedule || !formData.checkIns)
  ) {
    setValidationMessage("Please select all options to continue");
    return;
  }
if (
    step === 5 &&
    (!formData.consentData || !formData.consentCoach)
  ) {
    setValidationMessage("Please accept both consent options to continue");
    return;
  }
  //  Step 6 validation
  if (step === 6 && !formData.goal) {
    setValidationMessage("Please select a goal to complete setup");
    return;
  }

  // clear error
  setValidationMessage("");
  setIsTransitioning(true);
  setDirection("forward");

  if (step === TOTAL_STEPS) {
    setCompleted(true);
    setIsTransitioning(false);
    return;
  }

  setStep((prev) => prev + 1);
  setTimeout(() => setIsTransitioning(false), 400);
};


  const handleBack = () => {
    if (step === 1) return;
    setDirection("backward");
    setStep((prev) => Math.max(1, prev - 1));
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isNextDisabled = useMemo(() => {
    if (step === 1) return !formData.name.trim();
   
    return false;
  }, [step, formData]);


  if (completed) {
    return (
      <div className="min-h-screen flex bg-white">
       
        <div className="hidden lg:flex lg:w-4/12 relative overflow-hidden bg-slate-50" style={{ color: "#0f172a" }}>
          <div className="absolute inset-0">
            <div className="absolute top-16 left-16 w-60 h-60 bg-cyan-500/8 rounded-full blur-3xl" />
            <div className="absolute bottom-16 right-16 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl" />
          </div>

          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)`,
              backgroundSize: "72px 72px",
            }}
          />

          <div className="relative z-10 flex flex-col justify-center items-start w-full p-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-8">
              <Star className="w-8 h-8 text-gray-800" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Setup Complete!</h1>
            <p className="text-slate-600 text-base max-w-xs">
              Your personalized stress monitoring experience is ready.
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-8/12 flex items-center justify-center p-8 lg:border-l lg:border-slate-100">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl">
            <h1 className="text-3xl font-bold text-slate-900 text-center lg:text-left mb-2">
              You're all set{formData.name ? `, ${formData.name}` : ""}!
            </h1>
            <p className="text-slate-600 text-center lg:text-left mb-6">
              MentalSense will now learn from your signals and daily patterns to help you better understand your stress and well-being.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Your Preferences</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <PreferencePill label="Focus" value={formData.focus} />
                <PreferencePill label="Most active" value={formData.schedule} />
                <PreferencePill label="Check-ins" value={formData.checkIns} />
                <PreferencePill label="Goal" value={formData.goal} />
              </div>
            </div>

           <motion.button
  onClick={() => {
    localStorage.setItem("mentalsense_onboarded", "true");
    window.location.assign("/dashboard");
  }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-gray-800 py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2" aria-label="Go to dashboard">
              Go to Dashboard
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ---------- Normal onboarding flow ---------- */
  return (
    <div className="min-h-screen flex bg-white">
   
      <div className="hidden lg:flex lg:w-4/12 relative overflow-hidden bg-slate-50">
        <div className="absolute inset-0">
          <div className="absolute top-16 left-16 w-60 h-60 bg-cyan-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-16 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl" />
        </div>

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)`,
            backgroundSize: "72px 72px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-center p-12 h-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-gray-800 font-bold text-lg">M</span>
            </div>
            <span className="text-gray-800 font-bold text-3xl tracking-tight">MentalSense</span>
          </div>

          <div className="max-w-xs mt-6">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium inline-block mb-4">Step {step} of {TOTAL_STEPS}</span>
            <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
              {step === 1 && "Let's get to know you"}
              {step === 2 && "Discover the benefits"}
              {step === 3 && "How it all works"}
              {step === 4 && "Personalize your experience"}
              {step === 5 && "Your privacy matters"}
              {step === 6 && "Set your goals"}
            </h1>
            <p className="text-slate-600 text-sm">
              {step === 1 && "We'll customize MentalSense to fit your lifestyle and stress patterns."}
              {step === 2 && "See how AI-powered insights can transform your mental well-being journey."}
              {step === 3 && "Learn how we extract signal from behavior and language."}
              {step === 4 && "Help us understand your preferences for a tailored experience."}
              {step === 5 && "We take your data security seriously. You're always in control."}
              {step === 6 && "Define what success looks like for your wellness journey."}
            </p>

            <div className="flex gap-2 mt-8">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div key={i} className={`h-2 rounded-full ${i + 1 <= step ? 'w-8 bg-gradient-to-r from-cyan-400 to-blue-400' : 'w-2 bg-slate-300'}`} />
              ))}
            </div>
          </div>

          <div className="mt-auto flex items-center gap-6 text-slate-600 text-sm">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Privacy Focused</span>
            </div>
          </div>
        </div>
      </div>

     
      <div className="w-full lg:w-8/12 flex flex-col lg:border-l lg:border-slate-100">
      
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900 font-semibold">MentalSense</span>
          </div>
          <span className="text-slate-400 text-sm">Step {step}/{TOTAL_STEPS}</span>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <div>
              <span className="text-slate-900 font-medium">Onboarding</span>
              <span className="text-slate-400 mx-2">·</span>
              <span className="text-slate-400">{percent}% complete</span>
            </div>
          </div>
          <button onClick={() => window.location.assign("/login")} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">
            Already have an account? <span className="text-blue-600 font-semibold">Sign in</span>
          </button>
        </div>

     
        <div className="px-6 pt-4 lg:px-12">
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <motion.div initial={false} animate={{ width: `${percent}%` }} transition={{ duration: 0.45, ease: "easeOut" }} className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
          </div>
        </div>

        
        <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={shouldReduceMotion ? "center" : direction === "forward" ? "enterFromRight" : "enterFromLeft"}
              animate="center"
              exit={shouldReduceMotion ? "center" : direction === "forward" ? "exitToLeft" : "exitToRight"}
              variants={stepVariants}
              transition={shouldReduceMotion ? { duration: 0 } : stepTransition}
              className="max-w-2xl"
            >
              {step === 1 && <StepWelcome name={formData.name} onNameChange={(val) => updateField("name", val)} inputRef={inputRef} />}
              {step === 2 && <StepBenefits />}
              {step === 3 && <StepHowItWorks />}
              {step === 4 && <StepPersonalization focus={formData.focus} schedule={formData.schedule} checkIns={formData.checkIns} onChange={updateField} />}
              {step === 5 && <StepConsent consentData={formData.consentData} consentCoach={formData.consentCoach} onChange={updateField} />}
              {step === 6 && <StepGoals goal={formData.goal} onChange={(val) => updateField("goal", val)} />}
            </motion.div>
          </AnimatePresence>
        </div>

       
        <div className="border-t border-slate-100 px-6 py-4 lg:px-12 bg-white">
        <AnimatePresence>
  {validationMessage && (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="
        fixed
        bottom-[calc(env(safe-area-inset-bottom)+88px)]
        left-1/2
        -translate-x-1/2
        bg-gray-900
        text-white
        px-4 py-2
        rounded-xl
        shadow-xl
        text-sm
        z-[100]
        pointer-events-none
      "
    >
      {validationMessage}
    </motion.div>
  )}
</AnimatePresence>


          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <button onClick={handleBack} disabled={step === 1} className={` touch-manipulation flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${ step === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50' }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Back
            </button>

            <motion.button onClick={handleNext} disabled={isNextDisabled} whileHover={isNextDisabled ? {} : { scale: 1.02 }} whileTap={isNextDisabled ? {} : { scale: 0.98 }} className={` touch-manipulation flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${ isNextDisabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30' }`}>
              {step === TOTAL_STEPS ? "Complete Setup" : "Continue"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}



function PreferencePill({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value || "Not set"}</span>
    </div>
  );
}

function StepWelcome({ name, onNameChange, inputRef }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-5">
        <Star className="w-4 h-4" />
        <span>Let's get started</span>
      </div>
      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Welcome to MentalSense</h1>
      <p className="text-slate-600 mb-6 leading-relaxed">
        We'll set up a few preferences so your AI coach can understand your stress patterns.
      </p>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">What should we call you?</label>
        <input ref={inputRef} autoFocus type="text" onChange={(e) => onNameChange(e.target.value)} placeholder="Enter your name" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base" aria-label="Your name" />
        <p className="mt-2 text-sm text-slate-500">This will be used to personalize messages.</p>
      </div>
    </div>
  );
}

function StepBenefits() {
  const items = [
    { icon: <BarChart3 className="w-5 h-5" />, title: "See stress patterns", text: "Visualize how stress moves across day, week, and month." },
    { icon: <BookOpen className="w-5 h-5" />, title: "Understand triggers", text: "Connect spikes to behavior and language signals." },
    { icon: <Target className="w-5 h-5" />, title: "Personal nudges", text: "Receive suggestions tailored to your routine." },
  ];

  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-5">
        <Check className="w-4 h-4" />
        <span>Benefits</span>
      </div>
      <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">What MentalSense does for you</h2>
      <p className="text-slate-600 mb-6 leading-relaxed">We combine behavior and language signals to give a gentle, clear overview of your mental load.</p>
      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="flex gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-lg flex-shrink-0">{item.icon}</div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
              <p className="text-slate-600 text-sm">{item.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


function StepHowItWorks() {
  const items = [
    {
      icon: <Briefcase className="w-5 h-5" />,
      title: "Keystroke patterns",
      text: "We analyze your typing rhythm over time, compare it to your baseline, and detect subtle changes in cognitive load.",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Language tone",
      text: "We assess emotional tone in your writing to identify meaningful shifts in mood and sentiment.",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Trends & anomalies",
      text: "AI highlights long-term trends and flags unusual spikes to give clearer well-being insights.",
    },
  ];

  return (
    <div className="pb-2">
      
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium mb-4">
        <Star className="w-4 h-4" />
        <span>How it works</span>
      </div>

      
      <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
        How it works (in simple terms)
      </h2>

      
      <p className="text-slate-600 mb-4 text-sm leading-relaxed max-w-xl">
        MentalSense extracts <span className="text-cyan-600 font-medium">behavioral and emotional signals</span> from typing rhythm and language tone to estimate stress trends.
      </p>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {items.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="p-3 rounded-xl bg-white border border-slate-100 flex flex-col gap-2"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
              {item.icon}
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
            <p className="text-slate-600 text-xs leading-snug">{item.text}</p>
          </motion.div>
        ))}
      </div>

      
      <div className="rounded-xl p-4 bg-slate-50 border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Lock className="w-4 h-4 text-emerald-700" />
          </div>
          <h3 className="font-semibold text-slate-900 text-sm">Your privacy comes first</h3>
        </div>

        <ul className="space-y-1 text-slate-600 text-xs leading-snug">
          <li>We never store raw text or sensitive content.</li>
          <li>You can pause or delete your data anytime.</li>
          <li>All data is encrypted in transit and at rest.</li>
        </ul>
      </div>
    </div>
  );
}


function StepPersonalization({ focus, schedule, checkIns, onChange }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-sm font-medium mb-5">
        <Star className="w-4 h-4" />
        <span>Personalization</span>
      </div>
      <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Let's personalize your experience</h2>
      <p className="text-slate-600 mb-5 leading-relaxed">This helps MentalSense understand what matters most to you and when.</p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">What do you want to focus on?</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {focusOptions.map((opt) => (
              <SelectableCardCompact key={opt.id} active={focus === opt.label} onClick={() => onChange("focus", opt.label)} title={opt.label} description={opt.description} icon={opt.icon} />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">When are you most active?</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {scheduleOptions.map((opt) => (
              <SelectableCardCompact key={opt.id} active={schedule === opt.label} onClick={() => onChange("schedule", opt.label)} title={opt.label} description={opt.description} icon={opt.icon} />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">How should we check in with you?</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {checkInOptions.map((opt) => (
              <SelectableCardCompact key={opt.id} active={checkIns === opt.label} onClick={() => onChange("checkIns", opt.label)} title={opt.label} description={opt.description} icon={opt.icon} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


function SelectableCardCompact({ active, title, description, onClick, icon }) {
  return (
    <button type="button" onClick={onClick} className={`text-left w-full rounded-xl p-3 border transition-all ${ active ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50' }`} aria-pressed={active}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${active ? 'bg-blue-100' : 'bg-slate-50'}`}>{icon}</div>
        <span className={`font-semibold ${active ? 'text-blue-700' : 'text-slate-900'} text-sm`}>{title}</span>
      </div>
      <p className="text-slate-600 text-xs leading-snug">{description}</p>
    </button>
  );
}


function StepConsent({ consentData, consentCoach, onChange }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-sm font-medium mb-5">
        <ShieldCheck className="w-4 h-4" />
        <span>Privacy & consent</span>
      </div>
      <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Your data, your control</h2>
      <p className="text-slate-600 mb-5 leading-relaxed">We keep things transparent. Here's how your data is used and protected.</p>
      <div className="rounded-xl p-4 bg-slate-50 border border-slate-100 mb-5">
        <ul className="space-y-2 text-slate-600 text-sm">
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-emerald-700" />
            </div>
            We only use your signals to estimate stress and generate insights.
          </li>
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-emerald-700" />
            </div>
            Your data is not sold or shared with advertisers.
          </li>
          <li className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-emerald-700" />
            </div>
            You can export or delete your data anytime from settings.
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <CheckboxRow checked={consentData} onChange={(val) => onChange("consentData", val)} label="I agree to the processing of my data for stress estimation." />
        <CheckboxRow checked={consentCoach} onChange={(val) => onChange("consentCoach", val)} label="I agree to receive personalized recommendations and nudges." />
      </div>

      <p className="mt-4 text-sm text-slate-500">You can withdraw consent anytime from your account settings.</p>
    </div>
  );
}

function CheckboxRow({ checked, onChange, label }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex items-center justify-center mt-0.5">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${ checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-slate-400' }`}>
          {checked && (<Check className="w-3 h-3 text-white" />)}
        </div>
      </div>
      <span className="text-slate-700 text-sm leading-relaxed">{label}</span>
    </label>
  );
}

/* StepGoals */
function StepGoals({ goal, onChange }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-sm font-medium mb-5"><Target className="w-4 h-4" /><span>Your goal</span></div>
      <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">What's your main goal with MentalSense?</h2>
      <p className="text-slate-600 mb-5 leading-relaxed">This helps your AI coach prioritize the type of insights and nudges you see.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {goalOptions.map((opt) => (
          <SelectableCardCompact key={opt.id} active={goal === opt.label} onClick={() => onChange(opt.label)} title={opt.label} description={opt.description} icon={opt.icon} />
        ))}
      </div>
    </div>
  );
}
