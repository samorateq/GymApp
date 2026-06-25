import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/main.css";

import {
  deleteExercise,
  getExercises,
} from "../api/exercisesApi";
import type { Exercise } from "../types/exercise";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Контейнер #app не найден");
}

let currentPage = 1;
let currentLimit = 5;
let currentSearch = "";
let currentSortBy = "id";
let currentOrder: "asc" | "desc" = "asc";

app.innerHTML = `
  <header class="bg-dark text-white shadow-sm">
    <div class="container py-3 d-flex justify-content-between align-items-center">
      <a class="navbar-brand fw-bold fs-3 text-white text-decoration-none" href="/">
        GYMAPP
      </a>

      <div class="d-flex gap-2">
        <a class="btn btn-outline-light" href="/">
          Тренировки
        </a>

        <a class="btn btn-primary" href="/addExercise.html">
          + Добавить упражнение
        </a>
      </div>
    </div>
  </header>

  <main class="container py-5">
    <div class="mb-4">
      <h1 class="display-6 fw-bold mb-2">Каталог упражнений</h1>
      <p class="text-secondary mb-0">
        Справочник упражнений для составления тренировок.
      </p>
    </div>

    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-md-5">
            <label for="search-input" class="form-label">Поиск</label>
            <input
              id="search-input"
              class="form-control"
              type="search"
              placeholder="Например: приседания"
            >
          </div>

          <div class="col-6 col-md-2">
            <label for="sort-select" class="form-label">Сортировка</label>
            <select id="sort-select" class="form-select">
              <option value="id">По ID</option>
              <option value="title">По названию</option>
              <option value="muscle_group">По группе мышц</option>
              <option value="difficulty">По сложности</option>
            </select>
          </div>

          <div class="col-6 col-md-2">
            <label for="order-select" class="form-label">Порядок</label>
            <select id="order-select" class="form-select">
              <option value="asc">По возрастанию</option>
              <option value="desc">По убыванию</option>
            </select>
          </div>

          <div class="col-6 col-md-1">
            <label for="limit-select" class="form-label">На стр.</label>
            <select id="limit-select" class="form-select">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </div>

          <div class="col-6 col-md-2">
            <button id="search-button" class="btn btn-primary w-100">
              Найти
            </button>
          </div>
        </div>
      </div>
    </div>

    <div id="exercise-list" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>

    <div id="pagination" class="d-flex justify-content-center align-items-center gap-3 mt-5"></div>
  </main>

  <footer class="border-top bg-white">
    <div class="container py-3 text-center text-secondary">
      GYMAPP © 2026
    </div>
  </footer>
`;

const exerciseList = document.querySelector<HTMLDivElement>("#exercise-list");
const pagination = document.querySelector<HTMLDivElement>("#pagination");
const searchInput = document.querySelector<HTMLInputElement>("#search-input");
const searchButton = document.querySelector<HTMLButtonElement>("#search-button");
const sortSelect = document.querySelector<HTMLSelectElement>("#sort-select");
const orderSelect = document.querySelector<HTMLSelectElement>("#order-select");
const limitSelect = document.querySelector<HTMLSelectElement>("#limit-select");

if (
  !exerciseList ||
  !pagination ||
  !searchInput ||
  !searchButton ||
  !sortSelect ||
  !orderSelect ||
  !limitSelect
) {
  throw new Error("Не найдены элементы страницы");
}

