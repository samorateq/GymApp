import type { Workout, WorkoutListResponse } from "../types/workout";

const API_URL = "http://127.0.0.1:8000/api";

export interface GetWorkoutsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface CreateWorkoutData {
  title: string;
  description: string | null;
  training_type: string;
  difficulty: string;
  duration_minutes: number;
  planned_date: string | null;
}

export async function getWorkouts(
  params: GetWorkoutsParams = {},
): Promise<WorkoutListResponse> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 5),
    sort_by: params.sortBy ?? "id",
    order: params.order ?? "asc",
  });

  if (params.search) {
    query.set("search", params.search);
  }

  const response = await fetch(
    `${API_URL}/workouts?${query.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Не удалось загрузить список тренировок");
  }

  return response.json();
}

export async function createWorkout(
  data: CreateWorkoutData,
): Promise<Workout> {
  const response = await fetch(`${API_URL}/workouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    if (errorData?.detail) {
      throw new Error("Проверьте корректность заполнения формы.");
    }

    throw new Error("Не удалось добавить тренировку");
  }

  return response.json();
}
export async function getWorkout(id: number): Promise<Workout> {
  const response = await fetch(`${API_URL}/workouts/${id}`);

  if (!response.ok) {
    throw new Error("Тренировка не найдена");
  }

  return response.json();
}

export async function completeWorkout(id: number): Promise<Workout> {
  const response = await fetch(`${API_URL}/workouts/${id}/complete`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("Не удалось отметить тренировку выполненной");
  }

  return response.json();
}

export async function updateWorkout(
  id: number,
  data: CreateWorkoutData,
): Promise<Workout> {
  const response = await fetch(`${API_URL}/workouts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Не удалось обновить тренировку");
  }

  return response.json();
}

export async function deleteWorkout(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/workouts/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Не удалось удалить тренировку");
  }
}