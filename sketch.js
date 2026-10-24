//v1

let bg;
let imgs = [];
let animals = [];
let sticks = [];

let song;
let fft;

let isStopped = true;
let lastTrigger = 0;

const DESIGN_W = 1242;
const DESIGN_H = 886;

function preload() {
  bg = loadImage("bg.png");

  imgs.push(loadImage("1111.png"));
  imgs.push(loadImage("22222.png"));
  imgs.push(loadImage("33333.png"));

  song = loadSound("wave-2.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CORNER);

  song.setVolume(1);

  fft = new p5.FFT();
  fft.setInput(song);

  generateArtwork();
}

function draw() {
  drawBackground();

  if (isStopped) {
    drawAnimalsStill();
    drawMagicDust();
    return;
  }

  const scaleValue = min(width / DESIGN_W, height / DESIGN_H);
  const drawW = DESIGN_W * scaleValue;
  const drawH = DESIGN_H * scaleValue;
  const offsetX = (width - drawW) / 2;
  const offsetY = (height - drawH) / 2;

  push();
  translate(offsetX, offsetY);
  scale(scaleValue);

  drawMagicDust();
  drawAnimals();
  pop();
}

function generateArtwork() {
  animals = [];
  sticks = [];

  generateLayout();
  generateMagicDust();
}

function drawBackground() {
  imageMode(CORNER);
  image(bg, 0, 0, width, height);
}

function generateMagicDust() {
  for (let i = 0; i < 250; i++) {
    sticks.push({
      x: random(width),
      y: random(height),
      size: random(2, 8),
      color: random([
        [255, 190, 215],
        [255, 235, 240],
        [40, 255, 120]
      ])
    });
  }
}

function drawMagicDust() {
  noStroke();

  for (let s of sticks) {
    fill(s.color[0], s.color[1], s.color[2], 140);
    circle(s.x, s.y, s.size);
  }
}

function generateLayout() {
  animals = [];

  for (let i = 0; i < 30; i++) {
    let img = random(imgs);
    let scaleValue = random(0.03, 0.06);
    let w = img.width * scaleValue;
    let h = img.height * scaleValue;

    animals.push({
      img: img,
      x: random(width),
      y: random(-height, -h),
      w: w,
      h: h,
      angle: random(-PI / 3, PI / 3),
      speedX: random(-1.5, 2.5),
      speedY: random(2.8, 5.5),
      rotationSpeed: random(-0.015, 0.015)
    });
  }
}

function drawAnimals() {
  imageMode(CENTER);

  let bass = 0;
  let mid = 0;
  let treble = 0;

  if (song && song.isPlaying()) {
    fft.analyze();
    bass = fft.getEnergy("bass");
    mid = fft.getEnergy("mid");
    treble = fft.getEnergy("treble");
  }

  for (let a of animals) {
    a.x += a.speedX;
    a.y += a.speedY;
    a.angle += a.rotationSpeed;

    let s = map(bass, 0, 255, 1, 1.15);

    push();
    translate(a.x, a.y);
    rotate(a.angle + sin(frameCount * 0.025 + a.x) * map(mid, 0, 255, 0, 0.12));
    scale(s);
    tint(255, map(treble, 0, 255, 180, 255));
    image(a.img, 0, 0, a.w, a.h);
    pop();

    if (a.y - a.h / 2 > height) {
      a.y = -a.h;
      a.x = random(width);
      a.speedX = random(-0.8, 1.5);
      a.speedY = random(0.8, 2.5);
    }

    if (a.x > width + a.w / 2) {
      a.x = -a.w / 2;
    }

    if (a.x < -a.w / 2) {
      a.x = width + a.w / 2;
    }
  }

  noTint();
}

function drawAnimalsStill() {
  imageMode(CENTER);
  noTint();

  for (let a of animals) {
    push();
    translate(a.x, a.y);
    rotate(a.angle);
    image(a.img, 0, 0, a.w, a.h);
    pop();
  }
}

function triggerSound() {
  if (millis() - lastTrigger < 400) return;
  lastTrigger = millis();

  if (!isStopped) {
    isStopped = true;

    if (song.isPlaying()) {
      song.stop();
    }
  } else {
    isStopped = false;
    generateArtwork();
    userStartAudio();
    getAudioContext().resume();
    song.play();
  }
}

function mousePressed() {
  triggerSound();
  return false;
}

function touchStarted() {
  triggerSound();
  return false;
}

document.addEventListener("touchstart", (event) => {
  triggerSound();
  event.preventDefault();
}, { passive: false });

window.addEventListener("message", (event) => {
  if (event.data === "triggerSound") {
    triggerSound();
  }
});

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (key === "r" || key === "R") {
    saveGif("poison-garden", 8);
  }

  if (key === "s" || key === "S") {
    saveCanvas("poison-garden", "png");
  }
}
