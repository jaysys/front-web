FAST API, APIRouter를 사용하고, 소스 코드를 분리하여 더 모듈화된 구조

```python
# python run.py

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
```

```python

# main.py
from fastapi import FastAPI
from app.api import images
from app.database import engine, Base

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(images.router, prefix="/db", tags=["images"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./app/data/database/db.sqlite3"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# models.py
from sqlalchemy import Column, Integer, String
from app.database import Base

class Image(Base):
    __tablename__ = "images"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True)

# schemas.py
from pydantic import BaseModel

class ImageCreate(BaseModel):
    filename: str

class ImageResponse(BaseModel):
    id: int
    filename: str

    class Config:
        orm_mode = True

# api/images.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import os

from app.database import get_db
from app.models import Image
from app.schemas import ImageCreate, ImageResponse

router = APIRouter()

IMAGE_FOLDER = "./app/data/images/"

def get_image_files():
    return [f for f in os.listdir(IMAGE_FOLDER) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))]

@router.post("/images/init", response_model=List[ImageResponse])
def initialize_db(db: Session = Depends(get_db)):
    image_files = get_image_files()
    db_images = []
    for filename in image_files:
        db_image = Image(filename=filename)
        db.add(db_image)
        db_images.append(db_image)
    db.commit()
    return db_images

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

```

1. API 엔드포인트가 `/db/images`로 시작
2. 메인 함수와 API 함수가 분리되어 API 함수는 `/app/api/`
3. 이미지 파일은 `/app/data/images/` 폴더
4. 데이터베이스 파일은 `/app/data/database/` 폴더에 위치
5. APIRouter를 사용하여 라우팅 구성

```
app/
│
├── main.py
├── database.py
├── models.py
├── schemas.py
│
├── api/
│   └── images.py
│
└── data/
    ├── images/
    │   └── (이미지 파일들)
    │
    └── database/
        └── db.sqlite3
```

이 구조에서:

- `main.py`는 애플리케이션의 진입점입니다.
- `database.py`는 데이터베이스 연결 및 세션 관리를 담당합니다.
- `models.py`는 SQLAlchemy 모델을 정의합니다.
- `schemas.py`는 Pydantic 모델을 정의합니다.
- `api/images.py`는 이미지 관련 API 엔드포인트를 포함합니다.
- `data/images/`는 이미지 파일을 저장하는 폴더입니다.
- `data/database/`는 SQLite 데이터베이스 파일을 저장하는 폴더입니다.

이렇게 하면 FastAPI 서버가 시작되고, `http://localhost:8000/docs`에서 Swagger UI를 통해 API를 테스트할 수 있습니다.
