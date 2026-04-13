import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.application_routes import router as application_router
from app.api.auth_routes import router as auth_router

app = FastAPI(title="Application Tracker API")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(application_router, prefix="/applications", tags=["applications"])


@app.get("/")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
