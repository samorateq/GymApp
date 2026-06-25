import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/main.css";

import {
  createWorkout,
  type CreateWorkoutData,
} from "../api/workoutsApi";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Контейнер #app не найден");
}

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
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="mb-4">
          <h1 class="display-6 fw-bold mb-2">Добавление тренировки</h1>
          <p class="text-secondary mb-0">
            Заполните информацию о новой тренировке.
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
                  placeholder="Например: Тренировка ног"
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
                  placeholder="Кратко опишите тренировку"
                ></textarea>
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
                    <option value="">Выберите тип</option>
                    <option value="Силовая">Силовая</option>
                    <option value="Кардио">Кардио</option>
                    <option value="Растяжка">Растяжка</option>
                    <option value="Функциональная">Функциональная</option>
                    <option value="Смешанная">Смешанная</option>
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
                    <option value="">Выберите сложность</option>
                    <option value="Лёгкая">Лёгкая</option>
                    <option value="Средняя">Средняя</option>
                    <option value="Высокая">Высокая</option>
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
                    placeholder="60"
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
                  >
                </div>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button
                  id="submit-button"
                  class="btn btn-primary"
                  type="submit"
                >
                  Добавить тренировку
                </button>

                <a class="btn btn-outline-secondary" href="/">
                  Отмена
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>

  <div class="modal fade" id="success-modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header">
          <h2 class="modal-title fs-5">Готово</h2>
        </div>

        <div class="modal-body">
          Тренировка успешно добавлена.
        </div>

        <div class="modal-footer">
          <a id="details-link" class="btn btn-primary" href="#">
            Открыть тренировку
          </a>

          <a class="btn btn-outline-secondary" href="/">
            К списку
          </a>
        </div>
      </div>
    </div>
  </div>
`;

const form = document.querySelector<HTMLFormElement>("#workout-form");
const errorBox = document.querySelector<HTMLDivElement>("#form-error");
const submitButton =
  document.querySelector<HTMLButtonElement>("#submit-button");
const detailsLink =
  document.querySelector<HTMLAnchorElement>("#details-link");

if (!form || !errorBox || !submitButton || !detailsLink) {
  throw new Error("Не найдены элементы формы");
}

function showError(message: string): void {
  errorBox.textContent = message;
  errorBox.classList.remove("d-none");
}

function hideError(): void {
  errorBox.textContent = "";
  errorBox.classList.add("d-none");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

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
  submitButton.textContent = "Добавление...";

  try {
    const workout = await createWorkout(data);

    detailsLink.href = `/workout.html?id=${workout.id}`;

    const modalElement =
      document.querySelector<HTMLDivElement>("#success-modal");

    if (!modalElement) {
      throw new Error("Не найдено модальное окно");
    }

    const { Modal } = await import("bootstrap");
    new Modal(modalElement).show();

    form.reset();
    form.classList.remove("was-validated");
  } catch (error) {
    showError(
      error instanceof Error
        ? error.message
        : "Не удалось добавить тренировку",
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Добавить тренировку";
  }
});