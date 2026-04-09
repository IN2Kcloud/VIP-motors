// LOADER ==============================
window.addEventListener('load', () => {
    const tl = gsap.timeline();
    const counterDisplay = document.querySelector('.load-counter');
    let loadProgress = { value: 0 };

    // 1. Forced 5-Second "Heavy System Check" Sequence
    tl.to(loadProgress, {
        value: 100,
        duration: 5,
        // Using a "SlowMo" ease combined with steps makes it look like it's 
        // struggling at 20% and 80% (classic loading behavior)
        ease: "slow(0.1, 0.8, false)", 
        onUpdate: () => {
            // Randomly flicker the opacity slightly during update for realism
            if (Math.random() > 0.85) {
                counterDisplay.style.opacity = "0.5";
            } else {
                counterDisplay.style.opacity = "1";
            }
            
            const displayVal = Math.round(loadProgress.value).toString().padStart(2, '0');
            if(counterDisplay) counterDisplay.innerText = displayVal;
        }
    });

    // The bar mirrors the "struggle" of the counter
    tl.to(".load-bar", {
        width: "100%",
        duration: 5,
        ease: "slow(0.1, 0.8, false)"
    }, 0); 

    // 2. Flicker the status text near the end for a "glitch" effect
    tl.to(".load-status", {
        opacity: 0,
        repeat: 3,
        yoyo: true,
        duration: 0.1
    }, 4.5);

    // 3. Fade out the loader content
    tl.to(".loading-content", {
        opacity: 0,
        duration: 0.4,
        ease: "power4.inOut"
    });

    // 3. THE REVEAL: Snap open the shutters
    // Note: yPercent: -102/102 ensures no tiny slivers of black remain
    tl.to(".shutter-top", { yPercent: -102, duration: 1.5, ease: "expo.inOut" }, "+=0.2");
    tl.to(".shutter-bottom", { yPercent: 102, duration: 1.5, ease: "expo.inOut" }, "<");

    // 4. The "Ignition" Reveal (Page Elements)
    tl.set(".marquee-trial, .marquee-trial-II", { 
        visibility: "visible" 
    });

    tl.fromTo(".menu-toggle", 
        { scale: 2, opacity: 0, filter: "blur(20px)" }, 
        { scale: 1, opacity: 1, filter: "blur(0px)", duration: 2.5, ease: "power4.out" }, "-=0.8");

    tl.fromTo(".screen-view", 
        { y: 80, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, ease: "back.out(1.2)" }, "-=1.8");

    tl.fromTo(".screen-bg", 
        { y: 80, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power4.out" }, "-=1.5");

    tl.to(".we", { opacity: 1, duration: 1.5 }, "-=1");

    // Clean up
    tl.set(".loading", { display: "none" });
});

// ========== VIDEO FORCE PLAY ========== //

document.addEventListener("DOMContentLoaded", () => {
  const videos = document.querySelectorAll("video");

  videos.forEach(vid => {
    vid.muted = true; // Desktop browsers almost require this for autoplay
    vid.setAttribute('preload', 'metadata'); // Don't choke the network immediately
    
    // Delay play by 500ms to let the Canvas/GSAP settle
    setTimeout(() => {
      vid.play().catch(err => console.log("Autoplay blocked", err));
    }, 500);
  });
});

// ========== SQUARED MARQUEE ========== //

// Target all text paths
const allMarquees = document.querySelectorAll(".marquee-path");

allMarquees.forEach(path => {
    // Repeat text to fill the square
    const text = path.textContent;
    path.textContent = (text + " ").repeat(4);

    gsap.to(path, {
        attr: { startOffset: "-100%" },
        duration: 30, // Slowed down for luxury feel
        repeat: -1,
        ease: "none"
    });
});

// ========== SCREEN VIEW (FINAL: CHAOS WITH REAL DEPTH + SCROLL) ========== //

gsap.registerPlugin(ScrollTrigger);

const screenElement = document.querySelector('.screen-view');
const screenBg = document.querySelector('.screen-bg');

let isHovered = false;

// ====== MOBILE DETECTION ====== //
const isMobile = window.matchMedia("(max-width: 768px)").matches;

// ====== PROXY VALUES ====== //
let chaosFront = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
let chaosBack  = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };

let scrollState = { x: 0, scale: 1 };

// ================= RENDER LOOP ================= //
function render() {

  const fx = chaosFront.x + scrollState.x;
  const fy = chaosFront.y;

  const bx = chaosBack.x + scrollState.x;
  const by = chaosBack.y;

  gsap.set(screenElement, {
    xPercent: -50,
    yPercent: -50,
    x: fx,
    y: fy,
    z: chaosFront.z,
    rotationX: chaosFront.rx,
    rotationY: chaosFront.ry,
    rotationZ: chaosFront.rz,
    scale: scrollState.scale,
    transformPerspective: 1200
  });

  gsap.set(screenBg, {
    xPercent: -50,
    yPercent: -50,
    x: bx,
    y: by,
    z: chaosBack.z - 40,
    rotationX: chaosBack.rx,
    rotationY: chaosBack.ry,
    rotationZ: chaosBack.rz,
    scale: scrollState.scale * 1.05
  });

  requestAnimationFrame(render);
}
render();

// ================= HOVER ================= //
screenElement.addEventListener('mouseenter', () => {
  isHovered = true;

  gsap.to([chaosFront, chaosBack], {
    x: 0, y: 0, z: 0,
    rx: 0, ry: 0, rz: 0,
    duration: 0.6,
    ease: "power3.out"
  });
});

screenElement.addEventListener('mouseleave', () => {
  isHovered = false;
});

// ================= CHAOS LOOP ================= //
function hyperMotion3D() {

  if (!isHovered) {

    const isSpinning = Math.random() > 0.8;

    const randomX = (Math.random() - 0.5) * 100;
    const randomY = (Math.random() - 0.5) * 80;
    const randomZ = isSpinning ? 120 : (Math.random() * 40);

    const rotX = (Math.random() - 0.5) * 30;
    const rotY = (Math.random() - 0.5) * 30;
    const rotZ = isSpinning
      ? (Math.random() > 0.5 ? "+=360" : "-=360")
      : (Math.random() - 0.5) * 20;

    gsap.to(chaosFront, {
      x: randomX,
      y: randomY,
      z: randomZ,
      rx: rotX,
      ry: rotY,
      rz: rotZ,
      duration: isSpinning ? 1.0 : 1.5,
      ease: "expo.inOut"
    });

    gsap.to(chaosBack, {
      delay: 0.15,
      x: randomX * 0.85,
      y: randomY * 0.85,
      z: randomZ - 30,
      rx: rotX * 0.85,
      ry: rotY * 0.85,
      rz: rotZ,
      duration: isSpinning ? 1.0 : 1.5,
      ease: "power2.out",
      onComplete: hyperMotion3D
    });

  } else {
    requestAnimationFrame(hyperMotion3D);
  }
}

// ================= SCROLL ================= //
ScrollTrigger.create({
  trigger: document.body,
  start: "top top",
  end: "bottom bottom",
  scrub: true,
  onUpdate: self => {

    const progress = self.progress;
    const step = Math.floor(progress * 4);

    let targetX = 0;
    let targetScale = 1;

    // ❌ Disable left/right on mobile
    if (!isMobile) {
      if (step === 1) {
        targetX = -400;
        targetScale = 0.5;
      }

      if (step === 2) {
        targetX = 400;
        targetScale = 0.5;
      }

      if (step === 3) {
        targetX = -400;
        targetScale = 0.5;
      }
    } else {
      // ✅ Mobile: only scale, no horizontal movement
      if (step >= 1 && step <= 3) {
        targetScale = 0.5;
      }
    }

    if (progress < 0.05 || progress > 0.95) {
      targetX = 0;
      targetScale = 1;
    }

    gsap.to(scrollState, {
      x: targetX,
      scale: targetScale,
      duration: 0.4,
      ease: "power2.out"
    });
  }
});

// ================= INIT ================= //
hyperMotion3D();

// ================= Hover screen-view ================= //
const footerInner = document.querySelector('.footer-inner');
const contentInner = document.querySelectorAll('.content-inner');

// Hover IN
screenElement.addEventListener('mouseenter', () => {
  isHovered = true;

  gsap.to([screenElement, screenBg], {
    x: 0,
    y: 0,
    z: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    duration: 0.3,
    ease: "power3.out",
    overwrite: true
  });

  // 👇 fade footer + content
  gsap.to([footerInner, contentInner], {
    opacity: 0,
    pointerEvents: "none",
    duration: 0.2,
    ease: "power2.out"
  });
});

// Hover OUT
screenElement.addEventListener('mouseleave', () => {
  isHovered = false;

  // 👇 bring them back
  gsap.to([footerInner, contentInner], {
    opacity: 1,
    pointerEvents: "auto",
    duration: 0.2,
    ease: "power2.out"
  });
});

// ========== MENU animation ========== //

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(CustomEase);
  CustomEase.create("hop", "M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1");
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");
  const links = document.querySelectorAll(".link");
  const socialLinks = document.querySelectorAll(".socials p");
  let isAnimating = false;
  function splitTextIntoSpans(selector) {
    document.querySelectorAll(selector).forEach((element) => {
      let split = element.innerText.split("").map(char =>
        `<span>${char === " " ? "&nbsp;&nbsp;" : char}</span>`).join("");
      element.innerHTML = split;
    });
  }
  splitTextIntoSpans(".header h1");

  menuToggle.addEventListener("click", () => {
    if (isAnimating) return;
    isAnimating = true;
    const isOpen = menuToggle.classList.contains("opened");
    menuToggle.classList.toggle("opened", !isOpen);
    menuToggle.classList.toggle("closed", isOpen);

    if (!isOpen) {
      gsap.to(menu, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "hop",
        duration: 1.5,
        onStart: () => (menu.style.pointerEvents = "all"),
        onComplete: () => (isAnimating = false)
      });
      gsap.to(links, {
        y: 0, opacity: 1, stagger: 0.1, delay: 0.85, duration: 1, ease: "power3.out"
      });
      gsap.to(socialLinks, {
        y: 0, opacity: 1, stagger: 0.05, delay: 0.85, duration: 1, ease: "power3.out"
      });
      gsap.to(".video-wrapper", {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "hop", duration: 1.5, delay: 0.5
      });
      gsap.to(".header h1 span", {
        rotateY: 0, y: 0, scale: 1,
        stagger: 0.05, delay: 0.5, duration: 1.5, ease: "power4.out"
      });
    } else {
      gsap.to(menu, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        ease: "hop",
        duration: 1.5,
        onComplete: () => {
          menu.style.pointerEvents = "none";
          gsap.set(menu, { clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)" });
          gsap.set(links, { y: 30, opacity: 0 });
          gsap.set(socialLinks, { y: 30, opacity: 0 });
          gsap.set(".video-wrapper", {
            clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)"
          });
          gsap.set(".header h1 span", {
            y: 500, rotateY: 90, scale: 0.8
          });
          isAnimating = false;
        }
      });
    }
  });
});

