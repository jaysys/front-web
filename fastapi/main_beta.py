# File: app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from app.api import images, database

app = FastAPI(
    title="STRW!!!! API",
    description="my API.",
    version="1.0.0",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve marked images as static files
app.mount("/marked_images", StaticFiles(directory="data/images/marked"), name="marked_images")

# Include image and database routers
app.include_router(images.router, tags=["Images"])
app.include_router(database.router, tags=["Database"])

# Root route
@app.get("/", response_class=HTMLResponse)
def read_root():
    return """
    <html>
        <head>
            <title>STRAW API</title>
        </head>
        <body>
            <h3>STRAW API - main_ex </h3>
            <a href="/docs">docs</a>
        </body>
    </html>
    """
