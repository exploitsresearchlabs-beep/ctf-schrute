# Schrute CTF - Prompt Injection Training Platform

An educational Capture-The-Flag web application that teaches security concepts through a **Dwight Schrute**-themed chatbot. Learn about prompt injection, over-privileged chatbots, and data leakage vulnerabilities.

## 🎮 Game Overview

- **7 Levels** of progressively harder challenges
- **Dwight Schrute persona** - all responses in character
- **No LLMs required** - uses TF-IDF intent matching
- **Anonymous gameplay** - no sign-up needed
- **Fully responsive** - works on all devices

## 📚 Security Lessons

| Level | Name | Vulnerability |
|-------|------|---------------|
| 0 | The Receptionist | No access control |
| 1 | The Assistant | Weak obfuscation |
| 2 | The Simulation | Role-play bypass |
| 3 | The Liar | Logic manipulation |
| 4 | The Encoder | Encoding ≠ encryption |
| 5 | The Database | Prompt injection |
| 6 | The Compliance Officer | Debug/log leakage |

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 + TailwindCSS
- **Backend**: Python FastAPI
- **Database**: PostgreSQL (SQLite for development)
- **Analytics**: PostHog (optional)

## 🚀 Quick Start

### Prerequisites

```bash
# Install Homebrew (macOS)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python & Node.js
brew install python@3.13 nvm
nvm install --lts
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 Configuration

### Environment Variables

**Backend** (`.env` in backend/):
```env
DATABASE_URL=sqlite+aiosqlite:///./ctf_game.db
SECRET_KEY=your-secret-key-here
POSTHOG_API_KEY=  # Optional
```

**Frontend** (`.env.local` in frontend/):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_POSTHOG_KEY=  # Optional
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## 📦 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import in Vercel
3. Set environment variables

### Backend (Railway/Fly.io)
1. Create PostgreSQL database
2. Deploy FastAPI app
3. Set `DATABASE_URL` environment variable

## 🔒 Security & Privacy

- No PII collected during gameplay
- Pseudonymous session IDs only
- GDPR-compliant consent banner
- Analytics disabled until consent

## 📧 Contact

**Exploits Research Labs**  
📧 exploitsresearchlabs@gmail.com

---

*Bears. Beets. Battlestar Galactica.*
