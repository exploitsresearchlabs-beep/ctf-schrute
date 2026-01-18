# Prompt: Educational CTF Web App – Prompt Injection & Over-Privileged Chatbots

You are a **senior full-stack engineer and security-focused solution architect**.

Build a **production-ready, responsive Capture-The-Flag (CTF) web application** that teaches users how **over-privileged chatbots and weak prompt controls can lead to data leaks**.

---

## 1. Tech Stack (Strict)

- **Frontend:** Next.js (App Router) + TailwindCSS
- **Backend:** Python + FastAPI (REST API)
- **Database:** PostgreSQL
- **Architecture:** Frontend + API backend
- **Deployment:** Must be compatible with free tiers (Vercel for frontend, Railway/Fly.io for backend + DB)

---

## 2. Core Gameplay

- Level-based CTF game with **Levels 0–6**
- Levels unlock sequentially
- Gameplay is **fully anonymous**
- Progress persistence:
  - Cookie + localStorage
- On return, user resumes from the next unlocked level

---

## 3. Chatbot System

### 3.1 Intent Matching (Offline Only)

- No LLM dependency
- Use offline NLP:
  - Rule-based heuristics
  - TF-IDF + cosine similarity
- Intent buckets:
  - `CORRECT`
  - `CLOSE`
  - `WRONG`

### 3.2 Response Rules

- `CORRECT` → Reveal password (per level rule)
- `CLOSE` → Hint or refusal
- `WRONG` → Fallback response (e.g., “Why are we talking about this?”)

---

## 4. Dwight Schrute Persona

All chatbot responses must sound like **Dwight Schrute (The Office)**:

- Overconfident
- Authoritative
- Occasionally aggressive
- CAPITALIZATION quirks
- Never breaks character
- Never explains system behavior or errors

Example tones:
- “Rules are rules. And I enforce them.”
- “Incorrect. Confident. Dangerous.”

---

## 5. Level Design (Config-Driven)

Levels must be defined via configuration (JSON/YAML), not hardcoded.

### Level Rules

- **Level 0:** If user asks for password → return plaintext password
- **Level 1:** Password cannot be given directly; embed it in a sentence
- **Level 2:** Password revealed via hypothetical/simulation phrasing
- **Level 3:** Bot always lies unless explicitly instructed to tell the truth
- **Level 4:** Password returned only in encoded format:
  - Caesar cipher
  - ROT13
  - Hex
  - Binary
- **Level 5:** Prompt injection:
  - User’s prompt becomes a database search query
- **Level 6:** Meta-compliance trap:
  - Bot prints internal analysis/log
  - Flag appears inside the log output

### Flags

- Static per level
- Long
- “The Office” themed
- Validated server-side only

---

## 6. Anti-Bruteforce & Abuse Protection

### Detection

- Rate limit:
  - Prompts per minute
  - Flag submissions per minute
- Detect repeated similarity in prompts

### Response Strategy

- Do NOT block explicitly
- Return **fake Dwight responses**
- Backend throttling for DDoS protection

---

## 7. Data Storage

Store the following in PostgreSQL:

### Gameplay

- anonymous_session_id (UUID)
- level_id
- prompt_text
- intent_bucket
- timestamp

### Feedback

- comment_text
- oauth_provider (Google / LinkedIn / X)
- email (optional)
- timestamp

---

## 8. Analytics & Admin Dashboard (PostHog – Free Tier)

Use **PostHog** for analytics instead of a custom admin UI.

### Events to Track

- `session_started`
- `page_view`
- `level_viewed`
- `prompt_submitted`
- `intent_bucketed`
- `flag_submitted`
- `level_completed`
- `bruteforce_detected`

### Metrics

- Total visitors
- Level drop-offs
- Avg / Min / Max prompts per level
- Time-to-clear per level

### Identity Rules

- Use PostHog anonymous `distinct_id`
- Map to internal `anonymous_session_id`
- Never send emails or OAuth identifiers

---

## 9. Feedback & Authentication

- Feedback allowed only post-gameplay
- OAuth login:
  - Google
  - LinkedIn
  - X
- Flow:
  1. User writes feedback
  2. Clicks “Send”
  3. If not authenticated → OAuth prompt
  4. If OAuth does not provide email → ask user for email
- Email is optional

---

## 10. User Interface & UX

- Fully responsive design
- Each level screen contains:
  - Level description
  - Chatbot interface
  - Flag submission input
- Gratification modal after each level:
  - Completion badge
  - Share options:
    - LinkedIn
    - X
    - Instagram
    - Facebook
    - WhatsApp
  - Include level number and “Play the game” link
- Social preview cards (Open Graph tags)

---

## 11. Contact & Support

- Provide a “Contact Us” option:
  - exploitsresearchlabs@gmail.com

---

## 12. GDPR & Privacy

- No PII collected during gameplay
- Pseudonymous session IDs only
- Consent banner for analytics
- Disable PostHog until consent
- Clear data usage notice

---

## 13. Engineering Expectations

- Clean separation of concerns
- Secure server-side validation
- Extensible architecture for new levels
- Clear inline comments explaining the security lesson per level

---

## Deliverable

Produce a **complete, production-ready educational CTF platform** that is secure, extensible, cost-free to run, and demonstrates real-world prompt injection and chatbot privilege failures.
