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

// === Filter Panel Toggle ===
const filterPanel = document.getElementById('filterPanel');
const filterOverlay = document.getElementById('filterOverlay');
const carCards = document.querySelectorAll('.car-card');
const noResults = document.getElementById('noResults');

// Toggle UI
function toggleFilters(open) {
    filterPanel.classList.toggle('active', open);
    filterOverlay.classList.toggle('active', open);
    document.body.classList.toggle('no-scroll', open);
}

document.getElementById('filterToggle').onclick = () => toggleFilters(true);
document.getElementById('closeFilter').onclick = () => toggleFilters(false);
filterOverlay.onclick = () => toggleFilters(false);

// Core Filtering Logic
function runAllFilters() {
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    const makeVal = document.getElementById('make').value;
    const priceRange = document.getElementById('price').value;
    
    let visibleCount = 0;

    carCards.forEach(card => {
        const cMake = card.dataset.make;
        const cPrice = parseInt(card.dataset.price);
        const cTitle = card.querySelector('.car-title').innerText.toLowerCase();

        // Check Search
        const matchSearch = cTitle.includes(searchVal);
        // Check Make
        const matchMake = makeVal === "" || cMake === makeVal;
        // Check Price Range
        let matchPrice = true;
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(Number);
            matchPrice = cPrice >= min && cPrice <= max;
        }

        if (matchSearch && matchMake && matchPrice) {
            card.style.display = 'flex';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    handleSort();
}

// Sorting Logic
function handleSort() {
    const sortVal = document.getElementById('sort').value;
    const container = document.querySelector('.cars-container');
    const cardsArray = Array.from(carCards);

    cardsArray.sort((a, b) => {
        const priceA = parseInt(a.dataset.price);
        const priceB = parseInt(b.dataset.price);
        return sortVal === 'price-low' ? priceA - priceB : priceB - priceA;
    });

    cardsArray.forEach(card => container.appendChild(card));
}

// Events
document.getElementById('applyFilter').onclick = () => {
    runAllFilters();
    toggleFilters(false);
};

document.getElementById('resetFilter').onclick = () => {
    document.getElementById('make').value = "";
    document.getElementById('price').value = "";
    document.getElementById('searchInput').value = "";
    runAllFilters();
};

document.getElementById('searchInput').oninput = runAllFilters;

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
