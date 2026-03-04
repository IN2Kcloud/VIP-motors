window.addEventListener('load', () => {
  document.body.classList.remove('before-load');
});

document.querySelector('.loading').addEventListener('transitionend', (e) => {
  document.body.removeChild(e.currentTarget);
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

// ========== SCREEN VIEW ========== //

const screenElement = document.querySelector('.screen-view');
const dtls = document.querySelector('.triangle-up'); // Your saved triangle element

function glitchStepMotion() {
  const isMajorShift = Math.random() > 0.8;
  
  // Subtle "idling" values vs aggressive "glitch" values
  const moveX = isMajorShift ? (Math.random() - 0.5) * 120 : (Math.random() - 0.5) * 40;
  const moveY = isMajorShift ? (Math.random() - 0.5) * 100 : (Math.random() - 0.5) * 30;
  const moveZ = isMajorShift ? Math.random() * 150 : Math.random() * 50;
  
  // Sharp rotations to catch the light on the 2px white border
  const rotX = (Math.random() - 0.5) * 45; 
  const rotY = (Math.random() - 0.5) * 45;
  const rotZ = isMajorShift ? (Math.random() > 0.5 ? 10 : -10) : (Math.random() - 0.5) * 4;

  gsap.to(screenElement, {
    duration: isMajorShift ? 0.2 : 1.2, // Snap quickly on major shifts, drift on minor
    xPercent: -50,
    yPercent: -50,
    x: moveX,
    y: moveY,
    z: moveZ,
    rotationX: rotX,
    rotationY: rotY,
    rotationZ: rotZ,
    transformPerspective: 1000,
    ease: isMajorShift ? "rough({ template: none, strength: 2, points: 20, taper: 'none', randomize: true, clamp:  false})" : "expo.out",
    onComplete: () => {
      // Small "micro-jitter" after every move to keep it feeling "alive"
      gsap.to(dtls, {
        duration: 0.1,
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
        repeat: 1,
        yoyo: true
      });
      
      glitchStepMotion();
    }
  });
}

glitchStepMotion();

window.addEventListener('load', () => {
  // 1. Existing Loading Logic
  document.body.classList.remove('before-load');
  
  // 2. Marquee Initialization
  const initMarquee = (selector, duration = 120) => {
    const wrapper = document.querySelector(selector);
    if (!wrapper) return;
  
    // Clone the items to ensure the screen is full
    const items = wrapper.innerHTML;
    wrapper.innerHTML = items + items + items; 
  
    // Calculate the width of ONE set of items
    const scrollWidth = wrapper.scrollWidth / 3;
  
    gsap.to(wrapper, {
      x: -scrollWidth,
      duration: duration,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % scrollWidth)
      }
    });
  };
  
  // Initialize both marquees
  initMarquee(".marqueecontent");
});

// ========== VIDEOS TIMING ========== //
const leader = document.getElementById('screen-video-wrapper');
const follower = document.getElementById('bg-video-wrapper');

// 1. Ensure they start together
leader.onplay = () => follower.play();
leader.onpause = () => follower.pause();

// 2. The Sync Logic
// This checks every few milliseconds if they are out of alignment
leader.addEventListener('timeupdate', () => {
  const diff = Math.abs(leader.currentTime - follower.currentTime);
  
  // If they drift by more than 0.1 seconds, force a snap-sync
  if (diff > 0.1) {
    follower.currentTime = leader.currentTime;
  }
});

// 3. Speed Match
// In case one video has a slightly different encoded framerate
leader.addEventListener('ratechange', () => {
  follower.playbackRate = leader.playbackRate;
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
