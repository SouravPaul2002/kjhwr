from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as forecast_router

app = FastAPI(
    title="UK Wind Forecast Analytics API",
    description="Wind generation forecast and accuracy analytics",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    forecast_router,
    prefix="/api",
    tags=["Forecasts"],
)

@app.get("/")
def root():
    return {"message": "Wind Forecast Analytics API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