function createExerciseCard(exercise: Exercise): HTMLElement {
  const column = document.createElement("div");
  column.className = "col";

  column.innerHTML = `
    <article class="card workout-card h-100 border-0 shadow-sm">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start gap-2 mb-3">
          <span class="badge text-bg-primary">${exercise.muscle_group}</span>
          <span class="badge text-bg-secondary">${exercise.difficulty}</span>
        </div>

        <h2 class="h5 card-title">${exercise.title}</h2>

        <p class="card-text text-secondary">
          ${exercise.description ?? "Описание отсутствует"}
        </p>

        <p class="small text-secondary mt-auto mb-3">
          <strong>Оборудование:</strong>
          ${exercise.equipment ?? "Не требуется"}
        </p>

        <div class="d-flex gap-2">
          <a
            class="btn btn-sm btn-outline-primary flex-grow-1"
            href="/editExercise.html?id=${exercise.id}"
          >
            Редактировать
          </a>

          <button
            class="btn btn-sm btn-outline-danger delete-exercise-button"
            data-exercise-id="${exercise.id}"
          >
            Удалить
          </button>
        </div>
      </div>
    </article>
  `;

  return column;
}

async function loadExercises(): Promise<void> {
  exerciseList.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-secondary">Загрузка упражнений...</p>
    </div>
  `;

  pagination.innerHTML = "";

  try {
    const data = await getExercises({
      page: currentPage,
      limit: currentLimit,
      search: currentSearch,
      sortBy: currentSortBy,
      order: currentOrder,
    });

    if (data.items.length === 0) {
      exerciseList.innerHTML = `
        <div class="col-12">
          <div class="alert alert-light border text-center py-4">
            Упражнения не найдены.
          </div>
        </div>
      `;
      return;
    }

    exerciseList.innerHTML = "";

    data.items.forEach((exercise) => {
      exerciseList.append(createExerciseCard(exercise));
    });
    const deleteButtons = document.querySelectorAll<HTMLButtonElement>(
    ".delete-exercise-button",
  );
  
  deleteButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const exerciseId = Number(button.dataset.exerciseId);
    
      const confirmed = window.confirm(
        "Удалить упражнение? Оно также будет удалено из всех тренировок, где используется.",
      );
    
      if (!confirmed) {
        return;
      }
    
      button.disabled = true;
      button.textContent = "Удаление...";
    
      try {
        await deleteExercise(exerciseId);
      
        // Если на странице удалили последнюю карточку,
        // возвращаемся на предыдущую страницу.
        if (data.items.length === 1 && currentPage > 1) {
          currentPage -= 1;
        }
      
        void loadExercises();
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
    renderPagination(data.page, data.total_pages, data.total);
  } catch (error) {
    exerciseList.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          ${
            error instanceof Error
              ? error.message
              : "Не удалось загрузить упражнения"
          }
        </div>
      </div>
    `;
  }
}

function renderPagination(
  page: number,
  totalPages: number,
  total: number,
): void {
  pagination.innerHTML = `
    <button
      id="prev-button"
      class="btn btn-outline-primary"
      ${page === 1 ? "disabled" : ""}
    >
      ← Назад
    </button>

    <span class="text-secondary">
      Страница ${page} из ${totalPages} · всего: ${total}
    </span>

    <button
      id="next-button"
      class="btn btn-outline-primary"
      ${page === totalPages ? "disabled" : ""}
    >
      Далее →
    </button>
  `;

  const prevButton = document.querySelector<HTMLButtonElement>("#prev-button");
  const nextButton = document.querySelector<HTMLButtonElement>("#next-button");

  prevButton?.addEventListener("click", () => {
    currentPage -= 1;
    void loadExercises();
  });

  nextButton?.addEventListener("click", () => {
    currentPage += 1;
    void loadExercises();
  });
}

function applyFilters(): void {
  currentSearch = searchInput.value.trim();
  currentSortBy = sortSelect.value;
  currentOrder = orderSelect.value as "asc" | "desc";
  currentPage = 1;

  void loadExercises();
}

searchButton.addEventListener("click", applyFilters);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    applyFilters();
  }
});

sortSelect.addEventListener("change", applyFilters);
orderSelect.addEventListener("change", applyFilters);

limitSelect.addEventListener("change", () => {
  currentLimit = Number(limitSelect.value);
  currentPage = 1;

  void loadExercises();
});

void loadExercises();