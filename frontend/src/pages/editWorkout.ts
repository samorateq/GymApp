import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/main.css";

import {
  getWorkout,
  updateWorkout,
  type CreateWorkoutData,
} from "../api/workoutsApi";

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
  void renderPage();
}

async function renderPage(): Promise<void> {
  app.innerHTML = `
    <main class="container py-5 text-center">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-secondary">Загрузка тренировки...</p>
    </main>
  `;

  try {
    const workout = await getWorkout(workoutId);

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
            <div class="mb-4">
              <h1 class="display-6 fw-bold mb-2">Редактирование тренировки</h1>
              <p class="text-secondary mb-0">
                Измените нужные параметры и сохраните изменения.
              </p>
            </div>

            <div class="card border-0 shadow-sm">
              <div class="card-body p-4 p-md-5">
                <form id="workout-form" novalidate>
                  <div id="form-error" class="alert alert-danger d-none"></div>

                  <div class="mb-3">
                    <label for="title" class="form-label">
                      Название тренировки <span class="text-danger">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      class="form-control"
                      type="text"
                      minlength="2"
                      maxlength="100"
                      required
                      value="${escapeHtml(workout.title)}"
                    >
                  </div>

                  <div class="mb-3">
                    <label for="description" class="form-label">Описание</label>
                    <textarea
                      id="description"
                      name="description"
                      class="form-control"
                      rows="4"
                      maxlength="500"
                    >${escapeHtml(workout.description ?? "")}</textarea>
                  </div>

                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label for="training-type" class="form-label">
                        Тип тренировки <span class="text-danger">*</span>
                      </label>

                      <select
                        id="training-type"
                        name="training_type"
                        class="form-select"
                        required
                      >
                        ${createOption("Силовая", workout.training_type)}
                        ${createOption("Кардио", workout.training_type)}
                        ${createOption("Растяжка", workout.training_type)}
                        ${createOption("Функциональная", workout.training_type)}
                        ${createOption("Смешанная", workout.training_type)}
                      </select>
                    </div>

                    <div class="col-12 col-md-6">
                      <label for="difficulty" class="form-label">
                        Сложность <span class="text-danger">*</span>
                      </label>

                      <select
                        id="difficulty"
                        name="difficulty"
                        class="form-select"
                        required
                      >
                        ${createOption("Лёгкая", workout.difficulty)}
                        ${createOption("Средняя", workout.difficulty)}
                        ${createOption("Высокая", workout.difficulty)}
                      </select>
                    </div>

                    <div class="col-12 col-md-6">
                      <label for="duration" class="form-label">
                        Длительность, минут <span class="text-danger">*</span>
                      </label>

                      <input
                        id="duration"
                        name="duration_minutes"
                        class="form-control"
                        type="number"
                        min="1"
                        max="600"
                        required
                        value="${workout.duration_minutes}"
                      >
                    </div>

                    <div class="col-12 col-md-6">
                      <label for="planned-date" class="form-label">
                        Дата тренировки
                      </label>

                      <input
                        id="planned-date"
                        name="planned_date"
                        class="form-control"
                        type="date"
                        value="${workout.planned_date ?? ""}"
                      >
                    </div>
                  </div>

                  <div class="d-flex gap-2 mt-4">
                    <button
                      id="submit-button"
                      class="btn btn-primary"
                      type="submit"
                    >
                      Сохранить изменения
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
              : "Не удалось загрузить тренировку"
          }
        </div>

        <a href="/" class="btn btn-primary">К списку тренировок</a>
      </main>
    `;
  }
}

function setupForm(): void {
  const form = document.querySelector<HTMLFormElement>("#workout-form");
  const errorBox = document.querySelector<HTMLDivElement>("#form-error");
  const submitButton =
    document.querySelector<HTMLButtonElement>("#submit-button");

  if (!form || !errorBox || !submitButton) {
    throw new Error("Не найдены элементы формы");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    errorBox.classList.add("d-none");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const formData = new FormData(form);

    const data: CreateWorkoutData = {
      title: String(formData.get("title")).trim(),
      description: String(formData.get("description")).trim() || null,
      training_type: String(formData.get("training_type")),
      difficulty: String(formData.get("difficulty")),
      duration_minutes: Number(formData.get("duration_minutes")),
      planned_date: String(formData.get("planned_date")) || null,
    };

    submitButton.disabled = true;
    submitButton.textContent = "Сохранение...";

    try {
      await updateWorkout(workoutId, data);

      window.location.href = `/workout.html?id=${workoutId}`;
    } catch (error) {
      errorBox.textContent =
        error instanceof Error
          ? error.message
          : "Не удалось сохранить изменения";

      errorBox.classList.remove("d-none");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Сохранить изменения";
    }
  });
}

function createOption(value: string, selectedValue: string): string {
  return `
    <option value="${value}" ${value === selectedValue ? "selected" : ""}>
      ${value}
    </option>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}