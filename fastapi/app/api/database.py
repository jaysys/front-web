import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import crud, db, models

router = APIRouter()

# Endpoint to populate the database with image filenames
@router.post("/db/populate")
async def populate_images_from_folder(session: Session = Depends(db.SessionLocal)):
    marked_folder = "./data/images/marked"
    
    # Iterate over the files in the directory
    for filename in os.listdir(marked_folder):
        if filename.endswith((".png", ".jpg", ".jpeg", ".PNG", ".gif", ".JPG", ".JPEG", ".GIF")):
            path = os.path.join(marked_folder, filename)
            
            # Check if the image filename is already in the database
            existing_image = crud.get_image(session, filename)
            if not existing_image:
                # Add the new image to the database
                crud.create_image(session, filename, path)
    
    return {"message": "Images populated from folder"}

# Endpoint to retrieve all images from the database
@router.get("/db/images")
async def get_all_images(session: Session = Depends(db.SessionLocal)):
    # Query all images from the database
    images = session.query(models.ImageFile).all()
    
    # Convert the list of image objects to a list of filenames
    image_list = [image.filename for image in images]
    
    return {"images": image_list}
