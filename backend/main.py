from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import create_tables
from backend.routers import auth, interviews, reports
import backend.models

app = FastAPI(
    title="AI Interview Coach API",
    description="Backend API for the AI Interview Coach",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await create_tables()

app.include_router(auth.router)
app.include_router(interviews.router)
app.include_router(reports.router)

@app.get("/")
async def root():
    return {"message": "AI Interview Coach API is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}