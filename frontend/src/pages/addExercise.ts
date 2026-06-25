import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/main.css";

import {
  createExercise,
  type CreateExerciseData,
} from "../api/exercisesApi";

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

      <a class="btn btn-outline-light" href="/exercises.html">
        ← К упражнениям
      </a>
    </div>
  </header>

  <main class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="mb-4">
          <h1 class="display-6 fw-bold mb-2">Добавление упражнения</h1>
          <p class="text-secondary mb-0">
            Добавьте новое упражнение в общий каталог.
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
                  name="title"
                  class="form-control"
                  type="text"
                  minlength="2"
                  maxlength="100"
                  required
                  placeholder="Например: Подтягивания"
                >
              </div>

              <div class="mb-3">
                <label for="description" class="form-label">
                  Описание
                </label>

                <textarea
                  id="description"
                  name="description"
                  class="form-control"
                  rows="4"
                  maxlength="500"
                  placeholder="Кратко опишите технику выполнения"
                ></textarea>
              </div>

              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label for="muscle-group" class="form-label">
                    Группа мышц <span class="text-danger">*</span>
                  </label>

                  <select
                    id="muscle-group"
                    name="muscle_group"
                    class="form-select"
                    required
                  >
                    <option value="">Выберите группу мышц</option>
                    <option value="Грудь">Грудь</option>
                    <option value="Спина">Спина</option>
                    <option value="Ноги">Ноги</option>
                    <option value="Плечи">Плечи</option>
                    <option value="Бицепс">Бицепс</option>
                    <option value="Трицепс">Трицепс</option>
                    <option value="Пресс">Пресс</option>
                    <option value="Кардио">Кардио</option>
                    <option value="Все тело">Все тело</option>
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

                <div class="col-12">
                  <label for="equipment" class="form-label">
                    Оборудование
                  </label>

                  <input
                    id="equipment"
                    name="equipment"
                    class="form-control"
                    type="text"
                    maxlength="100"
                    placeholder="Например: гантели, штанга, турник"
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

  <div class="modal fade" id="success-modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content border-0 shadow">
        <div class="modal-header">
          <h2 class="modal-title fs-5">Готово</h2>
        </div>

        <div class="modal-body">
          Упражнение успешно добавлено в каталог.
        </div>

        <div class="modal-footer">
          <a class="btn btn-primary" href="/exercises.html">
            К каталогу упражнений
          </a>
        </div>
      </div>
    </div>
  </div>
`;

const form = document.querySelector<HTMLFormElement>("#exercise-form");
const errorBox = document.querySelector<HTMLDivElement>("#form-error");
const submitButton =
  document.querySelector<HTMLButtonElement>("#submit-button");

if (!form || !errorBox || !submitButton) {
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

  const data: CreateExerciseData = {
    title: String(formData.get("title")).trim(),
    description: String(formData.get("description")).trim() || null,
    muscle_group: String(formData.get("muscle_group")),
    equipment: String(formData.get("equipment")).trim() || null,
    difficulty: String(formData.get("difficulty")),
  };

  submitButton.disabled = true;
  submitButton.textContent = "Добавление...";

  try {
    await createExercise(data);

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
        : "Не удалось добавить упражнение",
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Добавить упражнение";
  }
});