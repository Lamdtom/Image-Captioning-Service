const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const gallery = document.getElementById("gallery");
const uploadBtn = document.getElementById("upload-btn");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error-box");
const downloadBtn = document.getElementById("download-btn");
let selectedFiles = [];

downloadBtn.addEventListener("click", generateCSV);

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
    handleFiles(e.dataTransfer.files);
  }
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length) {
    handleFiles(e.target.files);
  }
});

function handleFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      showError("Please upload valid image files.");
      continue;
    }
    selectedFiles.push(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const container = document.createElement("div");
      container.classList.add("image-container");
      container.dataset.hasCaption = "false";

      const img = document.createElement("img");
      img.src = e.target.result;
      img.classList.add("preview-img");

      const captionBox = document.createElement("div");
      captionBox.classList.add("caption-box", "hidden");

      const captionText = document.createElement("p");
      captionText.classList.add("caption-text");

      const copyBtn = document.createElement("button");
      copyBtn.textContent = "Copy";
      copyBtn.classList.add("btn", "small"); 
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(captionText.textContent);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      });

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.classList.add("btn", "remove-btn");
      removeBtn.addEventListener("click", () => {
        container.remove();
        selectedFiles = selectedFiles.filter(f => f !== file);
        updateDownloadButton();
      });

      captionBox.appendChild(captionText);
      captionBox.appendChild(copyBtn);
      captionBox.appendChild(removeBtn);   
      container.appendChild(img);
      container.appendChild(captionBox);
      gallery.appendChild(container);
    };
    reader.readAsDataURL(file);
  }
  uploadBtn.disabled = false;
  errorBox.classList.add("hidden");
  updateDownloadButton();
}

// --- Upload & Caption ---
uploadBtn.addEventListener("click", async () => {
  if (!selectedFiles.length) return;

  loader.classList.remove("hidden");
  uploadBtn.disabled = true;
  errorBox.classList.add("hidden");

  // Process each file
  const containers = document.querySelectorAll(".image-container");
  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    const container = containers[i];
    
    if (container.dataset.hasCaption === "true") continue;

    const captionBox = container.querySelector(".caption-box");
    const captionText = container.querySelector(".caption-text");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/caption", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const data = await res.json();
      captionText.textContent = data.caption;
      captionBox.classList.remove("hidden");

      updateDownloadButton();
      container.dataset.hasCaption = "true";
    } catch (err) {
      showError("Failed to generate caption for one or more images. Is the backend running?");
    }
  }

  loader.classList.add("hidden");
  uploadBtn.disabled = false;
});

// --- Error Handling ---
function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
}



function updateDownloadButton() {
  const anyCaption = document.querySelectorAll(".caption-text").length > 0;
  downloadBtn.disabled = !anyCaption;
}

function generateCSV() {
  const containers = document.querySelectorAll(".image-container");
  const rows = [["Filename", "Caption"]]; // CSV header

  containers.forEach((container, index) => {
    const file = selectedFiles[index];
    const caption = container.querySelector(".caption-text").textContent || "";
    rows.push([file.name, caption]);
  });

  const csvContent = rows.map(e => e.map(s => `"${s}"`).join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "captions.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
