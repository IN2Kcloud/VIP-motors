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

let mouse = { x: 0.5, y: 0.5 };
let time = 0;

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
  time += 0.01;

  ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
  ctx.fillStyle = "#eee";
  ctx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);

  const spacing = 32;
  const rows = Math.ceil(gridCanvas.height / spacing);
  const cols = Math.ceil(gridCanvas.width / spacing);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {

      const px = x * spacing;
      const py = y * spacing;

      // wave motion
      const wave =
        Math.sin(x * 0.3 + time) +
        Math.cos(y * 0.3 + time);

      // mouse pull
      const mx = (mouse.x - 0.5) * 40;
      const my = (mouse.y - 0.5) * 40;

      const dx = px + wave * 3 + mx * (y / rows);
      const dy = py + wave * 3 + my * (x / cols);

      const size = 1.2 + wave * 0.3;

      ctx.beginPath();
      ctx.arc(dx, dy, size, 0, Math.PI * 2);
      ctx.fillStyle = "#000";
      ctx.fill();
    }
  }

  requestAnimationFrame(draw);
}

draw();

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
