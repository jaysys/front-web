from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Union  # Import Union
from PIL import Image
import io

app = FastAPI(
    title="STRW API",
    description="This is a description of my API.",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from fastapi import FastAPI





@app.get("/")
def read_root():
    return {"STRAWAPI":f"{app.version}"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.post("/getimageinfo/")
async def get_image_info(ImageInfo: UploadFile = File(...)):
    filename = ImageInfo.filename
    contents = await ImageInfo.read()
    image = Image.open(io.BytesIO(contents))
    width, height = image.size
    return {
        "filename": filename,
        "width": width,
        "height": height
    }
