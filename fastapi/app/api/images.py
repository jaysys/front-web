# File: app/api/images.py
from fastapi import APIRouter, HTTPException
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import HTMLResponse 
from fastapi.responses import JSONResponse
from PIL import Image, ImageDraw
import io
import os

router = APIRouter()

# Endpoint to get image information (width and height)
@router.post("/getimageinfo/")
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


@router.post("/putmarkonimage/")
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

        # Draw a circle at (x, y) with radius 30
        radius = 30
        left_up_point = (x - radius, y - radius)
        right_down_point = (x + radius, y + radius)
        draw.ellipse([left_up_point, right_down_point], outline="blue", width=4)

        # Save the marked image
        images_folder = "data/images/marked"
        output_file_name = f"{os.path.splitext(image.filename)[0]}_marked{os.path.splitext(image.filename)[1]}"
        output_path = f"{images_folder}/{output_file_name}"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        img.save(output_path)

        return JSONResponse(content={
            "filename": os.path.basename(output_path),
            "message": "Image marked and saved successfully.",
            "url": f"http://127.0.0.1:8000/marked_images/{output_file_name}"
        })

    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
    

@router.get("/images")
async def get_url_list_of_all_images():
    images_folder = "./data/images/marked"
    base_url = "http://127.0.0.1:8000/marked_images"
    
    images = [
        f"{base_url}/{filename}" 
        for filename in os.listdir(images_folder) 
        if filename.endswith(('.png', '.jpg', '.jpeg', '.gif','.PNG', '.JPG', '.JPEG', '.GIF'))
    ]
    return {"images": images}

@router.delete("/images/{image_name}")
async def delete_marked_image(image_name: str):
    image_path = os.path.join("data/images/marked", image_name)

    if os.path.exists(image_path):
        os.remove(image_path)
        return {"message": f"Image {image_name} deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Image not found")
