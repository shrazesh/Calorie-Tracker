"""
Purpose: Preprocess images using OpenCV to resize, normalize, enhance contrast, and denoise.
Inputs: Raw image bytes.
Outputs: Preprocessed OpenCV image.
"""

import cv2
import numpy as np
from PIL import Image
import io

def decode_image(image_bytes: bytes) -> np.ndarray:
    """
    Decode raw image bytes into an OpenCV numpy BGR array.
    """
    # Load via PIL to handle multiple formats cleanly
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    cv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    return cv_image

def preprocess_image(cv_image: np.ndarray, target_size: int = 640) -> np.ndarray:
    """
    Process OpenCV image:
    1. Resize while maintaining aspect ratio (letterboxing/padding).
    2. Denoise and sharpen (Gaussian blur reduction).
    3. Enhance contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization).
    4. Improve brightness if image is too dark.
    """
    h, w = cv_image.shape[:2]
    
    # Calculate scale factor
    scale = target_size / max(h, w)
    new_w, new_h = int(w * scale), int(h * scale)
    
    # Resize
    resized = cv2.resize(cv_image, (new_w, new_h), interpolation=cv2.INTER_AREA)
    
    # Advanced Preprocessing: Denoising
    # Using FastNlMeansDenoising for color images
    denoised = cv2.fastNlMeansDenoisingColored(resized, None, 10, 10, 7, 21)
    
    # Advanced Preprocessing: Sharpening (Gaussian blur reduction)
    kernel_sharpening = np.array([[-1,-1,-1], 
                                  [-1, 9,-1],
                                  [-1,-1,-1]])
    sharpened = cv2.filter2D(denoised, -1, kernel_sharpening)

    # Letterbox padding to make it a square (target_size x target_size)
    top = (target_size - new_h) // 2
    bottom = target_size - new_h - top
    left = (target_size - new_w) // 2
    right = target_size - new_w - left
    
    # Add dark padding
    square_img = cv2.copyMakeBorder(
        sharpened, top, bottom, left, right, 
        cv2.BORDER_CONSTANT, value=[114, 114, 114]
    )
    
    # Improve brightness/contrast on YUV color space
    yuv = cv2.cvtColor(square_img, cv2.COLOR_BGR2YUV)
    y, u, v = cv2.split(yuv)
    
    # Check average brightness of the Y channel
    avg_brightness = np.mean(y)
    if avg_brightness < 80: # Dark image
        # Apply CLAHE to Y channel
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        y = clahe.apply(y)
        
    yuv = cv2.merge((y, u, v))
    enhanced_img = cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR)
    
    return enhanced_img
