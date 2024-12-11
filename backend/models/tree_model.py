from sqlalchemy import Column, Integer, String, Float, DateTime, Numeric
from datetime import datetime
from database import Base, engine


class Tree(Base):
    __tablename__ = "trees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    latitude = Column(Numeric(10, 8), nullable=False)
    longitude = Column(Numeric(11, 8), nullable=False)
    height = Column(Float, nullable=True)
    diameter = Column(Float, nullable=True)
    added_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)
