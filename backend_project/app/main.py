
# app/main.py
from fastapi import FastAPI
from fastapi.responses import HTMLResponse  # Import HTMLResponse
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api import images

# Initialize FastAPI app with metadata
app = FastAPI(
    title="XXX API",
    description="XXX API on FASTAPI",
    version="1.0.0",
)

Base.metadata.create_all(bind=engine)

app.include_router(images.router, prefix="/db", tags=["images"])

# CORS middleware to allow requests from your frontend (React app)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # app's origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Basic root endpoint to check if API is running
@app.get("/", response_class=HTMLResponse)
def read_root():
    return f"""
    <html>
        <head>
            <title>{app.title}</title>
        </head>
        <body>
            <h3>{app.description} on FastAPI</h3>
            <p>Version: {app.version}</p>
            <a href="/docs">API Docs</a>
        </body>
    </html>
    """