from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from services.token_service import verify_token
from services.tree_service import create_tree, delete_tree, update_tree, get_all_trees
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


class TreeCreate(BaseModel):
    name: str
    description: str | None = None
    latitude: float
    longitude: float


class TreeUpdate(BaseModel):
    height: float | None = None
    diameter: float | None = None


@router.get("/trees")
def get_trees(db: Session = Depends(get_db)):
    return get_all_trees(db)


@router.post("/trees")
def create(
    tree: TreeCreate,
    request: Request,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="Missing or invalid Authorization header."
        )
    token = auth_header.split(" ")[1]
    verify_token(token, db)
    return create_tree(tree, db)


@router.delete("/trees/{tree_id}")
def delete(
    tree_id: int,
    request: Request,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="Missing or invalid Authorization header."
        )
    token = auth_header.split(" ")[1]
    verify_token(token, db)
    return delete_tree(tree_id, db)


@router.put("/trees/{tree_id}")
def update(
    tree_id: int,
    tree: TreeUpdate,
    request: Request,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="Missing or invalid Authorization header."
        )
    token = auth_header.split(" ")[1]
    verify_token(token, db)
    return update_tree(tree_id, tree.height, tree.diameter, db)
