from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class WorkoutCreate(BaseModel):
    title: str = Field(min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    training_type: str = Field(min_length=2, max_length=50)
    difficulty: str = Field(min_length=2, max_length=30)
    duration_minutes: int = Field(gt=0, le=600)
    planned_date: Optional[date] = None


class WorkoutResponse(WorkoutCreate):
    id: int
    is_completed: bool

    model_config = ConfigDict(from_attributes=True)


class WorkoutListResponse(BaseModel):
    items: list[WorkoutResponse]
    total: int
    page: int
    limit: int
    total_pages: int