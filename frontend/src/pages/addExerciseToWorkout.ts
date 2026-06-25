import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/main.css";

import { getExercises } from "../api/exercisesApi";
import {
  addExerciseToWorkout,
  type CreateWorkoutExerciseData,
} from "../api/workoutExercisesApi";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Контейнер #app не найден");
}

const params = new URLSearchParams(window.location.search);
const workoutId = Number(params.get("workout_id"));

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
  void renderPage();
}

async function renderPage(): Promise<void> {
  app.innerHTML = `
    <main class="container py-5 text-center">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-secondary">Загрузка упражнений...</p>
    </main>
  `;

  try {
    const data = await getExercises({
      page: 1,
      limit: 15,
      sortBy: "title",
      order: "asc",
    });

    app.innerHTML = `
      <header class="bg-dark text-white shadow-sm">
        <div class="container py-3 d-flex justify-content-between align-items-center">
          <a class="navbar-brand fw-bold fs-3 text-white text-decoration-none" href="/">
            GYMAPP
          </a>

          <a class="btn btn-outline-light" href="/workout.html?id=${workoutId}">
            ← К тренировке
          </a>
        </div>
      </header>

      <main class="container py-5">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-8">
            <h1 class="display-6 fw-bold mb-2">Добавление упражнения</h1>
            <p class="text-secondary mb-4">
              Укажите параметры упражнения для этой тренировки.
            </p>

            <div class="card border-0 shadow-sm">
              <div class="card-body p-4 p-md-5">
                <form id="exercise-form" novalidate>
                  <div id="form-error" class="alert alert-danger d-none"></div>

                  <div class="mb-3">
                    <label for="exercise-id" class="form-label">
                      Упражнение <span class="text-danger">*</span>
                    </label>

                    <select
                      id="exercise-id"
                      class="form-select"
                      required
                    >
                      <option value="">Выберите упражнение</option>
                      ${data.items
                        .map(
                          (exercise) => `
                            <option value="${exercise.id}">
                              ${exercise.title} — ${exercise.muscle_group}
                            </option>
                          `,
                        )
                        .join("")}
                    </select>
                  </div>

                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label for="approaches" class="form-label">
                        Подходы <span class="text-danger">*</span>
                      </label>

                      <input
                        id="approaches"
                        class="form-control"
                        type="number"
                        min="1"
                        max="10"
                        required
                        value="3"
                      >
                    </div>

                    <div class="col-12 col-md-6">
                      <label for="repetitions" class="form-label">
                        Повторения
                      </label>

                      <input
                        id="repetitions"
                        class="form-control"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Например: 12"
                      >
                    </div>

                    <div class="col-12 col-md-6">
                      <label for="weight" class="form-label">
                        Вес, кг
                      </label>

                      <input
                        id="weight"
                        class="form-control"
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="Например: 40"
                      >
                    </div>

                    <div class="col-12 col-md-6">
                      <label for="rest-seconds" class="form-label">
                        Отдых, секунд
                      </label>

                      <input
                        id="rest-seconds"
                        class="form-control"
                        type="number"
                        min="0"
                        max="3600"
                        placeholder="Например: 90"
                      >
                    </div>
                  </div>

                  <div class="d-flex gap-2 mt-4">
                    <button
                      id="submit-button"
                      class="btn btn-primary"
                      type="submit"
                    >
                      Добавить упражнение
                    </button>

                    <a
                      class="btn btn-outline-secondary"
                      href="/workout.html?id=${workoutId}"
                    >
                      Отмена
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    `;

    setupForm();
  } catch (error) {
    app.innerHTML = `
      <main class="container py-5">
        <div class="alert alert-danger">
          ${
            error instanceof Error
              ? error.message
              : "Не удалось загрузить страницу"
          }
        </div>
      </main>
    `;
  }
}

function setupForm(): void {
  const form = document.querySelector<HTMLFormElement>("#exercise-form");
  const errorBox = document.querySelector<HTMLDivElement>("#form-error");
  const submitButton =
    document.querySelector<HTMLButtonElement>("#submit-button");

  const exerciseSelect =
    document.querySelector<HTMLSelectElement>("#exercise-id");

  const approachesInput =
    document.querySelector<HTMLInputElement>("#approaches");

  const repetitionsInput =
    document.querySelector<HTMLInputElement>("#repetitions");

  const weightInput =
    document.querySelector<HTMLInputElement>("#weight");

  const restInput =
    document.querySelector<HTMLInputElement>("#rest-seconds");

  if (
    !form ||
    !errorBox ||
    !submitButton ||
    !exerciseSelect ||
    !approachesInput ||
    !repetitionsInput ||
    !weightInput ||
    !restInput
  ) {
    throw new Error("Не найдены элементы формы");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorBox.classList.add("d-none");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const data: CreateWorkoutExerciseData = {
      exercise_id: Number(exerciseSelect.value),
      approaches: Number(approachesInput.value),
      repetitions: repetitionsInput.value
        ? Number(repetitionsInput.value)
        : null,
      weight: weightInput.value ? Number(weightInput.value) : null,
      rest_seconds: restInput.value ? Number(restInput.value) : null,
    };

    submitButton.disabled = true;
    submitButton.textContent = "Добавление...";

    try {
      await addExerciseToWorkout(workoutId, data);

      window.location.href = `/workout.html?id=${workoutId}`;
    } catch (error) {
      errorBox.textContent =
        error instanceof Error
          ? error.message
          : "Не удалось добавить упражнение";

      errorBox.classList.remove("d-none");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Добавить упражнение";
    }
  });
}