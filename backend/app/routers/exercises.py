from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, desc, func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.exercise import Exercise
from app.schemas.exercise import (
    ExerciseCreate,
    ExerciseListResponse,
    ExerciseResponse,
)

router = APIRouter(
    prefix="/api/exercises",
    tags=["Exercises"],
)


@router.get("", response_model=ExerciseListResponse)
def get_exercises(
    search: str | None = Query(default=None),
    sort_by: str = Query(
        default="id",
        pattern="^(id|title|muscle_group|difficulty)$"
    ),
    order: str = Query(default="asc", pattern="^(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=5, ge=1, le=15),
    db: Session = Depends(get_db),
):
    statement = select(Exercise)

    if search:
        statement = statement.where(
            Exercise.title.ilike(f"%{search}%")
        )

    count_statement = select(func.count()).select_from(
        statement.subquery()
    )
    total = db.scalar(count_statement) or 0

    total_pages = max(ceil(total / limit), 1)

    if page > total_pages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Страница не найдена"
        )

    sort_column = getattr(Exercise, sort_by)

    if order == "desc":
        statement = statement.order_by(desc(sort_column))
    else:
        statement = statement.order_by(asc(sort_column))

    offset = (page - 1) * limit
    statement = statement.offset(offset).limit(limit)

    exercises = db.scalars(statement).all()

    return {
        "items": exercises,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
):
    exercise = db.get(Exercise, exercise_id)

    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Упражнение не найдено"
        )

    return exercise


@router.post(
    "",
    response_model=ExerciseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_exercise(
    exercise_data: ExerciseCreate,
    db: Session = Depends(get_db),
):
    new_exercise = Exercise(**exercise_data.model_dump())

    db.add(new_exercise)
    db.commit()
    db.refresh(new_exercise)

    return new_exercise


@router.put("/{exercise_id}", response_model=ExerciseResponse)
def update_exercise(
    exercise_id: int,
    exercise_data: ExerciseCreate,
    db: Session = Depends(get_db),
):
    exercise = db.get(Exercise, exercise_id)

    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Упражнение не найдено"
        )

    for field_name, value in exercise_data.model_dump().items():
        setattr(exercise, field_name, value)

    db.commit()
    db.refresh(exercise)

    return exercise


@router.delete(
    "/{exercise_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
):
    exercise = db.get(Exercise, exercise_id)

    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Упражнение не найдено"
        )

    db.delete(exercise)
    db.commit()