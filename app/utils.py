from transformers import (
    BlipProcessor, BlipForConditionalGeneration,
    VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
)
from PIL import Image
import torch

# Available models
AVAILABLE_MODELS = {
    "blip-base": {
        "processor": BlipProcessor,
        "model": BlipForConditionalGeneration,
        "path": "Salesforce/blip-image-captioning-base"
    },
    "blip-large": {
        "processor": BlipProcessor,
        "model": BlipForConditionalGeneration,
        "path": "Salesforce/blip-image-captioning-large"
    },
    "vit-gpt2": {
        "processor": ViTImageProcessor,
        "model": VisionEncoderDecoderModel,
        "tokenizer": AutoTokenizer,
        "path": "nlpconnect/vit-gpt2-image-captioning"
    }
}

# Cache loaded models so we don’t reload each request
_loaded_models = {}

def load_model(model_name="blip-base"):
    if model_name not in AVAILABLE_MODELS:
        raise ValueError(f"❌ Model {model_name} not available. Choose from: {list(AVAILABLE_MODELS.keys())}")

    if model_name in _loaded_models:
        return _loaded_models[model_name]

    cfg = AVAILABLE_MODELS[model_name]
    if model_name.startswith("blip"):
        processor = cfg["processor"].from_pretrained(cfg["path"])
        model = cfg["model"].from_pretrained(cfg["path"])
        _loaded_models[model_name] = (processor, model)
    elif model_name == "vit-gpt2":
        processor = cfg["processor"].from_pretrained(cfg["path"])
        model = cfg["model"].from_pretrained(cfg["path"])
        tokenizer = cfg["tokenizer"].from_pretrained(cfg["path"])
        _loaded_models[model_name] = (processor, model, tokenizer)

    return _loaded_models[model_name]


def generate_caption(image: Image.Image, model_name="blip-base") -> str:
    device = "cuda" if torch.cuda.is_available() else "cpu"

    if model_name.startswith("blip"):
        processor, model = load_model(model_name)
        inputs = processor(images=image, return_tensors="pt").to(device)
        model = model.to(device)
        out = model.generate(**inputs, max_new_tokens=30)
        caption = processor.decode(out[0], skip_special_tokens=True)

    elif model_name == "vit-gpt2":
        processor, model, tokenizer = load_model(model_name)
        pixel_values = processor(images=image, return_tensors="pt").pixel_values.to(device)
        model = model.to(device)
        out = model.generate(pixel_values, max_length=16, num_beams=4)
        caption = tokenizer.decode(out[0], skip_special_tokens=True).strip()

    else:
        raise ValueError(f"❌ Unsupported model {model_name}")

    return caption

if __name__ == "__main__":
    img = Image.open("image.png").convert("RGB")

    for model_name in ["blip-base", "blip-large", "vit-gpt2"]:
        print(f"\n🔹 Using {model_name}...")
        caption = generate_caption(img, model_name)
        print("👉 Caption:", caption)