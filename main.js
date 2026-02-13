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
    vid.play().catch(() => {
      vid.muted = true; // force mute if needed
      vid.play().catch(() => {});
    });
  });
});

// ========== SCREEN VIEW ========== //

const screenElement = document.querySelector('.screen-view');
const dtls = document.querySelector('.triangle-up');

function hyperMotion3D() {
  const isSpinning = Math.random() > 0.8; 
  
  const randomX = (Math.random() - 0.5) * 100;   
  const randomY = (Math.random() - 0.5) * 80;   
  const randomZ = isSpinning ? 120 : (Math.random() * 40); 
  
  const rotX = (Math.random() - 0.5) * 30; 
  const rotY = (Math.random() - 0.5) * 30; 
  
  // FIX: Use relative rotation so it never "unwinds"
  const rotZ = isSpinning ? (Math.random() > 0.5 ? "+=360" : "-=360") : (Math.random() - 0.5) * 20;

  gsap.to(screenElement, {
    duration: isSpinning ? 1.0 : 1.5,
    xPercent: -50,
    yPercent: -50,
    x: randomX,
    y: randomY,
    z: randomZ,
    rotationX: rotX,
    rotationY: rotY,
    rotationZ: rotZ, // Moves from current position forward
    transformPerspective: 1200,
    ease: "expo.inOut",
    onComplete: () => {
        // After a big spin, we normalize the value to keep numbers small 
        // without the user seeing a jump.
        if (isSpinning) {
            const currentRot = gsap.getProperty(screenElement, "rotationZ");
            gsap.set(screenElement, { rotationZ: currentRot % 360 });
        }
        hyperMotion3D();
    }
  });
}

hyperMotion3D();

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
  ctx.fillStyle = "#CB2027";
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
