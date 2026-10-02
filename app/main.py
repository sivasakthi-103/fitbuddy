import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from .database import init_db
from .routes import router

load_dotenv()

app = FastAPI(
    title="FitBuddy – AI Fitness Plan Generator",
    description="Personalized 7-day workout plans & nutrition tips powered by Google Gemini",
    version="1.0.0"
)

# Initialize SQLite database tables
init_db()

# Mount static files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")
if not os.path.exists(STATIC_DIR):
    os.makedirs(STATIC_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Include routing
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
