from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, resumes
from app.database import init_db  # ✅ import init_db

app = FastAPI(
    title="AI Resume Creator API",
    description="Backend API for AI-powered resume generation",
    version="1.0.0"
)

# ✅ Initialize the database at startup
@app.on_event("startup")
def on_startup():
    init_db()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(resumes.router, prefix="/api/resumes", tags=["Resumes"])

@app.get("/")
def root():
    return {"message": "AI Resume Creator API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
