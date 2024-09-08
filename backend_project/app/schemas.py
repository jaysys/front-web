# app/schemas.py
from pydantic import BaseModel, ConfigDict
from typing import List

class ImageCreate(BaseModel):
    filename: str

class ImageResponse(BaseModel):
    id: int
    filename: str

    model_config = ConfigDict(from_attributes=True)

class InitResponse(BaseModel):
    message: str
    added_images: List[ImageResponse]
