// Helper: Wait for all images, videos, and fonts to fully load
function waitForAllResources() {
  const images = Array.from(document.images).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.addEventListener('load', resolve);
      img.addEventListener('error', resolve);
    });
  });

  const videos = Array.from(document.querySelectorAll('video')).map(video => {
    if (video.readyState >= 3) return Promise.resolve();
    return new Promise(resolve => {
      video.addEventListener('loadeddata', resolve);
      video.addEventListener('error', resolve);
    });
  });

  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();

  return Promise.all([...images, ...videos, fonts]);
}

// Start loading process
window.addEventListener('load', () => {
  // wait until literally everything is ready
  waitForAllResources().then(() => {
    document.body.classList.remove('before-load');
  });
});

// When transition of loader ends, remove it from DOM
document.querySelector('.loading').addEventListener('transitionend', (e) => {
  if (e.propertyName === 'opacity') { // ensure it's the fade-out transition
    document.body.removeChild(e.currentTarget);
  }
});

// Cursor follow =================================================================================
const cursor = document.querySelector('.cursor');
document.addEventListener('mousemove', e => {
  cursor.style.transform = `translate(${e.clientX - 7}px, ${e.clientY - 7}px)`;
});

// BG points -----------------------------------------------------------------

const gridCanvas = document.getElementById("grid-bg");
const ctx = gridCanvas.getContext("2d");

// ✅ local noise buffer (FIXED)
const noiseCanvas = document.createElement("canvas");
const noiseCtx = noiseCanvas.getContext("2d");

noiseCanvas.width = 100;
noiseCanvas.height = 100;

let mouse = { x: 0.5, y: 0.5 };
let time = 0;

// ✅ dynamic noise (CRITICAL for original look)
function updateNoise() {
  const imageData = noiseCtx.createImageData(100, 100);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const val = Math.random() * 255;
    data[i] = data[i + 1] = data[i + 2] = val;
    data[i + 3] = 25;
  }

  noiseCtx.putImageData(imageData, 0, 0);
}

function resize() {
  gridCanvas.width = window.innerWidth;
  gridCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX / window.innerWidth;
  mouse.y = e.clientY / window.innerHeight;
});

function draw() {
  time += 0.005;

  ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

  // Gradient
  const centerX = gridCanvas.width / 2 + Math.cos(time) * (gridCanvas.width * 0.3);
  const centerY = gridCanvas.height / 2 + Math.sin(time * 0.8) * (gridCanvas.height * 0.2);

  const baseRadius = Math.max(gridCanvas.width, gridCanvas.height) * 0.7;
  const pulseRadius = baseRadius + Math.sin(time * 0.5) * 100;

  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
  gradient.addColorStop(0, "#fff");
  gradient.addColorStop(1, "#fff");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);

  // 🔥 animated noise
  updateNoise();

  ctx.globalCompositeOperation = "source-over";

  const noiseOffsetX = Math.random() * noiseCanvas.width;
  const noiseOffsetY = Math.random() * noiseCanvas.height;

  const pattern = ctx.createPattern(noiseCanvas, "repeat");

  ctx.save();
  ctx.translate(noiseOffsetX, noiseOffsetY);
  ctx.fillStyle = pattern;
  ctx.fillRect(-noiseOffsetX, -noiseOffsetY, gridCanvas.width, gridCanvas.height);
  ctx.restore();

  requestAnimationFrame(draw);
}

draw();

// BG noise -----------------------------------------------------------------

class AnimatedNoiseBackground {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.noiseCanvas = document.createElement("canvas");
    this.noiseCtx = this.noiseCanvas.getContext("2d");

    this.noiseCanvas.width = 100;
    this.noiseCanvas.height = 100;

