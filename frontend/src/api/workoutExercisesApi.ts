import type { WorkoutExercise } from "../types/workoutExercise";

const API_URL = "http://127.0.0.1:8000/api";

export interface CreateWorkoutExerciseData {
  exercise_id: number;
  approaches: number;
  repetitions: number | null;
  weight: number | null;
  rest_seconds: number | null;
}

export async function getWorkoutExercises(
  workoutId: number,
): Promise<WorkoutExercise[]> {
  const response = await fetch(
    `${API_URL}/workouts/${workoutId}/exercises`,
  );

  if (!response.ok) {
    throw new Error("Не удалось загрузить упражнения тренировки");
  }

  return response.json();
}

export async function addExerciseToWorkout(
  workoutId: number,
  data: CreateWorkoutExerciseData,
): Promise<WorkoutExercise> {
  const response = await fetch(
    `${API_URL}/workouts/${workoutId}/exercises`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error("Не удалось добавить упражнение в тренировку");
  }

  return response.json();
}

export async function removeExerciseFromWorkout(
  workoutId: number,
  workoutExerciseId: number,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/workouts/${workoutId}/exercises/${workoutExerciseId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Не удалось удалить упражнение из тренировки");
  }
}

export async function updateWorkoutExercise(
  workoutId: number,
  workoutExerciseId: number,
  data: CreateWorkoutExerciseData,
): Promise<WorkoutExercise> {
  const response = await fetch(
    `${API_URL}/workouts/${workoutId}/exercises/${workoutExerciseId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error("Не удалось обновить параметры упражнения");
  }

  return response.json();
}