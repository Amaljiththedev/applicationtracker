from fastapi import HTTPException, status

from app.db.database import get_supabase_client
from app.repositories.application_repo import ApplicationRepository
from app.repositories.user_repo import UserRepository
from app.schemas.application_schema import ApplicationCreate, ApplicationUpdate

class ApplicationService:
    def _get_repositories(self) -> tuple[ApplicationRepository, UserRepository]:
        try:
            supabase_client = get_supabase_client()
        except RuntimeError as error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(error),
            ) from error

        return ApplicationRepository(supabase_client), UserRepository(supabase_client)

    def create_application(self, payload: ApplicationCreate, user: dict) -> dict:
        application_repo, user_repo = self._get_repositories()
        user_repo.upsert(user["id"], user.get("email"))
        data = payload.model_dump()
        data["user_id"] = user["id"]
        return application_repo.create(data)

    def list_applications(self, user: dict) -> list[dict]:
        application_repo, user_repo = self._get_repositories()
        user_repo.upsert(user["id"], user.get("email"))
        return application_repo.list_all(user["id"])

    def update_application(
        self, application_id: str, payload: ApplicationUpdate, user: dict
    ) -> dict:
        application_repo, _ = self._get_repositories()
        updated = application_repo.update(application_id, user["id"], payload.model_dump())
        if not updated:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found",
            )
        return updated

    def delete_application(self, application_id: str, user: dict) -> dict:
        application_repo, _ = self._get_repositories()
        deleted = application_repo.delete(application_id, user["id"])
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found",
            )
        return {"deleted": True}
