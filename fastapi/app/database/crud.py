# File: app/database/crud.py

from sqlalchemy.orm import Session
from app.database.models import ImageFile

def create_image(db: Session, filename: str, filepath: str):
    db_image = ImageFile(filename=filename, filepath=filepath)
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

def get_image(db: Session, filename: str):
    return db.query(ImageFile).filter(ImageFile.filename == filename).first()

def delete_image(db: Session, filename: str):
    db_image = get_image(db, filename)
    if db_image:
        db.delete(db_image)
        db.commit()
