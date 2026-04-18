# ExamAce — AI-Powered Exam Prep Platform

## Original Problem Statement
Build a full-stack AI-powered web application similar to Testbook, focused on competitive exam preparation (SSC, CAT, GATE). Platform lets users practice daily MCQs, take timed mock tests, and get AI-powered explanations and performance analysis. User-selected stack: FastAPI + MongoDB + React + JWT auth + OpenAI gpt-4o-mini via Emergent LLM Key.

## Architecture
- **Backend:** FastAPI (`/app/backend/server.py`, `auth.py`, `ai.py`, `seed_data.py`)
- **Database:** MongoDB (`users`, `questions`, `mock_tests`, `attempts`, `test_results`, `doubts`)
- **Frontend:** React + Tailwind + shadcn/ui, React Router, framer-motion, recharts, react-markdown
- **Auth:** JWT (Bearer token in `Authorization` header; persisted in localStorage)
- **AI:** `emergentintegrations` library, model `openai/gpt-4o-mini` via `EMERGENT_LLM_KEY`
- **Design:** "Swiss & High-Contrast + Organic & Earthy" — Deep Evergreen primary, Blaze Orange accent, Warm Sand secondary, Cabinet Grotesk / Satoshi / JetBrains Mono

## User Personas
1. **Student** — signs up, practices daily, takes mocks, reviews analytics and asks AI doubts
2. **Admin** — manages question bank, creates mock tests, views user activity

## Core Requirements (Static)
- Email/password signup + login (JWT)
- Daily MCQ practice with 4 options, instant result
- AI explanation: step-by-step + short trick + concept summary
- Timer-based mock tests (20–50 questions), question palette, Mark-for-review, submit
- Score + topic breakdown + AI-personalized feedback
- Admin CRUD for questions + mock tests; user activity view
- AI "Ask doubt" chat; "Generate similar question"
- Performance analytics (accuracy trend, topic strength)
- Mobile responsive, clean modern UI

## What's Implemented (2026-02-18)
- [x] JWT auth with bcrypt, admin role, admin seed, demo student seed
- [x] 30 seed questions (10 SSC + 10 CAT + 10 GATE), 3 seed mock tests
- [x] Landing page (hero, features, exam bento, final CTA, footer)
- [x] Signup + Login pages with demo-credentials helper
- [x] Dashboard with stat cards + accuracy trend chart + recent results
- [x] Daily Practice with exam filter, AI explanation, generate-similar
- [x] Exams listing with filter
- [x] Mock test taking: timer, question palette (attempted/marked/current), prev/next/mark/clear, submit modal, auto-submit on time-up
- [x] Result page with score, topic breakdown, AI feedback, full question review
- [x] Analytics with trend line, topic bar, weak/strong topics, AI feedback
- [x] Doubt chat (markdown-rendered) with suggestions
- [x] Admin panel: stats cards + Questions CRUD + Mock test builder (checkbox question picker) + Users table
- [x] Design tokens (HSL) per design guidelines; Cabinet Grotesk / Satoshi / JetBrains Mono via Fontshare CDN
- [x] Markdown rendering (react-markdown + GFM) for all AI outputs

## Tested (2026-02-18)
- Backend: 22/22 pytest cases pass (auth, CRUD, AI endpoints, mock submit flow, performance, admin roles)
- Frontend: 100% of tested flows pass (landing → signup → login → practice → explain/similar → mock test full lifecycle → result → analytics → doubt → admin)

## Prioritized Backlog
### P1
- Rate limiting on AI endpoints (explain/similar/feedback/doubt) — abuse protection
- Split `server.py` (~700 lines) into per-resource routers
- Admin: "invalidate AI explanation cache" endpoint
- Password reset flow
### P2
- Stripe subscription (Pro plan — unlimited mocks + AI feedback)
- Leaderboard per exam (shareability hook)
- Email weekly performance digest
- Dark mode
- KaTeX/MathJax for math rendering (CAT/GATE Quant formulas)
- Upload question bank via CSV

## Test Credentials
- Admin: `admin@examace.com` / `admin123`
- Student: `student@examace.com` / `student123`

## Env Variables
- Backend: `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`, `EMERGENT_LLM_KEY`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- Frontend: `REACT_APP_BACKEND_URL`

## Next Action Items
1. Add Pro subscription via Stripe (3 mock tests/month free, unlimited Pro)
2. Add a shareable leaderboard per exam to drive virality
3. Implement question CSV import for faster content seeding
