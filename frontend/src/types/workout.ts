export interface Workout {
  id: number;
  title: string;
  description: string | null;
  training_type: string;
  difficulty: string;
  duration_minutes: number;
  planned_date: string | null;
  is_completed: boolean;
}

export interface WorkoutListResponse {
  items: Workout[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}