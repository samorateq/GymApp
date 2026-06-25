import type { Exercise, ExerciseListResponse } from "../types/exercise";

const API_URL = "http://127.0.0.1:8000/api";

export interface GetExercisesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface CreateExerciseData {
  title: string;
  description: string | null;
  muscle_group: string;
  equipment: string | null;
  difficulty: string;
}

export async function getExercises(
  params: GetExercisesParams = {},
): Promise<ExerciseListResponse> {
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
    `${API_URL}/exercises?${query.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Не удалось загрузить список упражнений");
  }

  return response.json();
}

export async function getExercise(id: number): Promise<Exercise> {
  const response = await fetch(`${API_URL}/exercises/${id}`);

  if (!response.ok) {
    throw new Error("Упражнение не найдено");
  }

  return response.json();
}

export async function createExercise(
  data: CreateExerciseData,
): Promise<Exercise> {
  const response = await fetch(`${API_URL}/exercises`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Не удалось добавить упражнение");
  }

  return response.json();
}

export async function updateExercise(
  id: number,
  data: CreateExerciseData,
): Promise<Exercise> {
  const response = await fetch(`${API_URL}/exercises/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Не удалось обновить упражнение");
  }

  return response.json();
}

export async function deleteExercise(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/exercises/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Не удалось удалить упражнение");
  }
}