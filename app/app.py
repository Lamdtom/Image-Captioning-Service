from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from .utils import load_model, generate_caption
from PIL import Image

app = FastAPI(title="Image Captioning API")

# Allow frontend to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins; for production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
processor, model = load_model()

@app.get("/")
def root():
    return {"message": "API is running!"}

@app.post("/caption")
async def caption_endpoint(file: UploadFile = File(...)):
    image = Image.open(file.file).convert("RGB")
    caption = generate_caption(image, processor, model)
    return {"caption": caption}

@app.get("/health")
def health():
    return {"status": "ok"} 

