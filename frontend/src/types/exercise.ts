export interface Exercise {
  id: number;
  title: string;
  description: string | null;
  muscle_group: string;
  equipment: string | null;
  difficulty: string;
}

export interface ExerciseListResponse {
  items: Exercise[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}