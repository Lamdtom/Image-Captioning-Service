from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
import io

from app.utils import generate_caption

app = FastAPI(title="Image Captioning API")

@app.get("/")
def root():
    return {"message": "Image Captioning API is running!"}

@app.post("/caption/")
async def caption_image(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        caption = generate_caption(image)
        return JSONResponse(content={"caption": caption})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
