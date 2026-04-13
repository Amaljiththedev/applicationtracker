import os
from typing import Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security = HTTPBearer()


class AuthService:
    def __init__(self) -> None:
        self.jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

    def decode_access_token(self, token: str) -> dict[str, Any]:
        if not self.jwt_secret:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Backend missing SUPABASE_JWT_SECRET",
            )
        try:
            payload = jwt.decode(
                token,
                self.jwt_secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
            return payload
        except jwt.PyJWTError as error:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            ) from error

    def get_current_user(self, token: str) -> dict[str, Any]:
        payload = self.decode_access_token(token)
        user_id = payload.get("sub")
        email = payload.get("email")
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
