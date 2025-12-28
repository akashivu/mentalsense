#  MentalSense  
**Multimodal AI-Powered Mental Wellness Platform**

🔗 Live Demo: https://mentalsense.netlify.app  

MentalSense is a **privacy-first, multimodal AI wellness product** that helps users understand stress patterns by analyzing **typing behavior (keystroke dynamics)** and **emotional language signals** — without wearables, constant surveys, or intrusive monitoring.

It is designed as a **product-focused prototype**, built with real onboarding, demo mode, dashboards, and ethical AI principles.

---

## Why MentalSense?

Mental stress often develops gradually and remains unnoticed until it affects focus, mood, or productivity.

MentalSense aims to:
- Surface **early behavioral stress signals**
- Help users understand **patterns over time**
- Provide **supportive, non-judgmental insights**
- Encourage awareness rather than diagnosis

All while keeping **user privacy, consent, and transparency** at the core.

---

##  Key Features
- **Full Personalized Experience (Login Required)**
   Real users can access the complete MentalSense experience with personalized insights after setup and explicit consent.

- **Demo Mode (Optional, No Login Required)**  
  Explore onboarding and dashboards instantly using sample data.

- **Multimodal AI Stress Estimation**  
  Combines behavioral and language-based signals for balanced insights.

- **Personalized Onboarding Flow**  
  Captures user preferences to tailor insights from the beginning.

- **Comprehensive Dashboards**
  - Overall stress trends
  - Emotional stress history
  - Hourly stress heatmap
  - Weekly & long-term patterns
  - Engagement timelines

- **AI Coach Panel**  
  Provides gentle explanations and nudges based on detected trends.

- **Privacy-First Design**
  - No raw text storage
  - Consent-based processing
  - Clear demo vs real usage separation

---

##  Demo Mode

MentalSense includes a **demo mode** so recruiters and users can explore the product without creating an account.

- Uses **controlled sample data**
- Collects **no personal information**
- Clearly labeled as preview-only
- Mirrors real product behavior

This enables **zero-friction exploration** while maintaining ethical boundaries.

---

##  How MentalSense Works (Technical Overview)

MentalSense surfaces stress patterns through a multimodal AI approach, combining behavioral and language signals and evaluating them relative to a user-specific baseline instead of fixed global thresholds.

---

### Keystroke Dynamics (Baseline-Based Behavioral Signals)

MentalSense does **not** associate stress with absolute typing speed or generic metrics.

Instead, it learns each user’s **normal typing behavior baseline** over time.

Behavioral signals include:
- Typing rhythm consistency
- Pause and hesitation patterns
- Speed variability *relative to the user’s own baseline*
- Error and correction frequency

When meaningful **deviations from this personal baseline** occur, they are interpreted as potential cognitive load or stress indicators and reflected in trends and insights.

---

###  Emotional Language Analysis (Text Modality)

MentalSense analyzes the **emotional tone** of user-entered text to identify:
- Sentiment shifts
- Emotional intensity
- Stress-related linguistic cues

⚠️ Raw text is **not stored** — only derived signals are used.

---

###  Multimodal Signal Fusion & Temporal Analysis

Behavioral and language signals are:
- Modeled independently
- Aligned over time
- Fused to reduce noise and false positives

The system tracks:
- Hourly patterns
- Daily and weekly trends
- Long-term baseline drift

This produces **more stable, personalized insights** than single-signal systems.

---

###  AI Coach & Insight Layer

Based on detected patterns, MentalSense:
- Highlights trends (e.g., rising stress, settling down)
- Explains contributing factors
- Suggests gentle, non-medical actions (breaks, pacing, reflection)

The focus is **awareness, not diagnosis**.

---

##  Dashboard Insights

The dashboard provides:
- Overall stress level (combined signals)
- Emotional stress history
- Daily emotional stress calendar
- Hourly stress heatmap
- Weekly and long-term trends
- Engagement timeline
- AI-generated contextual insights

All insights are **explanatory and supportive**, never judgmental.

---

##  Privacy & Ethical Design

MentalSense is built with strong ethical principles:

- No raw text storage
- No selling or sharing of user data
- Transparent consent-based signal processing
- Clear separation of demo and real usage
- Designed for individuals, not surveillance

MentalSense is a **wellness awareness tool**, not a medical or diagnostic system.

---

##  Tech Stack

###  Frontend (UX & Visualization)
- **React.js** – Component-based architecture for scalable UI
- **Tailwind CSS** – Utility-first styling for clean, responsive design
- **JavaScript (ES6+)** – Core frontend logic
- **Interactive Data Visualizations** – Trends, heatmaps, timelines
- **Client-Side Routing** – Seamless onboarding and dashboard navigation

---

###  Backend (Core Application Layer)
- **Java (Spring Boot)** – Primary backend for application logic and APIs
- **RESTful APIs** – Frontend ↔ backend ↔ AI service communication
- **JWT Authentication** – Secure, token-based user sessions
- **Role & Session Handling** – Supports demo and authenticated flows

---

### AI / Machine Learning (Python Inference Layer)
- **Python** – Core language for ML and signal processing
- **Machine Learning Models** – Behavioral pattern inference
- **Multimodal AI Architecture** – Behavioral + language modalities
- **Baseline-Based Behavioral Modeling** – User-specific deviation detection
- **Time-Series Analysis** – Hourly, daily, and weekly trend modeling
- **Feature Engineering** – Rhythm consistency, pauses, variability, linguistic cues

---

###  Backend–AI Integration
- **Service-to-Service REST Communication** – Java backend invokes Python ML inference
- **Decoupled Architecture** – AI layer isolated for scalability and safety

---

###  Demo & Simulation Layer
- **Demo Mode with Sample Data** – Recruiter-friendly exploration
- **Signal Simulation Utilities** – Privacy-safe, realistic previews

---

### Deployment & Tooling
- **Netlify** – Frontend deployment
- **Git & GitHub** – Version control
- **Modular Architecture** – Clear separation of concerns

---

##  Screenshots
- Onboarding flow
- “How it works” AI explanation
- Dashboard overview
- Stress trend visualizations

(See live demo for full experience)

---

##  Project Status

MentalSense is an **actively evolving, product-focused prototype**, with an emphasis on:
- UX clarity
- Ethical AI
- Real-world usability

---

##  Author

**Akash Patil**  
Product-focused Full Stack Developer  
AI • UX • Ethical Systems  

🔗 Live Demo: https://mentalsense.netlify.app  

---

## Disclaimer

MentalSense is a **wellness awareness tool**, not a medical or diagnostic system.  
Insights are informational and should not replace professional advice.
