/*
window.addEventListener('load', () => {
  document.body.classList.remove('before-load');
});

document.querySelector('.loading').addEventListener('transitionend', (e) => {
  document.body.removeChild(e.currentTarget);
});
*/
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

{
    const mapNumber = (X,A,B,C,D) => (X-A)*(D-C)/(B-A)+C;
    // from http://www.quirksmode.org/js/events_properties.html#position
	const getMousePos = (e) => {
        let posx = 0;
        let posy = 0;
		if (!e) e = window.event;
		if (e.pageX || e.pageY) {
            posx = e.pageX;
			posy = e.pageY;
		}
		else if (e.clientX || e.clientY) 	{
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
        return { x : posx, y : posy }
    }
    // Generate a random float.
    const getRandomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

    /**
     * One class per effect. 
     * Lots of code is repeated, so that single effects can be easily used. 
     */

    // Effect 6
    class HoverImgFx6 {
        constructor(el) {
            this.DOM = {el: el};
            
            this.DOM.reveal = document.createElement('div');
            this.DOM.reveal.className = 'hover-reveal';
            this.DOM.reveal.style.overflow = 'hidden';
            this.DOM.reveal.innerHTML = `<div class="hover-reveal__deco"></div><div class="hover-reveal__inner"><div class="hover-reveal__img" style="background-image:url(${this.DOM.el.dataset.img})"></div></div>`;
            this.DOM.el.appendChild(this.DOM.reveal);
            this.DOM.revealInner = this.DOM.reveal.querySelector('.hover-reveal__inner');
            this.DOM.revealInner.style.overflow = 'hidden';
            this.DOM.revealDeco = this.DOM.reveal.querySelector('.hover-reveal__deco');
            this.DOM.revealImg = this.DOM.revealInner.querySelector('.hover-reveal__img');

            this.initEvents();
        }
        initEvents() {
            this.positionElement = (ev) => {
                const mousePos = getMousePos(ev);
                const docScrolls = {
                    left : document.body.scrollLeft + document.documentElement.scrollLeft, 
                    top : document.body.scrollTop + document.documentElement.scrollTop
                };
                this.DOM.reveal.style.top = `${mousePos.y+20-docScrolls.top}px`;
                this.DOM.reveal.style.left = `${mousePos.x+20-docScrolls.left}px`;
            };
            this.mouseenterFn = (ev) => {
                this.positionElement(ev);
                this.showImage();
            };
            this.mousemoveFn = ev => requestAnimationFrame(() => {
                this.positionElement(ev);
            });
            this.mouseleaveFn = () => {
                this.hideImage();
            };
            
            this.DOM.el.addEventListener('mouseenter', this.mouseenterFn);
            this.DOM.el.addEventListener('mousemove', this.mousemoveFn);
            this.DOM.el.addEventListener('mouseleave', this.mouseleaveFn);
        }
        showImage() {
            TweenMax.killTweensOf(this.DOM.reveal);
            TweenMax.killTweensOf(this.DOM.revealInner);
            TweenMax.killTweensOf(this.DOM.revealImg);
            TweenMax.killTweensOf(this.DOM.revealDeco);

            this.tl = new TimelineMax({
                onStart: () => {
                    this.DOM.reveal.style.opacity = 1;
                    TweenMax.set(this.DOM.el, {zIndex: 1000});
                }
            })
            .add('begin')
            .set(this.DOM.revealInner, {x: '100%'})
            .set(this.DOM.revealDeco, {transformOrigin: '100% 50%'})
            .add(new TweenMax(this.DOM.revealDeco, 0.3, {
                ease: Sine.easeInOut,
                startAt: {scaleX: 0},
                scaleX: 1
            }), 'begin')
            .set(this.DOM.revealDeco, {transformOrigin: '0% 50%'})
            .add(new TweenMax(this.DOM.revealDeco, 0.6, {
                ease: Expo.easeOut,
                scaleX: 0
            }), 'begin+=0.3')
            .add(new TweenMax(this.DOM.revealInner, 0.6, {
                ease: Expo.easeOut,
                startAt: {x: '100%'},
                x: '0%'
            }), 'begin+=0.45')
            .add(new TweenMax(this.DOM.revealImg, 0.6, {
                ease: Expo.easeOut,
                startAt: {x: '-100%'},
                x: '0%'
            }), 'begin+=0.45')
            .add(new TweenMax(this.DOM.revealImg, 1.6, {
                ease: Expo.easeOut,
                startAt: {scale: 1.3},
                scale: 1
            }), 'begin+=0.45')
            .add(new TweenMax(this.DOM.reveal, 0.8, {
                ease: Quint.easeOut,
                startAt: {x: '20%', rotation: 10},
                x: '0%',
                rotation: 0
            }), 'begin');
        }
        hideImage() {
            TweenMax.killTweensOf(this.DOM.reveal);
            TweenMax.killTweensOf(this.DOM.revealInner);
            TweenMax.killTweensOf(this.DOM.revealImg);
            TweenMax.killTweensOf(this.DOM.revealDeco);

            this.tl = new TimelineMax({
                onStart: () => {
                    TweenMax.set(this.DOM.el, {zIndex: 999});
                },
                onComplete: () => {
                    TweenMax.set(this.DOM.el, {zIndex: ''});
                    TweenMax.set(this.DOM.reveal, {opacity: 0});
                }
            })
            .add('begin')
            .add(new TweenMax(this.DOM.revealInner, 0.1, {
                ease: Sine.easeOut,
                x: '-100%'
            }), 'begin')
            .add(new TweenMax(this.DOM.revealImg, 0.1, {
                ease: Sine.easeOut,
                x: '100%'
            }), 'begin')
        }
    }
 
    // Effect 12
    class HoverImgFx12 {
        constructor(el) {
            this.DOM = {el: el};
            this.DOM.reveal = document.createElement('div');
            this.DOM.reveal.className = 'hover-reveal'; 
            this.totalDecos = 7;
            let inner = '';
            for (let i = 0; i <= this.totalDecos-1; ++i) {
                inner += '<div class="hover-reveal__deco"></div>';
            }
            inner += `<div class="hover-reveal__inner"><div class="hover-reveal__img" style="background-image:url(${this.DOM.el.dataset.img})"></div></div>`
            this.DOM.reveal.innerHTML = inner;
            this.DOM.el.appendChild(this.DOM.reveal);
            this.DOM.revealDecos = [...this.DOM.reveal.querySelectorAll('.hover-reveal__deco')];
            this.DOM.revealDecos.forEach((deco, pos) => {
                TweenMax.set(deco, {
                    width: pos === this.totalDecos-1 ? '100%' : `${getRandomFloat(40,100)}%`,
                    height: pos === this.totalDecos-1 ? '100%' : `${getRandomFloat(5,30)}%`,
                    x: pos === this.totalDecos-1 ? '0%' : `${getRandomFloat(-100,100)}%`,
                    y: pos === this.totalDecos-1 ? '0%' : `${getRandomFloat(-300,300)}%`,
                    scaleX: 0
                });
            });
            this.DOM.revealInner = this.DOM.reveal.querySelector('.hover-reveal__inner');
            this.DOM.revealInner.style.overflow = 'hidden';
            this.DOM.revealImg = this.DOM.revealInner.querySelector('.hover-reveal__img');

            this.initEvents();
        }
        initEvents() {
            this.positionElement = (ev) => {
                const mousePos = getMousePos(ev);
                const docScrolls = {
                    left : document.body.scrollLeft + document.documentElement.scrollLeft, 
                    top : document.body.scrollTop + document.documentElement.scrollTop
                };
                this.DOM.reveal.style.top = `${mousePos.y+20-docScrolls.top}px`;
                this.DOM.reveal.style.left = `${mousePos.x+20-docScrolls.left}px`;
            };
            this.mouseenterFn = (ev) => {
                this.positionElement(ev);
                this.showImage();
            };
            this.mousemoveFn = ev => requestAnimationFrame(() => {
                this.positionElement(ev);
            });
            this.mouseleaveFn = () => {
                this.hideImage();
            };
            
            this.DOM.el.addEventListener('mouseenter', this.mouseenterFn);
            this.DOM.el.addEventListener('mousemove', this.mousemoveFn);
            this.DOM.el.addEventListener('mouseleave', this.mouseleaveFn);
        }
        showImage() {
            TweenMax.killTweensOf(this.DOM.revealInner);
            TweenMax.killTweensOf(this.DOM.revealImg);
            TweenMax.killTweensOf(this.DOM.revealDecos);

            this.tl = new TimelineMax({
                onStart: () => {
                    this.DOM.reveal.style.opacity = 1;
                    TweenMax.set(this.DOM.el, {zIndex: 1000});
                }
            })
            .add('begin')
            .set(this.DOM.revealInner, {x: '100%', opacity: 0})
            .set(this.DOM.revealDecos, {transformOrigin: '100% 50%'})
            .staggerTo(this.DOM.revealDecos, 0.3, {
                ease: Expo.easeInOut,
                scaleX: 1
            }, 0.06, 'begin')
            .staggerTo(this.DOM.revealDecos, getRandomFloat(0.3,0.6), {
                ease: Expo.easeOut,
                startAt: {transformOrigin: '0% 50%'},
                scaleX: 0,
                x: '-=5%'
            }, 0.04, 'begin+=0.3')
            .add(new TweenMax(this.DOM.revealInner, 0.6, {
                ease: Expo.easeOut,
                startAt: {x: '100%'},
                x: '0%',
                opacity: 1
            }), 'begin+=0.75')
            .add(new TweenMax(this.DOM.revealImg, 0.6, {
                ease: Expo.easeOut,
                startAt: {x: '-100%'},
                x: '0%'
            }), 'begin+=0.75');
        }
        hideImage() {
            TweenMax.killTweensOf(this.DOM.revealInner);
            TweenMax.killTweensOf(this.DOM.revealImg);
            TweenMax.killTweensOf(this.DOM.revealDecos);

            this.tl = new TimelineMax({
                onStart: () => {
                    TweenMax.set(this.DOM.el, {zIndex: 999});
                },
                onComplete: () => {
                    TweenMax.set(this.DOM.el, {zIndex: ''});
                    TweenMax.set(this.DOM.reveal, {opacity: 0});
                }
            })
            .add('begin')
            .add(new TweenMax(this.DOM.revealInner, 0.1, {
                ease: Sine.easeOut,
                x: '-100%'
            }), 'begin')
            .add(new TweenMax(this.DOM.revealImg, 0.1, {
                ease: Sine.easeOut,
                x: '100%'
            }), 'begin')
        }
    }

    // Effect 23
    class HoverImgFx23 {
        constructor(el) {
            this.DOM = {el: el};
            
            this.DOM.reveal = document.createElement('div');
            this.DOM.reveal.className = 'hover-reveal';
            this.totalImages = 15;
            let inner = '';
            for (let i = 0; i <= this.totalImages-1; ++i) {
                inner += `<div class="hover-reveal__img" style="position: absolute; background-image:url(${this.DOM.el.dataset.img})"></div>`;
            }
            this.DOM.reveal.innerHTML = inner;
            this.DOM.el.appendChild(this.DOM.reveal);
            this.DOM.revealImgs = [...this.DOM.reveal.querySelectorAll('.hover-reveal__img')];
            this.rect = this.DOM.reveal.getBoundingClientRect();
            charming(this.DOM.el);
            this.DOM.letters = [...this.DOM.el.querySelectorAll('span')];
            this.initEvents();
        }
        initEvents() {
            this.positionElement = (ev) => {
                const mousePos = getMousePos(ev);
                const docScrolls = {
                    left : document.body.scrollLeft + document.documentElement.scrollLeft, 
                    top : document.body.scrollTop + document.documentElement.scrollTop
                };
                this.DOM.reveal.style.top = `${mousePos.y-this.rect.height-20-docScrolls.top}px`;
                this.DOM.reveal.style.left = `${mousePos.x-this.rect.width-20-docScrolls.left}px`;
            };
            this.mouseenterFn = (ev) => {
                this.positionElement(ev);
                this.animateLetters();
                this.showImage();
            };
            this.mousemoveFn = ev => requestAnimationFrame(() => {
                this.positionElement(ev);
            });
            this.mouseleaveFn = () => {
                this.hideImage();
            };
            
            this.DOM.el.addEventListener('mouseenter', this.mouseenterFn);
            this.DOM.el.addEventListener('mousemove', this.mousemoveFn);
            this.DOM.el.addEventListener('mouseleave', this.mouseleaveFn);
        }
        showImage() {
            TweenMax.killTweensOf(this.DOM.revealImgs);
            this.tl = new TimelineMax({
                onStart: () => {
                    this.DOM.reveal.style.opacity = 1;
                    TweenMax.set(this.DOM.el, {zIndex: 1000});
                }
            })
            .set(this.DOM.revealImgs, {opacity: 0});

            for (let i = 0; i <= this.totalImages-1; ++i) {
                TweenMax.set(this.DOM.revealImgs[i], {
                    x: `${i*getRandomFloat(-10,10)}%`, 
                    y: `${i*getRandomFloat(-15,15)}%`,
                    rotation: `${i !== this.totalImages-1 ? getRandomFloat(-7,7) : 0}deg`,
                    scale: `${getRandomFloat(0.1,0.5)}`
                });
                
                this.tl.add(new TweenMax(this.DOM.revealImgs[i], i === this.totalImages-1 ? 0.8 : 0.5, {
                    ease: i === this.totalImages-1 ? Expo.easeOut : Quint.easeOut,
                    startAt: i === this.totalImages-1 ? {opacity: 1, x: '0%', y: '-10%'} : {opacity: 1},
                    opacity: i === this.totalImages-1 ? 1 : 0,
                    x: i === this.totalImages-1 ? '0%' : null,
                    y: i === this.totalImages-1 ? '0%' : null,
                    scale: i === this.totalImages-1 ? 1 : 0.6
                }), i*0.04);
            }
        }
        hideImage() {
            TweenMax.killTweensOf(this.DOM.revealImgs);
            this.tl = new TimelineMax({
                onStart: () => {
                    TweenMax.set(this.DOM.el, {zIndex: 999});
                },
                onComplete: () => {
                    TweenMax.set(this.DOM.el, {zIndex: ''});
                    TweenMax.set(this.DOM.reveal, {opacity: 0});
                }
            })
            .add(new TweenMax(this.DOM.revealImgs[this.totalImages-1], 0.15, {
                ease: Sine.easeOut,
                opacity: 0
            }))
        }
        animateLetters() {
            TweenMax.killTweensOf(this.DOM.letters);
            this.DOM.letters.forEach((letter) => {
                const opts = Math.round(Math.random()) === 0 ? {scale: 0, opacity: 0} : {opacity: 0};
                TweenMax.set(letter, opts);
            });
            TweenMax.to(this.DOM.letters, 1, {
                ease: Expo.easeOut,
                scale: 1,
                opacity: 1
            });
        }
    }
    
    [...document.querySelectorAll('[data-fx="6"] > a, a[data-fx="6"]')].forEach(link => new HoverImgFx6(link));

    [...document.querySelectorAll('[data-fx="12"] > .block__title, block__title[data-fx="12"]')].forEach(link => new HoverImgFx12(link));
    
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

// Demo purspose only: Preload all the images in the page..
const contentel = document.querySelector('.content');
[...document.querySelectorAll('.block__title, .block__link, .content__text-link')].forEach((el) => {
    const imgsArr = el.dataset.img.split(',');
    for (let i = 0, len = imgsArr.length; i <= len-1; ++i ) {
        const imgel = document.createElement('img');
        imgel.style.visibility = 'hidden';
        imgel.style.width = 0;
        imgel.src = imgsArr[i];
        imgel.className = 'preload';
        contentel.appendChild(imgel);
    }
});
imagesLoaded(document.querySelectorAll('.preload'), () => document.body.classList.remove('loading'));
}