from jose import jwt, JWTError
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from models.revoked_token_model import RevokedToken
from fastapi import FastAPI, Depends, HTTPException, status

import os

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token.")
        revoked_token = db.query(RevokedToken).filter(RevokedToken.token == token).first()
        if revoked_token:
            raise HTTPException(status_code=401, detail="Token has been revoked.")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Token is invalid or expired.")

def revoke_token(token: str, db: Session):
    existing_token = db.query(RevokedToken).filter_by(token=token).first()
    if existing_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token has already been revoked.",
            headers={"WWW-Authenticate": "Bearer"},
        )           
    try:
        revoked_token = RevokedToken(token=token)
        db.add(revoked_token)
        db.commit()
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token is invalid or expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
