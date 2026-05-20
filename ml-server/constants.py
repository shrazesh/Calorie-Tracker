# Constants for ML Server configuration
# Purpose: Centralized configuration for ML pipeline
# Inputs: None
# Outputs: Constant values

MAX_IMAGE_SIZE_MB = 10
ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png"]
IMAGE_SIZE = (224, 224)
TOP_K_PREDICTIONS = 3
LOW_CONFIDENCE_THRESHOLD = 0.40
MODEL_PATH = "model/food_model.h5"
LABELS_PATH = "model/class_labels.json"
