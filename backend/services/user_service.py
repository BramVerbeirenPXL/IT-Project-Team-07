from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models.user_model import User
from fastapi import FastAPI, Depends, HTTPException, status
from database import SessionLocal

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def standard_response(success: bool, message: str, data: dict | None = None):
    return {"success": success, "message": message, "data": data}


def get_user_by_username(username: str, db: Session):
    return db.query(User).filter(User.username == username).first()


def create_user(username: str, password: str, db: Session):
    db_user = get_user_by_username(username, db)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail=standard_response(False, "Username already registered"),
        )
    hashed_password = pwd_context.hash(password)
    db_user = User(username=username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return standard_response(
        True,
        "User created successfully",
        {"user_id": db_user.id, "username": db_user.username},
    )


def authenticate_user(username: str, password: str, db: Session):
    user = get_user_by_username(username, db)
    if not user or not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=standard_response(False, "Incorrect username or password"),
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