// BG points -----------------------------------------------------------------
const gridCanvas = document.getElementById("grid-bg");
const ctx = gridCanvas.getContext("2d");

// --- 1. Create a hidden noise buffer ---
const noiseCanvas = document.createElement('canvas');
const noiseCtx = noiseCanvas.getContext('2d');
noiseCanvas.width = 100;
noiseCanvas.height = 100;

function createNoise() {
    const imageData = noiseCtx.createImageData(100, 100);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255;
        data[i] = data[i+1] = data[i+2] = val; // RGB
        data[i+3] = 25; // Opacity of the grain (keep it low!)
    }
    noiseCtx.putImageData(imageData, 0, 0);
}
createNoise();

let time = 0;

function resize() {
    gridCanvas.width = window.innerWidth;
    gridCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function draw() {
    time += 0.005;
    
    // Clear canvas
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);

    // 2. Draw the Gradient
    const centerX = gridCanvas.width / 2 + Math.cos(time) * (gridCanvas.width * 0.3);
    const centerY = gridCanvas.height / 2 + Math.sin(time * 0.8) * (gridCanvas.height * 0.2);
    const baseRadius = Math.max(gridCanvas.width, gridCanvas.height) * 0.7;
    const pulseRadius = baseRadius + Math.sin(time * 0.5) * 100;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
    gradient.addColorStop(0, "#CB2027"); 
    gradient.addColorStop(1, "#000");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, gridCanvas.width, gridCanvas.height);

    // 3. Layer the Noise on top
    // We use 'source-over' or 'overlay' to blend the grain
    ctx.globalCompositeOperation = "source-over"; 
    
    // To animate the noise, we draw the small noise tile at random offsets
    const noiseOffsetX = Math.random() * noiseCanvas.width;
    const noiseOffsetY = Math.random() * noiseCanvas.height;

    // Create a pattern from the noise tile
    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    ctx.save();
    ctx.translate(noiseOffsetX, noiseOffsetY); // Shifts noise every frame
    ctx.fillStyle = pattern;
    ctx.fillRect(-noiseOffsetX, -noiseOffsetY, gridCanvas.width, gridCanvas.height);
    ctx.restore();

    requestAnimationFrame(draw);
}

draw();

// BG noise -----------------------------------------------------------------
class AnimatedNoise {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.noiseCanvas = document.createElement("canvas");
    this.noiseCtx = this.noiseCanvas.getContext("2d");

    this.noiseCanvas.width = 100;
    this.noiseCanvas.height = 100;

    this.createNoise();
    this.resize();

    window.addEventListener("resize", () => this.resize());

    this.time = 0;
    this.draw = this.draw.bind(this);
    this.draw();
  }

  createNoise() {
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

    // --- Noise only (same logic as your original) ---
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

// init all instances
document.querySelectorAll(".noise-canvas").forEach(canvas => {
  new AnimatedNoise(canvas);
});