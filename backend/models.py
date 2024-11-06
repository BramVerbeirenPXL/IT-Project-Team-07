from sqlalchemy import Column, Integer, String
from database import Base, engine

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(255))


# Maak de database tables als deze nog niet zouden bestaan
Base.metadata.create_all(bind=engine)