from pydantic import BaseModel, Field
from typing import Optional

class UserInput(BaseModel):
    username: str = Field(..., example="John Doe")
    user_id: str = Field(..., example="johndoe123")
    age: int = Field(..., ge=12, le=100, example=28)
    weight: int = Field(..., ge=30, le=250, example=75)
    goal: str = Field(..., example="muscle_gain")
    intensity: str = Field(..., example="high")

class FeedbackRequest(BaseModel):
    user_id: str = Field(..., example="johndoe123")
    feedback: str = Field(..., example="Include more cardio and add 1 extra rest day")
