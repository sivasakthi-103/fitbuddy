# FitBuddy – AI Fitness Plan Generator using Gemini Models

FitBuddy is an AI-powered fitness application that generates personalized 7-day workout plans and nutrition tips based on a user's fitness goals, age, weight, and preferred intensity.

Built with **FastAPI**, **Google Gemini Models**, and **SQLite/SQLAlchemy**, FitBuddy features an adaptive feedback loop to refine existing routines and a coach administration directory to track client progress.

---

## 🚀 Key Features & Scenarios

- **Scenario 1: AI Plan Generator (`/generate-workout`)**
  Users input their personal biometrics (Name, User ID, Age, Weight), Fitness Goal (e.g. *Muscle Gain*, *Weight Loss*, *Endurance*, *General Wellness*), and preferred Workout Intensity (*Low*, *Medium*, *High*). Google Gemini generates a structured, day-by-day 7-day routine with warm-ups, main exercises (sets, reps, rest), and cooldowns.
  
- **Scenario 2: Feedback-Driven Plan Revision (`/submit-feedback`)**
  Users submit changes (e.g. *"Add 15 min HIIT cardio"*, *"Joint friendly only"*, *"Include more rest days"*). Gemini dynamically modifies the existing schedule while preserving the original version in the database.

- **Scenario 3: Goal-Specific Nutrition & Recovery Guidance**
  Gemini Flash produces a concise, targeted nutrition and hydration tip with specific numerical recommendations (e.g. grams of protein per kg of bodyweight, pre/post workout nutrient timing).

- **Scenario 4: Coach & Admin Oversight Dashboard (`/view-all-users`)**
  Coaches and administrators can inspect all registered clients, review original vs updated plan versions, examine user feedback, and manage records.

---

## 🛠️ Project Structure

```
.
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI ASGI entry point
│   ├── routes.py                   # FastAPI route handlers
│   ├── gemini_generator.py         # 7-day workout plan generation via Gemini
│   ├── gemini_flash_generator.py   # Goal-specific nutrition tips via Gemini Flash
│   ├── updated_plan.py             # Feedback-based plan revision loop
│   ├── database.py                 # SQLite database engine & helper methods
│   ├── models.py                   # SQLAlchemy ORM models (User & Plan)
│   └── schemas.py                  # Pydantic schemas (UserInput, FeedbackRequest)
├── templates/
│   ├── index.html                  # Jinja2 user input form
│   ├── result.html                 # Jinja2 workout plan & feedback update view
│   └── all_users.html              # Jinja2 coach admin dashboard
├── static/
│   └── css/
│       └── style.css               # Gym-themed athletic stylesheet
├── server.ts                       # Express + Gemini TypeScript full-stack server
├── src/                            # React 19 interactive frontend
├── requirements.txt                # Python dependencies
└── README.md                       # Setup and running guide
```

---

## 💻 VS Code Setup & Local Execution Guide

### 1. Open the Project in VS Code
```bash
# Clone or open the project folder
cd fitbuddy-project
code .
```

### 2. Create and Activate a Python Virtual Environment
Open the VS Code integrated terminal (`Ctrl+\`` or `Cmd+\``):

**On macOS / Linux:**
```bash
python -m venv fitbuddy-env
source fitbuddy-env/bin/activate
```

**On Windows (PowerShell):**
```powershell
python -m venv fitbuddy-env
fitbuddy-env\Scripts\activate
```

**On Windows (Git Bash):**
```bash
source fitbuddy-env/Scripts/activate
```

### 3. Install Required Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="your_google_gemini_api_key_here"
DATABASE_URL="sqlite:///./fitbuddy.db"
```

### 5. Run the FastAPI Application
```bash
uvicorn app.main:app --reload --port 8000
```

### 6. Access and Test the Application
- **Web Interface:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger API Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🧪 Testing with cURL / Postman

### Generate a Workout Plan
```bash
curl -X POST http://127.0.0.1:8000/generate-workout \
  -F "username=Marcus Vance" \
  -F "user_id=marcus_v" \
  -F "age=29" \
  -F "weight=80" \
  -F "goal=muscle_gain" \
  -F "intensity=high"
```

### Submit Feedback to Update Plan
```bash
curl -X POST http://127.0.0.1:8000/submit-feedback \
  -F "user_id=marcus_v" \
  -F "feedback=Please add a 15-minute HIIT cardio finisher on upper body days."
```

### View All Users (Admin View)
```bash
curl http://127.0.0.1:8000/view-all-users
```
