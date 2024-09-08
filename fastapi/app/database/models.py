# File: app/database/models.py

from sqlalchemy import Column, Integer, String
from app.database.db import Base

class ImageFile(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True)
    filepath = Column(String)
