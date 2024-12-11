from sqlalchemy.orm import Session
import sys
sys.path.append("..")
from models.tree_model import Tree
from fastapi import HTTPException
from sqlalchemy import and_, func
from fastapi import APIRouter, Depends, HTTPException, Request
from database import SessionLocal


def create_tree(tree: Tree, db: Session):
    radius = 0.0001
    db_tree = (
        db.query(Tree)
        .filter(
            func.abs(Tree.latitude - tree.latitude) < radius,
            func.abs(Tree.longitude - tree.longitude) < radius,
        )
        .first()
    )
    if db_tree:
        raise HTTPException(status_code=404, detail="Tree already exists!")
    db_tree = Tree(**tree.dict())
    db.add(db_tree)
    db.commit()
    db.refresh(db_tree)
    return db_tree

def get_all_trees(db: Session):
    return db.query(Tree).all()

def delete_tree(tree_id: int, db: Session):
    db_tree = db.query(Tree).filter(Tree.id == tree_id).first()
    if not db_tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    db.delete(db_tree)
    db.commit()
    return {"message": "Tree deleted successfully"}

def update_tree(tree_id: int, height: int, diameter: int, db: Session):
    db_tree = db.query(Tree).filter(Tree.id == tree_id).first()
    if not db_tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    db_tree.height = height
    db_tree.diameter = diameter
    db.commit()
    db.refresh(db_tree)
    return {"message": "Tree updated successfully"}
