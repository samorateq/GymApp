from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, desc, func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.workout import Workout
from app.schemas.workout import (
    WorkoutCreate,
    WorkoutListResponse,
    WorkoutResponse,
)

router = APIRouter(
    prefix="/api/workouts",
    tags=["Workouts"],
)

@router.get("", response_model=WorkoutListResponse)
def get_workouts(
    search: str | None = Query(default=None),
    sort_by: str = Query(
        default="id",
        pattern="^(id|title|duration_minutes|planned_date|difficulty)$",
    ),
    order: str = Query(default="asc", pattern="^(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=5, ge=1, le=15),
    db: Session = Depends(get_db),
):
    statement = select(Workout)

    if search:
        statement = statement.where(
            Workout.title.ilike(f"%{search}%")
        )

    count_statement = select(func.count()).select_from(
        statement.subquery()
    )
    total = db.scalar(count_statement) or 0

    total_pages = max(ceil(total / limit), 1)

    if page > total_pages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Страница не найдена",
        )

    sort_column = getattr(Workout, sort_by)

    if order == "desc":
        statement = statement.order_by(desc(sort_column))
    else:
        statement = statement.order_by(asc(sort_column))

    offset = (page - 1) * limit
    statement = statement.offset(offset).limit(limit)

    workouts = db.scalars(statement).all()

    return {
        "items": workouts,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


@router.get("/{workout_id}", response_model=WorkoutResponse)
def get_workout(
    workout_id: int,
    db: Session = Depends(get_db),
):
    workout = db.get(Workout, workout_id)

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тренировка не найдена",
        )

    return workout


@router.post(
    "",
    response_model=WorkoutResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_workout(
    workout_data: WorkoutCreate,
    db: Session = Depends(get_db),
):
    new_workout = Workout(
        **workout_data.model_dump(),
        is_completed=False,
    )

    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)

    return new_workout


@router.put("/{workout_id}", response_model=WorkoutResponse)
def update_workout(
    workout_id: int,
    workout_data: WorkoutCreate,
    db: Session = Depends(get_db),
):
    workout = db.get(Workout, workout_id)

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тренировка не найдена",
        )

    for field_name, value in workout_data.model_dump().items():
        setattr(workout, field_name, value)

    db.commit()
    db.refresh(workout)

    return workout


@router.patch("/{workout_id}/complete", response_model=WorkoutResponse)
def complete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
):
    workout = db.get(Workout, workout_id)

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тренировка не найдена",
        )

    workout.is_completed = True

    db.commit()
    db.refresh(workout)

    return workout


@router.delete(
    "/{workout_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
):
    workout = db.get(Workout, workout_id)

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тренировка не найдена",
        )

    db.delete(workout)
    db.commit()