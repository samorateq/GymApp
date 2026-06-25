import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/main.css";

import {
  getExercise,
  updateExercise,
  type CreateExerciseData,
} from "../api/exercisesApi";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Контейнер #app не найден");
}

const params = new URLSearchParams(window.location.search);
const exerciseId = Number(params.get("id"));

if (!exerciseId || Number.isNaN(exerciseId)) {
  app.innerHTML = `
    <main class="container py-5">
      <div class="alert alert-danger">
        Некорректный идентификатор упражнения.
      </div>

      <a href="/exercises.html" class="btn btn-primary">
        К каталогу упражнений
      </a>
    </main>
  `;
} else {
  void renderPage();
}

async function renderPage(): Promise<void> {
  app.innerHTML = `
    <main class="container py-5 text-center">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-secondary">Загрузка упражнения...</p>
    </main>
  `;

  try {
    const exercise = await getExercise(exerciseId);

    app.innerHTML = `
      <header class="bg-dark text-white shadow-sm">
        <div class="container py-3 d-flex justify-content-between align-items-center">
          <a class="navbar-brand fw-bold fs-3 text-white text-decoration-none" href="/">
            GYMAPP
          </a>

          <a class="btn btn-outline-light" href="/exercises.html">
            ← К упражнениям
          </a>
        </div>
      </header>

      <main class="container py-5">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-8">
            <div class="mb-4">
              <h1 class="display-6 fw-bold mb-2">
                Редактирование упражнения
              </h1>

              <p class="text-secondary mb-0">
                Измените данные упражнения и сохраните изменения.
              </p>
            </div>

            <div class="card border-0 shadow-sm">
              <div class="card-body p-4 p-md-5">
                <form id="exercise-form" novalidate>
                  <div id="form-error" class="alert alert-danger d-none"></div>

                  <div class="mb-3">
                    <label for="title" class="form-label">
                      Название упражнения <span class="text-danger">*</span>
                    </label>

                    <input
                      id="title"
                      class="form-control"
                      type="text"
                      minlength="2"
                      maxlength="100"
                      required
                      value="${escapeHtml(exercise.title)}"
                    >
                  </div>

                  <div class="mb-3">
                    <label for="description" class="form-label">
                      Описание
                    </label>

                    <textarea
                      id="description"
                      class="form-control"
                      rows="4"
                      maxlength="500"
                    >${escapeHtml(exercise.description ?? "")}</textarea>
                  </div>

                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label for="muscle-group" class="form-label">
                        Группа мышц <span class="text-danger">*</span>
                      </label>

                      <select id="muscle-group" class="form-select" required>
                        ${createOption("Грудь", exercise.muscle_group)}
                        ${createOption("Спина", exercise.muscle_group)}
                        ${createOption("Ноги", exercise.muscle_group)}
                        ${createOption("Плечи", exercise.muscle_group)}
                        ${createOption("Бицепс", exercise.muscle_group)}
                        ${createOption("Трицепс", exercise.muscle_group)}
                        ${createOption("Пресс", exercise.muscle_group)}
                        ${createOption("Кардио", exercise.muscle_group)}
                        ${createOption("Все тело", exercise.muscle_group)}
                      </select>
                    </div>

                    <div class="col-12 col-md-6">
                      <label for="difficulty" class="form-label">
                        Сложность <span class="text-danger">*</span>
                      </label>

                      <select id="difficulty" class="form-select" required>
                        ${createOption("Лёгкая", exercise.difficulty)}
                        ${createOption("Средняя", exercise.difficulty)}
                        ${createOption("Высокая", exercise.difficulty)}
                      </select>
                    </div>

                    <div class="col-12">
                      <label for="equipment" class="form-label">
                        Оборудование
                      </label>

                      <input
                        id="equipment"
                        class="form-control"
                        type="text"
                        maxlength="100"
                        value="${escapeHtml(exercise.equipment ?? "")}"
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

                    <a class="btn btn-outline-secondary" href="/exercises.html">
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
              : "Не удалось загрузить упражнение"
          }
        </div>

        <a href="/exercises.html" class="btn btn-primary">
          К каталогу упражнений
        </a>
      </main>
    `;
  }
}

function setupForm(): void {
  const form = document.querySelector<HTMLFormElement>("#exercise-form");
  const errorBox = document.querySelector<HTMLDivElement>("#form-error");
  const submitButton =
    document.querySelector<HTMLButtonElement>("#submit-button");

  const titleInput = document.querySelector<HTMLInputElement>("#title");
  const descriptionInput =
    document.querySelector<HTMLTextAreaElement>("#description");
  const muscleGroupSelect =
    document.querySelector<HTMLSelectElement>("#muscle-group");
  const difficultySelect =
    document.querySelector<HTMLSelectElement>("#difficulty");
  const equipmentInput =
    document.querySelector<HTMLInputElement>("#equipment");

  if (
    !form ||
    !errorBox ||
    !submitButton ||
    !titleInput ||
    !descriptionInput ||
    !muscleGroupSelect ||
    !difficultySelect ||
    !equipmentInput
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

    const data: CreateExerciseData = {
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim() || null,
      muscle_group: muscleGroupSelect.value,
      equipment: equipmentInput.value.trim() || null,
      difficulty: difficultySelect.value,
    };

    submitButton.disabled = true;
    submitButton.textContent = "Сохранение...";

    try {
      await updateExercise(exerciseId, data);
      window.location.href = "/exercises.html";
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