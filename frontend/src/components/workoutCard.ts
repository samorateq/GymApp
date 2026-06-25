import type { Workout } from "../types/workout";

export function createWorkoutCard(workout: Workout): HTMLElement {
  const column = document.createElement("div");
  column.className = "col";

  const statusClass = workout.is_completed ? "success" : "warning";
  const statusText = workout.is_completed ? "Выполнена" : "Запланирована";

  column.innerHTML = `
    <article class="card workout-card h-100 border-0 shadow-sm">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
          <span class="badge text-bg-primary">${workout.training_type}</span>
          <span class="badge text-bg-${statusClass}">${statusText}</span>
        </div>

        <h3 class="h5 card-title">${workout.title}</h3>

        <p class="card-text text-secondary">
          ${workout.description ?? "Описание отсутствует"}
        </p>

        <ul class="list-unstyled small text-secondary mb-4">
          <li><strong>Сложность:</strong> ${workout.difficulty}</li>
          <li><strong>Длительность:</strong> ${workout.duration_minutes} мин.</li>
          <li><strong>Дата:</strong> ${workout.planned_date ?? "не указана"}</li>
        </ul>

        <a
          class="btn btn-outline-primary mt-auto"
          href="/workout.html?id=${workout.id}"
        >
          Подробнее
        </a>
      </div>
    </article>
  `;

  return column;
}