export interface WorkoutExercise {
  id: number;
  workout_id: number;
  exercise_id: number;
  approaches: number;
  repetitions: number | null;
  weight: number | null;
  rest_seconds: number | null;
}