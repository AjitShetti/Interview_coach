# 🎯 AI Interview Coach

An AI-powered interview preparation platform that conducts realistic mock interviews, evaluates answers in real time, and generates detailed performance reports. Supports multiple interview types, adaptive difficulty, and RAG-augmented questions from your own job description.

## Key Features

- **4 interview modes** — Technical, Behavioral, System Design, and DSA
- **Adaptive difficulty** — automatically adjusts question difficulty based on your running score
- **RAG-powered questions** — paste a job description to get role-specific questions
- **Live feedback** — each answer is scored and commented on immediately
- **Final report** — overall score, strengths, areas to improve, and topics to study
- **Two interfaces** — Streamlit web app (`app.py`) and rich CLI (`main.py`)
- **FastAPI backend** (optional) — REST API with JWT auth and PostgreSQL persistence

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Language** | Python 3.13+ |
| **AI / LLM** | Google Gemini 2.5 Flash (`langchain-google-genai`) |
| **Orchestration** | LangChain (chains, memory, LCEL) |
| **Vector store** | ChromaDB (local, no server required) |
| **Web UI** | Streamlit |
| **REST API** | FastAPI + Uvicorn |
| **Database** | PostgreSQL 16 (via `asyncpg` + SQLAlchemy 2) |
| **Migrations** | Alembic |
| **Auth** | JWT (`python-jose`) |
| **Package manager** | [uv](https://docs.astral.sh/uv/) |
| **Dev containers** | Docker Compose (Postgres + pgAdmin) |

---

## Project Structure

```
interview_Coach/
│
├── app.py                  # Streamlit web UI (primary entry point)
├── main.py                 # CLI entry point
├── config.py               # Pydantic settings (loads from .env)
├── pyproject.toml          # Project metadata and dependencies
├── docker-compose.yml      # Postgres + pgAdmin for local development
│
├── interview_coach/        # Core library
│   ├── __init__.py         # Public API: InterviewCoach, TOPIC_DEFAULTS
│   ├── coach.py            # InterviewCoach orchestrator class
│   └── models.py           # Pydantic session models (InterviewSession, InterviewPhase)
│
├── chains/                 # LangChain chains (LCEL pipelines)
│   ├── interviewer.py      # Question generation chain with conversation memory
│   ├── evaluator.py        # Answer evaluation + report generation chains
│   ├── question_generator.py  # RAG-aware question generation chain
│   └── topic_extractor.py  # Extract relevant topics from job description
│
├── rag/                    # Retrieval-Augmented Generation
│   ├── loader.py           # Document loaders (PDF, DOCX, plain text)
│   ├── retriever.py        # ChromaDB vector store + retriever setup
│   └── setup.py            # High-level RAG initialization
│
├── memory/                 # Conversation history
│   └── conversation.py     # LangChain message history wrapper
│
├── backend/                # FastAPI REST API (optional)
│   ├── main.py             # FastAPI app + router registration
│   ├── config.py           # Backend-specific settings
│   ├── database.py         # Async SQLAlchemy engine / session factory
│   ├── models/             # ORM models
│   ├── schemas/            # Pydantic request / response schemas
│   ├── routers/            # API route handlers
│   ├── services/           # Business logic layer
│   └── alembic/            # Database migration scripts
│
├── frontend/               # React + Vite frontend (for the FastAPI backend)
│   └── src/                # React components and pages
│
├── stitch_screens/         # UI design mockups (HTML prototypes)
├── data/                   # Job description files for RAG (gitignored)
└── tests/                  # Test suite
```

---

## Prerequisites

- **Python 3.13+** (managed via `.python-version`)
- **[uv](https://docs.astral.sh/uv/)** — fast Python package manager
- **Google Gemini API key** — [get one free](https://aistudio.google.com/app/apikey)
- **Docker** (optional) — only needed for the Postgres backend

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/interview_Coach.git
cd interview_Coach
```

### 2. Install Dependencies

```bash
uv sync
```

This reads `pyproject.toml`, creates a `.venv`, and installs all dependencies.

### 3. Configure Environment Variables

```bash
copy .env.example .env
```

Then edit `.env`:

```env
# Required
GEMINI_API_KEY=your-gemini-api-key-here

# Required only for the FastAPI backend
DATABASE_URL=postgresql+asyncpg://admin:secret@localhost:5432/interview_coach_db
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key | ✅ Always |
| `DATABASE_URL` | Async PostgreSQL connection string | FastAPI backend only |
| `SECRET_KEY` | Secret for JWT signing | FastAPI backend only |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT token lifetime | FastAPI backend only |

### 4. Run the Streamlit App

```bash
uv run streamlit run app.py
```

Open [http://localhost:8501](http://localhost:8501) in your browser.

---

## Usage

### Streamlit Web App

1. In the sidebar, set your **Position**, **Level**, **Interview Type**, and optionally paste a **Job Description**
2. Choose the **Number of Questions** (3–10)
3. Click **Start Interview**
4. Type your answers in the chat input at the bottom
5. Each answer receives an inline score and improvement tip
6. After the last question, a full **Interview Report** is generated

### CLI Mode

```bash
# Default: senior Python developer, technical, 5 questions
uv run python main.py

# Custom options
uv run python main.py \
  --type behavioral \
  --level mid \
  --position "Product Manager" \
  --questions 7

# With a job description file (enables RAG questions)
uv run python main.py \
  --job data/job_descriptions/my_jd.pdf \
  --type technical \
  --level senior
```

| Flag | Short | Default | Description |
|---|---|---|---|
| `--type` | `-t` | `technical` | `technical` / `behavioral` / `system_design` / `dsa` |
| `--level` | `-l` | `senior` | `junior` / `mid` / `senior` / `staff` |
| `--position` | `-p` | `Senior Python Developer` | Job title |
| `--questions` | `-q` | `5` | Number of questions (any integer) |
| `--job` | `-j` | — | Path to a PDF/DOCX/TXT job description |

Type `quit`, `exit`, or `q` to end the session early.

---

## Interview Types

| Type | Topics Covered |
|---|---|
| **Technical** | Python, system design, databases, APIs, best practices |
| **Behavioral** | Teamwork, leadership, conflict resolution, growth, motivation |
| **System Design** | Scalability, architecture, trade-offs, databases, caching |
| **DSA** | Arrays, trees, graphs, dynamic programming, complexity analysis |

When a **Job Description** is provided, RAG retrieves relevant context from it to generate targeted questions on top of the defaults.

---

## FastAPI Backend (Optional)

The `backend/` directory contains a full REST API for persistent session storage and multi-user support.

### Start the Database

```bash
docker compose up -d
```

This starts:
- **PostgreSQL 16** on port `5432`
- **pgAdmin 4** on port `5050` (login: `admin@admin.com` / `admin`)

### Run Migrations

```bash
cd backend
uv run alembic upgrade head
```

### Start the API Server

```bash
uv run uvicorn backend.main:app --reload --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Configuration Reference

All settings live in [`config.py`](config.py) and are loaded from `.env` via Pydantic Settings.

| Setting | Default | Description |
|---|---|---|
| `model_name` | `gemini-2.5-flash-lite` | Gemini model to use |
| `temperature` | `0.7` | LLM sampling temperature |
| `max_tokens` | `1000` | Max tokens per LLM response |
| `max_questions` | `5` | Interview question limit |
| `default_difficulty` | `medium` | Starting difficulty (`easy`/`medium`/`hard`) |
| `chunk_size` | `500` | RAG document chunk size |
| `chunk_overlap` | `50` | Overlap between RAG chunks |
| `retriever_k` | `3` | Number of RAG chunks retrieved per query |

---

## How It Works

```
User Answer
    │
    ▼
┌─────────────────────────────────────────┐
│          InterviewCoach (coach.py)       │
│                                          │
│  ┌──────────────┐  ┌────────────────┐   │
│  │  Interviewer │  │   Evaluator    │   │
│  │  Chain       │  │   Chain        │   │
│  │  (+ Memory)  │  │  (score/tips)  │   │
│  └──────┬───────┘  └───────┬────────┘   │
│         │                  │            │
│  ┌──────▼──────────────────▼────────┐   │
│  │      RAG Retriever (optional)    │   │
│  │      ChromaDB ← Job Description  │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │       Report Generator           │   │
│  │  (final score + recommendations) │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

1. **Question generation** — The `Interviewer` chain maintains conversation history so follow-up questions feel natural. If RAG is enabled, the `QuestionGenerator` chain retrieves relevant JD context first.
2. **Adaptive difficulty** — After every two answers, the average score is checked. Score ≥ 8 → hard; score ≤ 4 → easy; otherwise medium.
3. **Evaluation** — The `Evaluator` chain scores each answer (0–10) and suggests a follow-up question.
4. **Report** — The `ReportGenerator` chain reads the full transcript and all scores to produce strengths, improvement areas, and study recommendations.

---

## Running Tests

```bash
uv run pytest tests/ -v
```

---

## Troubleshooting

### `GEMINI_API_KEY` not found

Make sure `.env` exists at the project root and contains `GEMINI_API_KEY=...`. The app calls `load_dotenv()` at startup, so no shell export is needed.

### ChromaDB / vector store errors

Delete the local vector store and restart:

```bash
Remove-Item -Recurse -Force chroma_db
```

### Docker Postgres won't start

Check if port 5432 is already in use:

```powershell
netstat -ano | findstr :5432
```

Stop any conflicting process or change the port in `docker-compose.yml`.

### `uv` not found

Install uv:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

---

## Roadmap

- [ ] Voice input / output (audio interview mode)
- [ ] Persistent session history via the FastAPI + PostgreSQL backend
- [ ] React frontend connected to the REST API
- [ ] Export report as PDF
- [ ] Multi-language support

---

## License

MIT
