# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.user_routes import router as user_router
from app.api.twin_routes import router as twin_router
from app.api.simulation_routes import router as simulation_router
from app.api.tracker_routes import router as tracker_router
from app.api.alert_routes import router as alert_router
from app.api.nutrition_routes import router as nutrition_router
from app.api.mlops_routes import router as mlops_router


from app.database.db import Base, engine

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BodyTwin Backend",
    version="1.0.0",
    description="AI-powered Digital Human Twin backend with MLOps support.",
)

# CORS for your v0 frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(user_router, prefix="/api/user", tags=["User"])
app.include_router(twin_router, prefix="/api/twin", tags=["Twin"])
app.include_router(simulation_router, prefix="/api/simulation", tags=["Simulation"])
app.include_router(tracker_router, prefix="/api/tracker", tags=["Tracker"])
app.include_router(alert_router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(nutrition_router, prefix="/api/nutrition", tags=["Nutrition"])
app.include_router(mlops_router, prefix="/api/mlops", tags=["MLOps"])

@app.get("/")
def root():
    return {"message": "BodyTwin Backend is running"}
