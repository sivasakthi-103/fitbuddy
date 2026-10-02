import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fitbuddy.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from . import models
    Base.metadata.create_all(bind=engine)

# Database helper functions
def save_user(db, username: str, user_id: str, age: int, weight: int, goal: str, intensity: str):
    from .models import User
    existing = db.query(User).filter(User.user_id == user_id).first()
    if existing:
        existing.username = username
        existing.age = age
        existing.weight = weight
        existing.goal = goal
        existing.intensity = intensity
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_user = User(
            user_id=user_id,
            username=username,
            age=age,
            weight=weight,
            goal=goal,
            intensity=intensity
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

def save_plan(db, user_id: str, original_plan: str, nutrition_tip: str):
    from .models import Plan
    existing = db.query(Plan).filter(Plan.user_id == user_id).first()
    if existing:
        existing.original_plan = original_plan
        existing.nutrition_tip = nutrition_tip
        existing.updated_plan = None
        existing.feedback = None
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_plan = Plan(
            user_id=user_id,
            original_plan=original_plan,
            nutrition_tip=nutrition_tip
        )
        db.add(new_plan)
        db.commit()
        db.refresh(new_plan)
        return new_plan

def update_plan(db, user_id: str, updated_plan: str, feedback: str, updated_nutrition_tip: str = None):
    from .models import Plan
    plan = db.query(Plan).filter(Plan.user_id == user_id).first()
    if plan:
        plan.updated_plan = updated_plan
        plan.feedback = feedback
        if updated_nutrition_tip:
            plan.updated_nutrition_tip = updated_nutrition_tip
        db.commit()
        db.refresh(plan)
        return plan
    return None

def get_user(db, user_id: str):
    from .models import User
    return db.query(User).filter(User.user_id == user_id).first()

def get_original_plan(db, user_id: str):
    from .models import Plan
    plan = db.query(Plan).filter(Plan.user_id == user_id).first()
    return plan.original_plan if plan else None

def get_all_users(db):
    from .models import User
    return db.query(User).all()

def get_all_plans(db):
    from .models import Plan
    return db.query(Plan).all()
