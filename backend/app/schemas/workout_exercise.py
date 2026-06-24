from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class WorkoutExerciseCreate(BaseModel):
    exercise_id: int
    approaches: int = Field(gt=0, le=10)
    repetitions: Optional[int] = Field(default=None, gt=0, le=100)
    weight: Optional[float] = Field(default=None, ge=0, le=5)
    rest_seconds: Optional[int] = Field(default=None, ge=0, le=3600)


class WorkoutExerciseResponse(WorkoutExerciseCreate):
    id: int
    workout_id: int

    model_config = ConfigDict(from_attributes=True)