from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ExerciseCreate(BaseModel):
    title: str = Field(min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    muscle_group: str = Field(min_length=2, max_length=50)
    equipment: Optional[str] = Field(default=None, max_length=100)
    difficulty: str = Field(min_length=2, max_length=30)


class ExerciseResponse(ExerciseCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ExerciseListResponse(BaseModel):
    items: list[ExerciseResponse]
    total: int
    page: int
    limit: int
    total_pages: int