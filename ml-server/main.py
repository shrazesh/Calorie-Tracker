"""
Purpose: FastAPI server exposing the CNN inference endpoint for food recognition.
Endpoints: POST /predict, GET /health, GET /labels.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
from model.predict import load_model_once, predict_food
from constants import ALLOWED_EXTENSIONS, MAX_IMAGE_SIZE_MB, LABELS_PATH
import json
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model at startup
    try:
        load_model_once()
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
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
    # Validate extension
    ext = image.filename.split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {ALLOWED_EXTENSIONS}")
    
    # Validate size
    contents = await image.read()
    if len(contents) > MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large. Max size: {MAX_IMAGE_SIZE_MB}MB")
    
    try:
        result = predict_food(contents)
        
        # Format response
        formatted_predictions = []
        for i, pred in enumerate(result["predictions"]):
            formatted_predictions.append({
                "rank": i + 1,
                "food_label": pred["label"],
                "display_name": pred["label"].replace("_", " ").title(),
                "confidence": pred["confidence"],
                "confidence_percent": pred["confidence_percent"]
            })
            
        return {
            "success": True,
            "predictions": formatted_predictions,
            "top_prediction": formatted_predictions[0]["food_label"],
            "low_confidence": result.get("low_confidence", False)
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/health")
async def health():
    return {"status": "ok", "model": "loaded"}

@app.get("/labels")
async def labels():
    if os.path.exists(LABELS_PATH):
        with open(LABELS_PATH, 'r') as f:
            return json.load(f)
    return []

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
