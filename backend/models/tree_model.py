from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from database import Base

class Tree(Base):
    __tablename__ = "trees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)
