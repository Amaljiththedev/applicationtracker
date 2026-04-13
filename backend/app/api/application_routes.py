from fastapi import APIRouter, Depends

from app.schemas.application_schema import ApplicationCreate, ApplicationUpdate
from app.services.auth_service import current_user
from app.services.application_service import ApplicationService

router = APIRouter()
application_service = ApplicationService()


@router.post("/")
def create_application(payload: ApplicationCreate, user: dict = Depends(current_user)) -> dict:
    return application_service.create_application(payload, user)


@router.get("/")
def list_applications(user: dict = Depends(current_user)) -> list[dict]:
    return application_service.list_applications(user)


@router.put("/{application_id}")
def update_application(
    application_id: str,
    payload: ApplicationUpdate,
    user: dict = Depends(current_user),
) -> dict:
    return application_service.update_application(application_id, payload, user)


@router.delete("/{application_id}")
def delete_application(application_id: str, user: dict = Depends(current_user)) -> dict:
    return application_service.delete_application(application_id, user)
