const BACKEND_URL = "http://localhost:8000"; // backend URL
const API_URL = `${BACKEND_URL}/caption`;

const fileInput = document.getElementById("imageInput");
const uploadBtn = document.getElementById("uploadBtn");
const captionEl = document.getElementById("caption");
const preview = document.getElementById("preview");

// Disable upload button until backend is ready
uploadBtn.disabled = true;
captionEl.textContent = "Waiting for backend to start...";

async function waitForBackend() {
  let ready = false;
  let seconds = 0;
  while (!ready) {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch (err) {
      // Silently ignore network errors
    }
    seconds += 2;
    captionEl.textContent = `Backend loading... ${seconds} seconds`;
    await new Promise(r => setTimeout(r, 5000)); // poll every 5s
  }

  captionEl.textContent = ""; // clear message
  uploadBtn.disabled = false; // enable once backend is ready
}

// Start waiting on page load
waitForBackend();

uploadBtn.addEventListener("click", async () => {
  if (!fileInput.files.length) {
    alert("Please select an image!");
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);

  // Show image preview
  preview.src = URL.createObjectURL(file);
  captionEl.textContent = "Generating caption...";
  captionEl.classList.remove("error");

  uploadBtn.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      captionEl.textContent = "Caption: " + data.caption;
    } else {
      const error = await response.json();
      captionEl.textContent = "Error: " + (error.error || "Unknown");
      captionEl.classList.add("error");
    }
  } catch (err) {
    captionEl.textContent = "Error: " + err.message;
    captionEl.classList.add("error");
  } finally {
    uploadBtn.disabled = false;
  }
});
