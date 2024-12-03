from sqlalchemy.orm import Session
import sys
sys.path.append("..")
from models.tree import Tree
from fastapi import HTTPException


def create_tree(db: Session, name: str, description: str, latitude: float, longitude: float):
    db_tree = Tree(name=name, description=description, latitude=latitude, longitude=longitude)
    db.add(db_tree)
    db.commit()
    db.refresh(db_tree)
    return db_tree

def get_all_trees(db: Session):
    return db.query(Tree).all()

def delete_tree(db: Session, tree_id: int):
    db_tree = db.query(Tree).filter(Tree.id == tree_id).first()
    if not db_tree:
        raise HTTPException(status_code=404, detail="Tree not found")
    db.delete(db_tree)
    db.commit()
    return {"message": "Tree deleted successfully"}
