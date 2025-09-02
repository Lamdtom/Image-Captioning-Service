const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const previewImg = document.getElementById("preview-img");
const uploadBtn = document.getElementById("upload-btn");
const loader = document.getElementById("loader");
const captionBox = document.getElementById("caption-box");
const captionText = document.getElementById("caption-text");
const copyBtn = document.getElementById("copy-btn");
const errorBox = document.getElementById("error-box");

let selectedFile = null;

// --- Drag & Drop ---
dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  if (e.dataTransfer.files.length) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length) {
    handleFile(e.target.files[0]);
  }
});

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    showError("Please upload a valid image file.");
    return;
  }
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    preview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
  uploadBtn.disabled = false;
  errorBox.classList.add("hidden");
}

// --- Upload & Caption ---
uploadBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  loader.classList.remove("hidden");
  captionBox.classList.add("hidden");
  errorBox.classList.add("hidden");
  uploadBtn.disabled = true;

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const res = await fetch("http://localhost:8000/caption", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    captionText.textContent = data.caption;
    captionBox.classList.remove("hidden");
  } catch (err) {
    showError("Failed to generate caption. Is the backend running?");
  } finally {
    loader.classList.add("hidden");
    uploadBtn.disabled = false;
  }
});

// --- Copy to Clipboard ---
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(captionText.textContent);
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
});

// --- Error Handling ---
function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
}
