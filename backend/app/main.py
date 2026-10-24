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
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
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

