"""
Purpose: Provide functions for food image preprocessing and prediction.
Inputs: Raw image bytes.
Outputs: List of top-k predictions with labels and confidence scores.
"""

import tensorflow as tf
import numpy as np
import json
from PIL import Image
import io
from constants import MODEL_PATH, LABELS_PATH, IMAGE_SIZE, LOW_CONFIDENCE_THRESHOLD

model = None
class_labels = None

def load_model_once():
    global model, class_labels
    if model is None:
        try:
            print(f"Loading model from {MODEL_PATH}...")
            model = tf.keras.models.load_model(MODEL_PATH)
            with open(LABELS_PATH, 'r') as f:
                class_labels = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load model ({e}). Entering Mock Mode for testing.")
            # Provide dummy model and labels from your actual dataset
            class_labels = ["momo", "dal_bhat", "pizza", "hamburger", "sushi", "oatmeal", "apple"]
            model = "MOCK_MODEL"
    return model, class_labels

def preprocess_image(image_bytes):
    # Decode and resize
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize(IMAGE_SIZE)
    
    # Convert to array and normalize
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def predict_food(image_bytes, top_k=3):
    model, labels = load_model_once()
    
    if model == "MOCK_MODEL":
        # Simulate a random successful prediction from the dummy labels for testing
        import random
        # Pick 3 unique random labels
        mock_labels = random.sample(labels, min(len(labels), top_k))
        results = []
        for i, label in enumerate(mock_labels):
            conf = 0.92 - (i * 0.3) # 0.92, 0.62, 0.32...
            results.append({
                "label": label, 
                "confidence": conf, 
                "confidence_percent": f"{conf * 100:.1f}%"
            })
        return {"low_confidence": False, "predictions": results}

    processed_img = preprocess_image(image_bytes)
    predictions = model.predict(processed_img)[0]
    
    # Get top k indices
    top_indices = predictions.argsort()[-top_k:][::-1]
    
    results = []
    for idx in top_indices:
        confidence = float(predictions[idx])
        results.append({
            "label": labels[idx],
            "confidence": confidence,
            "confidence_percent": f"{confidence * 100:.1f}%"
        })
    
    if results[0]["confidence"] < LOW_CONFIDENCE_THRESHOLD:
        return {
            "low_confidence": True,
            "message": "Could not confidently identify this food. Please search manually.",
            "predictions": results
        }
    
    return {
        "low_confidence": False,
        "predictions": results
    }
