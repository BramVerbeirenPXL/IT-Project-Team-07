from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from services.user_service import authenticate_user, create_user
from services.token_service import create_access_token
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, timezone
import os

router = APIRouter()


class UserCreate(BaseModel):
    username: str
    password: str


SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def standard_response(success: bool, message: str, data: dict | None = None):
    return {"success": success, "message": message, "data": data}


@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(user.username, user.password, db)


@router.post("/login", tags=["Authentication"])
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(form_data.username, form_data.password, db)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    response = standard_response(
        True, "Login successful", {"access_token": access_token, "token_type": "bearer"}
    )
    response["access_token"] = access_token
    response["token_type"] = "bearer"

    return response
