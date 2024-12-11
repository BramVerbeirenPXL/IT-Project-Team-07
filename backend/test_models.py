import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from models.user_model import User
from models.tree_model import Tree
from datetime import datetime



# SQLite in-memory database voor de tests
SQLALCHEMY_DATABASE_URL = "sqlite:///testing.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_create_user(db):
    new_user = User(username="testuser", hashed_password="hashedpassword")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    assert new_user.id is not None
    assert new_user.username == "testuser"
    assert new_user.hashed_password == "hashedpassword"

def test_get_user(db):
    new_user = User(username="testuser", hashed_password="hashedpassword")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    user = db.query(User).filter(User.username == "testuser").first()
    assert user is not None
    assert user.username == "testuser"
    assert user.hashed_password == "hashedpassword"


def test_create_tree(db):
    """Test het aanmaken van een Tree object in de database."""
    new_tree = Tree(
        name="Maple Tree",
        description="A beautiful maple tree.",
        latitude=50.1234,
        longitude=4.5678
    )
    db.add(new_tree)
    db.commit()

    tree = db.query(Tree).first()
    assert tree is not None
    assert tree.name == "Maple Tree"
    assert tree.description == "A beautiful maple tree."
    assert float(tree.latitude) == 50.1234
    assert float(tree.longitude) == 4.5678
    assert isinstance(tree.added_at, datetime)

def test_read_trees(db):
    """Test het ophalen van meerdere Tree objecten."""
    trees = [
        Tree(name="Oak Tree", description="A strong oak tree.", latitude=51.1, longitude=4.1),
        Tree(name="Pine Tree", description="A tall pine tree.", latitude=52.2, longitude=5.2),
    ]
    db.add_all(trees)
    db.commit()

    results = db.query(Tree).all()
    assert len(results) == 2
    assert results[0].name == "Oak Tree"
    assert results[1].name == "Pine Tree"

def test_update_tree(db):
    """Test het updaten van een Tree object."""
    new_tree = Tree(
        name="Old Tree",
        description="An old tree.",
        latitude=50.1234,
        longitude=4.5678
    )
    db.add(new_tree)
    db.commit()

    tree = db.query(Tree).first()
    tree.name = "Updated Tree"
    tree.description = "A newly updated tree."
    db.commit()

    updated_tree = db.query(Tree).first()
    assert updated_tree.name == "Updated Tree"
    assert updated_tree.description == "A newly updated tree."

def test_delete_tree(db):
    """Test het verwijderen van een Tree object."""
    new_tree = Tree(
        name="Temporary Tree",
        description="This tree will be deleted.",
        latitude=49.9876,
        longitude=3.4567
    )
    db.add(new_tree)
    db.commit()

    tree = db.query(Tree).first()
    db.delete(tree)
    db.commit()

    remaining_trees = db.query(Tree).all()
    assert len(remaining_trees) == 0