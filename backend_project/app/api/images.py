
# app/api/images.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os

from app.database import get_db, engine
from app.models import Image, Base
from app.schemas import ImageCreate, ImageResponse, InitResponse

router = APIRouter()

# 이미지 폴더 경로 설정
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IMAGE_FOLDER = os.path.join(BASE_DIR, "app", "data", "images")
DB_FILE = os.path.join(BASE_DIR, "app", "data", "database", "db.sqlite3")

def get_image_files():
    return [f for f in os.listdir(IMAGE_FOLDER) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))]

@router.post("/images/init", response_model=InitResponse)
def initialize_db(db: Session = Depends(get_db)):
    db_exists = os.path.exists(DB_FILE)

    print(">>>", db_exists, IMAGE_FOLDER, DB_FILE)
    
    if db_exists:
        print("Database already exists. Adding new images if any.")
    else:
        Base.metadata.create_all(bind=engine)
        print("Database created and tables initialized.")

    image_files = get_image_files()
    db_images = []
    new_images = 0
    skipped_images = 0

    existing_filenames = {image.filename for image in db.query(Image.filename).all()}

    for filename in image_files:
        if filename not in existing_filenames:
            db_image = Image(filename=filename)
            db.add(db_image)
            db_images.append(db_image)
            new_images += 1
        else:
            skipped_images += 1
            print(f"Skipping {filename}: Already exists in the database.")
    
    db.commit()

    # 결과 메시지 생성
    result_message = f"Initialization complete. "
    if db_exists:
        result_message += f"Database already existed. "
    result_message += f"Added {new_images} new images. {skipped_images} images were skipped (already in the database)."

    # InitResponse 형식에 맞춰 응답 반환
    return InitResponse(
        message=result_message,
        added_images=[ImageResponse.model_validate(img) for img in db_images]
    )

@router.get("/images", response_model=List[ImageResponse])
def read_images(db: Session = Depends(get_db)):
    return db.query(Image).all()

@router.get("/images/{image_id}", response_model=ImageResponse)
def read_image(image_id: int, db: Session = Depends(get_db)):
    db_image = db.query(Image).filter(Image.id == image_id).first()
    if db_image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return db_image

@router.post("/images", response_model=ImageResponse)
def create_image(image: ImageCreate, db: Session = Depends(get_db)):
    # 파일 이름 중복 확인
    existing_image = db.query(Image).filter(Image.filename == image.filename).first()
    if existing_image:
        raise HTTPException(status_code=400, detail="Image with this filename already exists.")

    db_image = Image(**image.dict())
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

@router.put("/images/{image_id}", response_model=ImageResponse)
def update_image(image_id: int, image: ImageCreate, db: Session = Depends(get_db)):
    db_image = db.query(Image).filter(Image.id == image_id).first()
    if db_image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    db_image.filename = image.filename
    db.commit()
    db.refresh(db_image)
    return db_image

@router.delete("/images/{image_id}", response_model=ImageResponse)
def delete_image(image_id: int, db: Session = Depends(get_db)):
    db_image = db.query(Image).filter(Image.id == image_id).first()
    if db_image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    db.delete(db_image)
    db.commit()
    return db_image

