# MoodMap — Emotional Wellness Tracker
 
A privacy-first mental health tracking application that reduces the friction between awareness and action. Built with vanilla JavaScript to demonstrate core web fundamentals and product thinking.
 
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://moodmap.netlify.app)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
 
---

## Problem Statement
 
Global mental health represents a $56B annual economic burden (Lancet, 2024), yet 70% of individuals experiencing depression or anxiety don't track their emotional patterns (Harvard Medical School). Existing solutions fail due to:
 
- **Cost barriers:** Premium apps average $70/year (Headspace, Calm)
- **Cognitive friction:** Clinical interfaces feel like "homework" rather than habitual check-ins
- **Privacy concerns:** Cloud-based tracking raises data security questions, particularly in emerging markets
**MoodMap addresses this gap** with a free, offline-first architecture that uses visual emotional mapping to encourage consistent self-monitoring.
 
---

## Technical Architecture
 
### Core Technologies
- **Vanilla JavaScript** — No framework dependencies; demonstrates fundamental language mastery
- **LocalStorage API** — Client-side persistence; zero server infrastructure required
- **Blob API** — CSV/JSON export functionality for clinical integration
- **Web Crypto API** — Timestamp-based data integrity (planned Phase 2)
### Key Features
 
#### 1. Pattern Recognition Engine
```javascript
function detectConcerningPattern(history) {
    const last7 = history.slice(-7)
    const negativeMoods = last7.filter(entry => 
        ['sad', 'scared', 'moody'].includes(entry.emotion)
    )
    
    if (negativeMoods.length >= 5) {
        return "Consider talking to someone"
    }
    
    const insomniaCount = history.slice(-5).filter(
        entry => entry.emotion === 'insomniac'
    ).length
    
    if (insomniaCount >= 3) {
        return "Sleep pattern concerns detected"
    }
    
    return null
}
```