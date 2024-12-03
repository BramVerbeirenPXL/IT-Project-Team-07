import os
import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import app
from database import Base, get_db

# SQLite in-memory database voor de tests
SQLALCHEMY_DATABASE_URL = "sqlite:///testing.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def client():
    with TestClient(app) as c:
        # Database tabellen aanmaken
        Base.metadata.create_all(bind=engine)
        yield c
        # Droppen van de tabellen na de tests
        Base.metadata.drop_all(bind=engine)

def test_register_user(client):
    response = client.post(
        "/register",
        json={"username": "testuser", "password": "testpassword"},
    )
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "User created successfully",
        "data": {"user_id": 1, "username": "testuser"}
    }


def test_register_user_already_exists(client):
    client.post(
        "/register",
        json={"username": "testuser", "password": "testpassword"},
    )
    response = client.post(
        "/register",
        json={"username": "testuser", "password": "otherpassword"}
    )
    assert response.status_code == 400
    assert response.json() == {
        "detail": {
        "success": False,
        "message": "Username already registered",
        "data": None
        }
    }


def test_login_user(client):
    client.post(
        "/register",
        json={"username": "testuser", "password": "testpassword"},
    )
    response = client.post(
        "/login",
        data={"username": "testuser", "password": "testpassword"},
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["message"] == "Login successful"
    assert "access_token" in response.json()["data"]


def test_login_user_wrong_password(client):
    client.post(
        "/register",
        json={"username": "testuser", "password": "testpassword"},
    )
    response = client.post(
        "/login",
        data={"username": "testuser", "password": "wrongpassword"},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json() == {
        "detail": {
        "success": False,
        "message": "Incorrect username or password",
        "data": None
        }
    }


def test_verify_token(client):
    client.post(
        "/register",
        json={"username": "testuser", "password": "testpassword"},
    )
    login_response = client.post(
        "/login",
        data={"username": "testuser", "password": "testpassword"},
    )
    token = login_response.json()["data"]["access_token"]

    response = client.get(f"/verify-token/{token}")
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Token is valid",
        "data": None
    }


def test_verify_invalid_token(client):
    invalid_token = "invalidtoken123"
    response = client.get(f"/verify-token/{invalid_token}")
    assert response.status_code == 401
    assert response.json() == {
        'detail': 'Token is invalid or expired.'
    }


def test_revoke_token(client):
    client.post("/register", json={"username": "testuser", "password": "testpassword"})
    login_response = client.post("/login", data={"username": "testuser", "password": "testpassword"})
    token = login_response.json()["data"]["access_token"]

    response = client.post(f"/revoke-token/{token}")
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "message": "Token has been revoked.",
        "data": None
    }

    verify_response = client.get(f"/verify-token/{token}")
    assert verify_response.status_code == 401
    assert verify_response.json() == {
        'detail': 'Token has been revoked.'
    }


def test_revoke_already_revoked_token(client):
    client.post("/register", json={"username": "testuser", "password": "testpassword"})
    login_response = client.post("/login", data={"username": "testuser", "password": "testpassword"})
    token = login_response.json()["data"]["access_token"]

    client.post(f"/revoke-token/{token}")

    second_revoke_response = client.post(f"/revoke-token/{token}")
    assert second_revoke_response.status_code == 400
    assert second_revoke_response.json() == {
        "detail": {
        "success": False,
        "message": "Token has already been revoked.",
        "data": None
        }
    }

def test_get_trees_empty(client):
    """Test het ophalen van bomen wanneer er nog geen bomen zijn toegevoegd."""
    response = client.get("/trees")
    assert response.status_code == 200
    assert response.json() == []

def test_create_tree(client):
    """Test het aanmaken van een nieuwe boom."""
    tree_data = {
        "name": "Oak Tree",
        "description": "A majestic oak tree.",
        "latitude": 51.1234,
        "longitude": 4.5678
    }
    response = client.post("/trees", json=tree_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == tree_data["name"]
    assert data["description"] == tree_data["description"]
    assert data["latitude"] == tree_data["latitude"]
    assert data["longitude"] == tree_data["longitude"]

def test_get_trees_with_data(client):
    """Test het ophalen van bomen wanneer er al bomen zijn toegevoegd."""
    tree_data = {
        "name": "Birch Tree",
        "description": "A slender birch tree.",
        "latitude": 50.9876,
        "longitude": 3.4567
    }
    client.post("/trees", json=tree_data)

    response = client.get("/trees")
    assert response.status_code == 200
    trees = response.json()
    assert len(trees) == 1
    assert trees[0]["name"] == tree_data["name"]
    assert trees[0]["description"] == tree_data["description"]

def test_delete_tree(client):
    """Test het verwijderen van een boom."""
    tree_data = {
        "name": "Pine Tree",
        "description": "A tall pine tree.",
        "latitude": 52.3456,
        "longitude": 5.6789
    }
    create_response = client.post("/trees", json=tree_data)
    tree_id = create_response.json()["id"]

    delete_response = client.delete(f"/trees/{tree_id}")
    assert delete_response.status_code == 200
    assert delete_response.json() == {"message": "Tree deleted successfully"}

    get_response = client.get("/trees")
    assert get_response.status_code == 200
    assert len(get_response.json()) == 0

def test_delete_nonexistent_tree(client):
    """Test het verwijderen van een niet-bestaande boom."""
    response = client.delete("/trees/999")
    assert response.status_code == 404
    assert response.json() == {"detail": "Tree not found"}