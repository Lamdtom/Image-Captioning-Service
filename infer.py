from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import torch
import sys
import os

# Paths
MODEL_DIR = "./model"
os.makedirs(MODEL_DIR, exist_ok=True)

def load_model():
    processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
    return processor, model

def generate_caption(image_path, processor, model):
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        output = model.generate(**inputs)
    caption = processor.decode(output[0], skip_special_tokens=True)
    return caption

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python infer.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]
    processor, model = load_model()
    caption = generate_caption(image_path, processor, model)
    print(f"Caption: {caption}")

    # Save model + processor for later stages
    processor.save_pretrained(MODEL_DIR)
    model.save_pretrained(MODEL_DIR)
    print(f"Model saved to {MODEL_DIR}")