    this.time = 0;

    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.draw = this.draw.bind(this);
    requestAnimationFrame(this.draw);
  }

  // 🔥 dynamic noise (same behavior as system 1)
  updateNoise() {
    const imageData = this.noiseCtx.createImageData(100, 100);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const val = Math.random() * 255;
      data[i] = data[i + 1] = data[i + 2] = val;
      data[i + 3] = 25;
    }

    this.noiseCtx.putImageData(imageData, 0, 0);
  }

  resize() {
    const parent = this.canvas.parentElement;
    this.canvas.width = parent.offsetWidth;
    this.canvas.height = parent.offsetHeight;
  }

  draw() {
    this.time += 0.005;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Gradient
    const centerX = w / 2 + Math.cos(this.time) * (w * 0.3);
    const centerY = h / 2 + Math.sin(this.time * 0.8) * (h * 0.2);

    const baseRadius = Math.max(w, h) * 0.7;
    const pulseRadius = baseRadius + Math.sin(this.time * 0.5) * 100;

    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, pulseRadius
    );

    gradient.addColorStop(0, "#CB2027");
    gradient.addColorStop(1, "#000");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 🔥 animated noise
    this.updateNoise();

    ctx.globalCompositeOperation = "source-over";

    const noiseOffsetX = Math.random() * this.noiseCanvas.width;
    const noiseOffsetY = Math.random() * this.noiseCanvas.height;

    const pattern = ctx.createPattern(this.noiseCanvas, "repeat");

    ctx.save();
    ctx.translate(noiseOffsetX, noiseOffsetY);
    ctx.fillStyle = pattern;
    ctx.fillRect(-noiseOffsetX, -noiseOffsetY, w, h);
    ctx.restore();

    requestAnimationFrame(this.draw);
  }
}

// init all instances independently
document.querySelectorAll(".noise-canvas").forEach(canvas => {
  new AnimatedNoiseBackground(canvas);
});

// File upload preview + validation (only .jpg/.jpeg) =============================================
const imagesInput = document.getElementById('images');
const preview = document.getElementById('preview');

imagesInput.addEventListener('change', (e) => {
  preview.innerHTML = '';
  const files = Array.from(e.target.files).slice(0, 12); // limit
  if(files.length === 0) return;

  files.forEach(file => {
    const name = file.name.toLowerCase();
    if(!(name.endsWith('.jpg') || name.endsWith('.jpeg'))) {
      alert('Only .JPG or .JPEG images are allowed. File "'+ file.name +'" was not accepted.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(ev) {
      const img = document.createElement('img');
      img.src = ev.target.result;
      img.alt = file.name;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
});

// Form validation and demo submission =============================================================
const form = document.getElementById('sellForm');
const pv = document.getElementById('pv');
// Reference to your custom triangle element if needed for UI feedback
const dtls = document.querySelector('.triangle-up');

// --- PHOTO PREVIEW LOGIC ---
const imageInput = document.getElementById('images');
imageInput.addEventListener('change', function() {
  pv.innerHTML = ''; // Clear current previews
  const files = Array.from(this.files).slice(0, 12); // Limit to 12

  files.forEach(file => {
    if (file.type.match('image.*')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.width = '80px';
        img.style.height = '80px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '4px';
        pv.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });
});

// --- FORM SUBMISSION ---
form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Basic validation
  const required = form.querySelectorAll('[required]');
  for (let el of required) {
    if (!el.value.trim()) {
      el.focus();
      alert(`Please fill out the ${el.previousSibling?.textContent || 'required'} field.`);
      return;
    }
  }

  const fd = new FormData(form);

  // Data Summary
  const summary = {
    name: `${fd.get('firstName')} ${fd.get('lastName')}`,
    email: fd.get('email'),
    vehicle: `${fd.get('year')} ${fd.get('make')} ${fd.get('model')}`,
    price: fd.get('price'),
  };

  alert('Success!\n' +
        `Name: ${summary.name}\n` +
        `Vehicle: ${summary.vehicle}\n` +
        `Price: $${summary.price}`);

  form.reset();
  preview.innerHTML = '';
});

// --- TIPS VIDEO (Safeguard) ---
const tips = document.getElementById('tipsVideo');
if (tips) {
  tips.addEventListener('click', () => {
    window.open('https://www.youtube.com/', '_blank');
  });
}
