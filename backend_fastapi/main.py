from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Union
from PIL import Image, ImageDraw
import io
import os

# Initialize FastAPI app with metadata
app = FastAPI(
    title="STRW API",
    description="This is a description of my API.",
    version="1.0.0",
)

# CORS middleware to allow requests from your frontend (React app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# 생성된 이미지를 저장해놓을 디렉토리명칭을 정하고 마운트해놓는다. api명칭과 쫑나면 안된다.
app.mount("/marked_images", StaticFiles(directory="marked_images"), name="marked_images")

# Basic root endpoint to check if API is running
@app.get("/")
def read_root():
    return {"STRAWAPI": f"{app.version}"}

# Example of a parameterized GET request
@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

# Endpoint to get image information (width and height)
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
        draw = ImageDraw.Draw(img)

        # Draw a circle at (x, y) with radius 10
        radius = 10
        left_up_point = (x - radius, y - radius)
        right_down_point = (x + radius, y + radius)
        draw.ellipse([left_up_point, right_down_point], outline="red", width=3)

        # Save the marked image
        output_path = f"marked_images/{os.path.splitext(image.filename)[0]}_marked{os.path.splitext(image.filename)[1]}"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        img.save(output_path)

        return JSONResponse(content={
            "filename": os.path.basename(output_path),
            "message": "Image marked and saved successfully.",
            "url": f"http://127.0.0.1:8000/marked_images/{os.path.basename(output_path)}"
        })

    except Exception as e:
        # Log the exception and return a 500 error
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    

# GET request to return all marked images URLs
@app.get("/images")
async def get_marked_image_lists():
    images_folder = "marked_images"
    base_url = "http://127.0.0.1:8000/marked_images"  # Base URL for accessing the images

    # List all image files in the marked_images directory with specific extensions
    images = [
        f"{base_url}/{filename}" 
        for filename in os.listdir(images_folder) 
        if filename.endswith(('.png', '.jpg', '.jpeg', '.gif', '.JPG', '.JPEG', '.PNG', '.GIF'))
    ]
    
    return {"images": images}  # Return a list of image URLs

# DELETE request to delete an image by its filename
@app.delete("/images/{image_name}")
async def delete_image(image_name: str):
    image_path = os.path.join("marked_images", image_name)  # Path to the image file
    
    if os.path.exists(image_path):
        os.remove(image_path)  # Remove the image if it exists
        return {"message": f"Image {image_name} deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Image not found")

