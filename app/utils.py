from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import torch

MODEL_PATH = "Salesforce/blip-image-captioning-base"

def load_model():
    processor = BlipProcessor.from_pretrained(MODEL_PATH)
    model = BlipForConditionalGeneration.from_pretrained(MODEL_PATH)
    return processor, model


def generate_caption(image, processor, model):
    inputs = processor(images=image, return_tensors="pt")
    out = model.generate(**inputs)
    caption = processor.decode(out[0], skip_special_tokens=True)
    return caption
