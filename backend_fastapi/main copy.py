from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Union
from PIL import Image, ImageDraw
import io
import os

app = FastAPI(
    title="STRW API",
    description="This is a description of my API.",
    version="1.0.0",
)

# CORS configuration
#   -> allow_origins=["*"],  # Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/marked_images", StaticFiles(directory="marked_images"), name="marked_images")

@app.get("/")
def read_root():
    return {"STRAWAPI": f"{app.version}"}

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

@app.post("/putmarkonimage/")
async def put_mark_on_image(
    image: UploadFile = File(...),
    x: int = Form(...),
    y: int = Form(...),
):
    try:
        # Load the image
        contents = await image.read()
        img = Image.open(io.BytesIO(contents))

        # Ensure that the image mode is in RGB or RGBA to handle colored images
        if img.mode != 'RGB':
            img = img.convert('RGB')

        draw = ImageDraw.Draw(img)

        # Draw a circle at (x, y) with radius 10
        radius = 10
        left_up_point = (x - radius, y - radius)
        right_down_point = (x + radius, y + radius)
        draw.ellipse([left_up_point, right_down_point], outline="red", width=3)

        # Save the marked image without changing its original resolution
        output_path = f"marked_images/{os.path.splitext(image.filename)[0]}_marked{os.path.splitext(image.filename)[1]}"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        img.save(output_path, format=img.format)  # Keep the same format as the original

        return JSONResponse(content={
            "filename": os.path.basename(output_path),
            "message": "Image marked and saved successfully.",
            "url": f"http://127.0.0.1:8000/marked_images/{os.path.basename(output_path)}"
        })

    except Exception as e:
        # Log the exception and return a 500 error
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
