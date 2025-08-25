from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import torch

MODEL_PATH = "./model"

def load_model():
    processor = BlipProcessor.from_pretrained(MODEL_PATH)
    model = BlipForConditionalGeneration.from_pretrained(MODEL_PATH)
    return processor, model

# Load once at startup
processor, model = load_model()

def generate_caption(image: Image.Image) -> str:
    inputs = processor(images=image, return_tensors="pt")
    output_ids = model.generate(**inputs)
    caption = processor.decode(output_ids[0], skip_special_tokens=True)
    return caption
