from fastapi import APIRouter, Depends

from app.services.auth_service import current_user

router = APIRouter()


@router.get("/me")
def get_me(user: dict = Depends(current_user)) -> dict:
    return user
