from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from utils import load_model, generate_caption, AVAILABLE_MODELS
from PIL import Image
from io import BytesIO

app = FastAPI(title="Image Captioning API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

processor, model = load_model()

@app.get("/")
def root():
    return {"message": "API is running!"}

@app.post("/caption/")
async def caption_endpoint(
    file: UploadFile = File(...), 
    model: str = Form("blip-base")  # default if not specified
):
    if model not in AVAILABLE_MODELS:
        return {"error": f"Model '{model}' not available", "available": list(AVAILABLE_MODELS.keys())}
    
    image = Image.open(BytesIO(await file.read())).convert("RGB")
    caption = generate_caption(image, model_name=model)
    return {"caption": caption, "model": model}

@app.get("/health/")
def health():
    return {"status": "ok"}
