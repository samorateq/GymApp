from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.exercise import Exercise
from app.models.workout import Workout
from app.models.workout_exercise import WorkoutExercise
from app.schemas.workout_exercise import (
    WorkoutExerciseCreate,
    WorkoutExerciseResponse,
)

router = APIRouter(
    prefix="/api/workouts",
    tags=["Workout exercises"],
)


@router.get(
    "/{workout_id}/exercises",
    response_model=list[WorkoutExerciseResponse],
)
def get_workout_exercises(
    workout_id: int,
    db: Session = Depends(get_db),
):
    workout = db.get(Workout, workout_id)

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тренировка не найдена",
        )

    statement = (
        select(WorkoutExercise)
        .where(WorkoutExercise.workout_id == workout_id)
        .order_by(WorkoutExercise.id)
    )

    return db.scalars(statement).all()


@router.post(
    "/{workout_id}/exercises",
    response_model=WorkoutExerciseResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_exercise_to_workout(
    workout_id: int,
    data: WorkoutExerciseCreate,
    db: Session = Depends(get_db),
):
    workout = db.get(Workout, workout_id)

    if not workout:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тренировка не найдена",
        )

    exercise = db.get(Exercise, data.exercise_id)

    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Упражнение не найдено",
        )

    workout_exercise = WorkoutExercise(
        workout_id=workout_id,
        **data.model_dump(),
    )

    db.add(workout_exercise)
    db.commit()
    db.refresh(workout_exercise)

    return workout_exercise


@router.put(
    "/{workout_id}/exercises/{workout_exercise_id}",
    response_model=WorkoutExerciseResponse,
)
def update_workout_exercise(
    workout_id: int,
    workout_exercise_id: int,
    data: WorkoutExerciseCreate,
    db: Session = Depends(get_db),
):
    workout_exercise = db.get(WorkoutExercise, workout_exercise_id)

    if not workout_exercise or workout_exercise.workout_id != workout_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Упражнение в тренировке не найдено",
        )

    exercise = db.get(Exercise, data.exercise_id)

    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Упражнение не найдено",
        )

    for field_name, value in data.model_dump().items():
        setattr(workout_exercise, field_name, value)

    db.commit()
    db.refresh(workout_exercise)

    return workout_exercise


@router.delete(
    "/{workout_id}/exercises/{workout_exercise_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_exercise_from_workout(
    workout_id: int,
    workout_exercise_id: int,
    db: Session = Depends(get_db),
):
    workout_exercise = db.get(WorkoutExercise, workout_exercise_id)

    if not workout_exercise or workout_exercise.workout_id != workout_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Упражнение в тренировке не найдено",
        )

    db.delete(workout_exercise)
    db.commit()