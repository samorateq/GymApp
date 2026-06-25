import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/main.css";

import { getWorkouts } from "./api/workoutsApi";
import { createWorkoutCard } from "./components/workoutCard";

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
        <a class="btn btn-outline-light" href="/exercises.html">
          Упражнения
        </a>
      
        <a class="btn btn-primary" href="/addEntity.html">
          + Добавить тренировку
        </a>
      </div>
    </div>
  </header>

  <main class="container py-5">
    <section>
      <div class="mb-4">
        <h1 class="display-6 fw-bold mb-2">Мои тренировки</h1>
        <p class="text-secondary mb-0">
          Планируй занятия и отмечай выполненные тренировки.
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
                placeholder="Например: ноги или кардио"
              >
            </div>

            <div class="col-6 col-md-2">
              <label for="sort-select" class="form-label">Сортировка</label>
              <select id="sort-select" class="form-select">
                <option value="id">По ID</option>
                <option value="title">По названию</option>
                <option value="duration_minutes">По длительности</option>
                <option value="planned_date">По дате</option>
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

      <div id="workouts" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"></div>

      <div id="pagination" class="d-flex justify-content-center align-items-center gap-3 mt-5"></div>
    </section>
  </main>

  <footer class="border-top bg-white">
    <div class="container py-3 text-center text-secondary">
      GYMAPP © 2026
    </div>
  </footer>
`;

const workoutsContainer =
  document.querySelector<HTMLDivElement>("#workouts");

const paginationContainer =
  document.querySelector<HTMLDivElement>("#pagination");

const searchInput =
  document.querySelector<HTMLInputElement>("#search-input");

const searchButton =
  document.querySelector<HTMLButtonElement>("#search-button");

const sortSelect =
  document.querySelector<HTMLSelectElement>("#sort-select");

const orderSelect =
  document.querySelector<HTMLSelectElement>("#order-select");

const limitSelect =
  document.querySelector<HTMLSelectElement>("#limit-select");

if (
  !workoutsContainer ||
  !paginationContainer ||
  !searchInput ||
  !searchButton ||
  !sortSelect ||
  !orderSelect ||
  !limitSelect
) {
  throw new Error("Не найдены элементы страницы");
}

async function loadWorkouts(): Promise<void> {
  workoutsContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3 text-secondary">Загрузка тренировок...</p>
    </div>
  `;

  paginationContainer.innerHTML = "";

  try {
    const data = await getWorkouts({
      page: currentPage,
      limit: currentLimit,
      search: currentSearch,
      sortBy: currentSortBy,
      order: currentOrder,
    });

    if (data.items.length === 0) {
      workoutsContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-light border text-center py-4">
            Тренировки не найдены.
          </div>
        </div>
      `;
      return;
    }

    workoutsContainer.innerHTML = "";

    data.items.forEach((workout) => {
      workoutsContainer.append(createWorkoutCard(workout));
    });

    renderPagination(data.page, data.total_pages, data.total);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неизвестная ошибка";

    workoutsContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          ${message}
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
  paginationContainer.innerHTML = `
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

  const prevButton =
    document.querySelector<HTMLButtonElement>("#prev-button");

  const nextButton =
    document.querySelector<HTMLButtonElement>("#next-button");

  prevButton?.addEventListener("click", () => {
    currentPage -= 1;
    void loadWorkouts();
  });

  nextButton?.addEventListener("click", () => {
    currentPage += 1;
    void loadWorkouts();
  });
}

function applyFilters(): void {
  currentSearch = searchInput.value.trim();
  currentSortBy = sortSelect.value;
  currentOrder = orderSelect.value as "asc" | "desc";
  currentPage = 1;

  void loadWorkouts();
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

  void loadWorkouts();
});

void loadWorkouts();