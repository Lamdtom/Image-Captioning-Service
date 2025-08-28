const API_URL = "http://localhost:8000/caption";
const HEALTH_URL = "http://localhost:8000/health";
const fileInput = document.getElementById("imageInput");
const uploadBtn = document.getElementById("uploadBtn");
const captionEl = document.getElementById("caption");
const preview = document.getElementById("preview");

uploadBtn.disabled = true;
captionEl.textContent = "Waiting for backend to start...";

async function waitForBackend() {
  let ready = false;
  let seconds = 0;

  while (!ready) {
    try {
      const res = await fetch(HEALTH_URL);
      if (res.ok) {
        ready = true;
        break;
      }
    } catch {
      // ignore network errors
    }
    seconds += 5;
    captionEl.textContent = `Backend loading... ${seconds} seconds`;
    await new Promise(r => setTimeout(r, 5000));
  }

  captionEl.textContent = "";
  uploadBtn.disabled = false;
}

waitForBackend();

uploadBtn.addEventListener("click", async () => {
  if (!fileInput.files.length) {
    alert("Please select an image!");
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);

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
