from fastapi import APIRouter, Depends, HTTPException, status, Request
from services.token_service import revoke_token, verify_token
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter()


class TokenRequest(BaseModel):
    username: str
    password: str


def standard_response(success: bool, message: str, data: dict | None = None):
    return {"success": success, "message": message, "data": data}


@router.get("/verify-token/{token}")
def verify_user_token(token: str, db: Session = Depends(get_db)):
    """
    Verify the validity of a token.
    """
    verify_token(token, db)
    return standard_response(True, "Token is valid")


@router.post("/revoke-token/{token}")
def revoke_user_token(token: str, db: Session = Depends(get_db)):
    """
    Revoke a token, making it unusable for future authentication.
    """
    try:
        revoke_token(token, db)
        return standard_response(True, "Token has been revoked.")
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code, detail=standard_response(False, e.detail)
        )
