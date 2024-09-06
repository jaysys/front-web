To resolve the CORS (Cross-Origin Resource Sharing) issue you're encountering, you need to enable CORS in your FastAPI backend. By default, FastAPI does not allow requests from different origins (like `http://localhost:3000` for your React app and `http://127.0.0.1:8000` for your FastAPI app). You can use the `fastapi.middleware.cors.CORSMiddleware` to resolve this.

### Steps to Enable CORS in FastAPI:

1. **Install `fastapi` and `uvicorn` (if not already installed)**:
   You probably already have these installed, but if not, run:

   ```bash
   pip install fastapi uvicorn
   ```

2. **Update your FastAPI app to enable CORS**:
   In your FastAPI `main.py` file, add the following lines to configure CORS:

```python
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

@app.get("/marked_images")
async def get_marked_images():
    images_folder = "marked_images"
    base_url = "http://127.0.0.1:8000/marked_images"

    # List all files in the marked_images folder
    images = [
        f"{base_url}/{filename}"
        for filename in os.listdir(images_folder)
        if filename.endswith(('.png', '.jpg', '.jpeg', '.gif','.JPG','.JPEG','.PNG','.GIF'))
    ]

    return {"images": images}


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

```

### Explanation:

- **`allow_origins`**: This is where you specify the origins allowed to make requests to the FastAPI app. In your case, it's `http://localhost:3000` for your React app. You can also set it to `["*"]` to allow requests from any origin, but it's generally more secure to restrict it to only your app's domain.
- **`allow_methods`**: This allows all HTTP methods (`GET`, `POST`, `PUT`, etc.).
- **`allow_headers`**: This allows all headers. If you only want to allow specific headers, you can define them here.

### Restart Your FastAPI Server:

After adding the CORS middleware, restart the FastAPI server:

```bash
uvicorn main:app --reload
```

### Try the React App Again:

With CORS now enabled, the React app should be able to send the request without being blocked. Test the form again by uploading your image from the React app, and the CORS error should be resolved.
