import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/main.css";

import {
  completeWorkout,
  deleteWorkout,
  getWorkout,
} from "../api/workoutsApi";
import { getExercise } from "../api/exercisesApi";
import {
  getWorkoutExercises,
  removeExerciseFromWorkout,
} from "../api/workoutExercisesApi";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Контейнер #app не найден");
}

const params = new URLSearchParams(window.location.search);
const workoutId = Number(params.get("id"));

if (!workoutId || Number.isNaN(workoutId)) {
  app.innerHTML = `
    <main class="container py-5">
      <div class="alert alert-danger">
        Некорректный идентификатор тренировки.
      </div>
      <a href="/" class="btn btn-primary">К списку тренировок</a>
    </main>
  `;
} else {
  void loadWorkoutPage();
}

async function loadWorkoutPage(): Promise<void> {
  app.innerHTML = `
    <main class="container py-5 text-center">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-secondary">Загрузка тренировки...</p>
    </main>
  `;

  try {
    const workout = await getWorkout(workoutId);
    const workoutExercises = await getWorkoutExercises(workoutId);

    const exercisesWithInfo = await Promise.all(
      workoutExercises.map(async (item) => {
        const exercise = await getExercise(item.exercise_id);

        return {
          ...item,
          title: exercise.title,
          muscleGroup: exercise.muscle_group,
        };
      }),
    );

    const statusText = workout.is_completed
      ? "Выполнена"
      : "Запланирована";

    const statusClass = workout.is_completed
      ? "success"
      : "warning";

    app.innerHTML = `
      <header class="bg-dark text-white shadow-sm">
        <div class="container py-3 d-flex justify-content-between align-items-center">
          <a class="navbar-brand fw-bold fs-3 text-white text-decoration-none" href="/">
            GYMAPP
          </a>

          <a class="btn btn-outline-light" href="/">
            ← К списку тренировок
          </a>
        </div>
      </header>

      <main class="container py-5">
        <div class="d-flex justify-content-between align-items-start gap-3 mb-4">
          <div>
            <div class="d-flex gap-2 mb-3">
              <span class="badge text-bg-primary">
                ${workout.training_type}
              </span>

              <span class="badge text-bg-${statusClass}">
                ${statusText}
              </span>
            </div>

            <h1 class="display-6 fw-bold">${workout.title}</h1>

            <p class="text-secondary mb-0">
              ${workout.description ?? "Описание отсутствует"}
            </p>
          </div>
        <div class="d-flex gap-2 flex-wrap">
          <a
            class="btn btn-outline-primary"
            href="/editWorkout.html?id=${workout.id}"
          >
            Редактировать
          </a>

          <button id="delete-button" class="btn btn-outline-danger">
            Удалить
          </button>

          ${
            workout.is_completed
              ? ""
              : `
                <button id="complete-button" class="btn btn-success">
                  ✓ Отметить выполненной
                </button>
              `
          }
        </div>
        </div>

        <div class="row g-4 mb-5">
          <div class="col-12 col-md-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="text-secondary small">Сложность</div>
                <div class="fs-5 fw-semibold">${workout.difficulty}</div>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="text-secondary small">Длительность</div>
                <div class="fs-5 fw-semibold">
                  ${workout.duration_minutes} мин.
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body">
                <div class="text-secondary small">Дата</div>
                <div class="fs-5 fw-semibold">
                  ${workout.planned_date ?? "Не указана"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <section>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="h3 mb-0">Упражнения</h2>
            <a
              class="btn btn-primary"
              href="/addExerciseToWorkout.html?workout_id=${workout.id}"
            >
              + Добавить упражнение
            </a>
          </div>

          <div id="exercise-list" class="vstack gap-3"></div>
        </section>
      </main>
    `;

    const exerciseList =
      document.querySelector<HTMLDivElement>("#exercise-list");

    if (!exerciseList) {
      throw new Error("Не найден контейнер упражнений");
    }

    if (exercisesWithInfo.length === 0) {
      exerciseList.innerHTML = `
        <div class="alert alert-light border">
          В эту тренировку пока не добавлены упражнения.
        </div>
      `;
    } else {
      exercisesWithInfo.forEach((item, index) => {
        const card = document.createElement("article");

        card.className = "card border-0 shadow-sm";

        card.innerHTML = `
          <div class="card-body">
            <div class="d-flex justify-content-between gap-3">
              <div>
                <div class="text-secondary small mb-1">
                  Упражнение ${index + 1} · ${item.muscleGroup}
                </div>

                <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <h3 class="h5 mb-0">${item.title}</h3>
                      
                  <div class="d-flex gap-2">
                    <a
                      class="btn btn-sm btn-outline-primary"
                      href="/editWorkoutExercise.html?workout_id=${workoutId}&id=${item.id}"
                    >
                      Редактировать
                    </a>
                      
                    <button
                      class="btn btn-sm btn-outline-danger delete-exercise-button"
                      data-workout-exercise-id="${item.id}"
                    >
                      Удалить
                    </button>
                  </div>
                </div>

                <div class="row small text-secondary">
                  <div class="col-6 col-md-3">
                    <strong>Подходы:</strong><br>
                    ${item.approaches}
                  </div>

                  <div class="col-6 col-md-3">
                    <strong>Повторения:</strong><br>
                    ${item.repetitions ?? "—"}
                  </div>

                  <div class="col-6 col-md-3">
                    <strong>Вес:</strong><br>
                    ${item.weight ?? "—"} кг
                  </div>

                  <div class="col-6 col-md-3">
                    <strong>Отдых:</strong><br>
                    ${item.rest_seconds ?? "—"} сек.
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

        exerciseList.append(card);
      });
    }
    
    const deleteExerciseButtons = document.querySelectorAll<HTMLButtonElement>(
      ".delete-exercise-button",
    );

    deleteExerciseButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const workoutExerciseId = Number(
          button.dataset.workoutExerciseId,
        );
      
        const confirmed = window.confirm(
          "Удалить упражнение из этой тренировки?",
        );
      
        if (!confirmed) {
          return;
        }
      
        button.disabled = true;
        button.textContent = "Удаление...";
      
        try {
          await removeExerciseFromWorkout(
            workoutId,
            workoutExerciseId,
          );
        
          void loadWorkoutPage();
        } catch (error) {
          alert(
            error instanceof Error
              ? error.message
              : "Не удалось удалить упражнение",
          );
        
          button.disabled = false;
          button.textContent = "Удалить";
        }
      });
    });

    const completeButton =
      document.querySelector<HTMLButtonElement>("#complete-button");

    completeButton?.addEventListener("click", async () => {
      completeButton.disabled = true;
      completeButton.textContent = "Сохранение...";

      try {
        await completeWorkout(workoutId);
        void loadWorkoutPage();
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Не удалось обновить тренировку",
        );

        completeButton.disabled = false;
        completeButton.textContent = "✓ Отметить выполненной";
      }
    });
  } catch (error) {
    app.innerHTML = `
      <main class="container py-5">
        <div class="alert alert-danger">
          ${
            error instanceof Error
              ? error.message
              : "Не удалось загрузить тренировку"
          }
        </div>

        <a href="/" class="btn btn-primary">
          К списку тренировок
        </a>
      </main>
    `;
  }
  const deleteButton =
    document.querySelector<HTMLButtonElement>("#delete-button");

  deleteButton?.addEventListener("click", async () => {
    const confirmed = window.confirm(
      "Удалить тренировку? Вместе с ней будут удалены связанные упражнения.",
    );

    if (!confirmed) {
      return;
    }

    deleteButton.disabled = true;
    deleteButton.textContent = "Удаление...";

    try {
      await deleteWorkout(workoutId);
      window.location.href = "/";
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Не удалось удалить тренировку",
      );

      deleteButton.disabled = false;
      deleteButton.textContent = "Удалить";
    }
  });
}