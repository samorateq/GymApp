from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import app.models
from app.routers.exercises import router as exercises_router
from app.routers.workouts import router as workouts_router
from app.routers.workout_exercises import router as workout_exercises_router

app = FastAPI(
    title="GymApp API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workouts_router)
app.include_router(exercises_router)
app.include_router(workout_exercises_router)

@app.get("/")
def root():
    return {"message": "GymApp API is running"}