import os
from typing import Any

import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer()


class AuthService:
    def __init__(self) -> None:
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    def fetch_user_from_supabase(self, token: str) -> dict[str, Any]:
        if not self.supabase_url or not self.supabase_service_role_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Backend missing Supabase configuration",
            )

        response = requests.get(
            f"{self.supabase_url}/auth/v1/user",
            headers={
                "apikey": self.supabase_service_role_key,
                "Authorization": f"Bearer {token}",
            },
            timeout=10,
        )
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        return response.json()

    def get_current_user(self, token: str) -> dict[str, Any]:
        user_data = self.fetch_user_from_supabase(token)
        user_id = user_data.get("id")
        email = user_data.get("email")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing subject claim",
            )

        return {"id": user_id, "email": email}


auth_service = AuthService()


def current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict[str, Any]:
    return auth_service.get_current_user(credentials.credentials)
