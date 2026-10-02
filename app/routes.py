import os
from fastapi import APIRouter, Request, Form, Depends, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from .database import (
    get_db,
    save_user,
    save_plan,
    update_plan,
    get_user,
    get_original_plan,
    get_all_users,
    get_all_plans,
)
from .gemini_generator import generate_workout_gemini
from .gemini_flash_generator import generate_nutrition_tip_with_flash
from .updated_plan import update_workout_plan

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
templates = Jinja2Templates(directory=TEMPLATE_DIR)

# Scenario 1: Home page form
@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Scenario 1: Generate Workout Plan
@router.post("/generate-workout", response_class=HTMLResponse)
async def generate_workout(
    request: Request,
    username: str = Form(...),
    user_id: str = Form(...),
    age: int = Form(...),
    weight: int = Form(...),
    goal: str = Form(...),
    intensity: str = Form(...),
    db: Session = Depends(get_db)
):
    clean_user_id = user_id.strip().lower()

    # Call Gemini Pro/Flash models
    workout_plan = generate_workout_gemini(
        username=username,
        age=age,
        weight=weight,
        goal=goal,
        intensity=intensity
    )
    nutrition_tip = generate_nutrition_tip_with_flash(
        goal=goal,
        intensity=intensity,
        weight=weight
    )

    # Persist in SQLite via SQLAlchemy
    save_user(
        db=db,
        username=username,
        user_id=clean_user_id,
        age=age,
        weight=weight,
        goal=goal,
        intensity=intensity
    )
    save_plan(
        db=db,
        user_id=clean_user_id,
        original_plan=workout_plan,
        nutrition_tip=nutrition_tip
    )

    return templates.TemplateResponse("result.html", {
        "request": request,
        "username": username,
        "user_id": clean_user_id,
        "age": age,
        "weight": weight,
        "goal": goal,
        "intensity": intensity,
        "workout_plan": workout_plan,
        "nutrition_tip": nutrition_tip,
        "updated_plan": None,
        "feedback": None,
    })

# Scenario 2: Submit Feedback and Update Plan
@router.post("/submit-feedback", response_class=HTMLResponse)
async def submit_feedback(
    request: Request,
    user_id: str = Form(...),
    feedback: str = Form(...),
    db: Session = Depends(get_db)
):
    clean_user_id = user_id.strip().lower()
    user = get_user(db, clean_user_id)
    original_plan = get_original_plan(db, clean_user_id)

    if not user or not original_plan:
        raise HTTPException(status_code=404, detail="User or existing plan not found.")

    # Call Gemini to revise the plan based on feedback
    user_dict = {
        "username": user.username,
        "goal": user.goal,
        "intensity": user.intensity,
        "age": user.age,
        "weight": user.weight
    }
    updated_plan_text, updated_tip = update_workout_plan(
        original_plan=original_plan,
        feedback=feedback,
        user_info=user_dict
    )

    # Persist updated plan in SQLite
    update_plan(
        db=db,
        user_id=clean_user_id,
        updated_plan=updated_plan_text,
        feedback=feedback,
        updated_nutrition_tip=updated_tip
    )

    return templates.TemplateResponse("result.html", {
        "request": request,
        "username": user.username,
        "user_id": user.user_id,
        "age": user.age,
        "weight": user.weight,
        "goal": user.goal,
        "intensity": user.intensity,
        "workout_plan": original_plan,
        "nutrition_tip": updated_tip,
        "updated_plan": updated_plan_text,
        "feedback": feedback,
    })

# Scenario 4: Admin Dashboard of All Users
@router.get("/view-all-users", response_class=HTMLResponse)
async def view_all_users(request: Request, db: Session = Depends(get_db)):
    users = get_all_users(db)
    return templates.TemplateResponse("all_users.html", {
        "request": request,
        "users": users
    })
