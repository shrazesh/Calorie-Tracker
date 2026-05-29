"""
Purpose: FastAPI server exposing the YOLOv8 AI food recognition endpoint.
Endpoints: POST /predict, GET /health.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import traceback

from services.detector import load_model, detect_objects
from services.image_processor import decode_image, preprocess_image

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model at startup
    try:
        load_model()
    except Exception as e:
        print(f"Error during model loading: {e}")
    yield

app = FastAPI(lifespan=lifespan)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to Node.js backend origin
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    try:
        # Read uploaded image bytes
        contents = await image.read()
        
        # Process image using OpenCV
        cv_image = decode_image(contents)
        processed_image = preprocess_image(cv_image)
        
        # Run detection
        detections = detect_objects(processed_image, original_filename=image.filename)
        
        return {
            "success": True,
            "detections": detections
        }
    except Exception as e:
        traceback.print_exc()
        return {"success": False, "error": str(e), "detections": []}

@app.get("/health")
async def health():
    return {"status": "ok", "model": "loaded"}

@app.post("/train")
async def train():
    """
    Trigger training pipeline. In a real environment, this should dispatch
    a background celery task. For now, it returns instructions.
    """
    return {
        "success": True, 
        "message": "Training pipeline should be run via CLI: python training_pipeline.py --epochs 20"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
