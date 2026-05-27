"""
Purpose: Map standard COCO class labels or YOLO outputs to the MERN database food items.
Inputs: YOLO predicted label.
Outputs: Cleaned/mapped label.
"""

# List of target labels supported by the application
SUPPORTED_FOODS = [
    "momo", "dal bhat", "sel roti", "chiya", "chowmein", "thakali set",
    "choila", "yomari", "dhido", "ramen", "pizza", "burger", "steak",
    "salmon", "eggs", "rice", "apple", "banana", "salad", "protein shake"
]

# Map YOLO COCO classes to our supported food classes
COCO_TO_FOOD_MAP = {
    "sandwich": "burger",
    "hot dog": "burger",
    "pizza": "pizza",
    "donut": "sel roti",
    "cake": "yomari",
    "apple": "apple",
    "banana": "banana",
    "orange": "apple",
    "broccoli": "salad",
    "carrot": "salad",
    "bowl": "dal bhat",
    "cup": "chiya",
    "dining table": None,
    "fork": None,
    "knife": None,
    "spoon": None
}

def map_coco_label(yolo_label: str) -> str:
    """
    Map a YOLO COCO label to a database-compatible food label.
    """
    lbl = yolo_label.lower().strip()
    
    # Check direct mapping
    if lbl in COCO_TO_FOOD_MAP:
        return COCO_TO_FOOD_MAP[lbl]
        
    # Check if label contains any target substring
    for target in SUPPORTED_FOODS:
        if target in lbl or lbl in target:
            return target
            
    return lbl
