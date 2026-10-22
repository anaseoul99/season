
let bg;
let imgs = [];
let animals = [];
let sticks = [];

let song;
let fft;

let isStopped = true;

// 처음 작품 생성
function preload() {
  bg = loadImage("bg.png");

  imgs.push(loadImage("1111.png"));
  imgs.push(loadImage("22222.png"));
  imgs.push(loadImage("33333.png"));

  song = loadSound("wave-2.mp3");
}

function setup() {
  createCanvas(1242, 886);

  song.setVolume(1);

  fft = new p5.FFT();
  fft.setInput(song);

  generateArtwork();
}

function draw() {
  // 배경은 항상 고정
  drawBackground();

  // 멈췄을 때는 현재 동물 위치를 유지
  if (isStopped) {
    drawAnimalsStill();
    drawMagicDust();
    return;
  }

  // 실행 중일 때만 동물 이동
  drawMagicDust();
  drawAnimals();
}

// 작품 초기화
function generateArtwork() {
  animals = [];
  sticks = [];

  generateLayout();
  generateMagicDust();
}

// 배경 이미지
function drawBackground() {
  imageMode(CORNER);
  image(bg, 0, 0, width, height);
}

// 반짝이는 점 생성
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

// 반짝이는 점 표시
function drawMagicDust() {
  noStroke();

  for (let s of sticks) {
    fill(
      s.color[0],
      s.color[1],
      s.color[2],
      140
    );

    circle(s.x, s.y, s.size);
  }
}

// 동물 생성
function generateLayout() {
  animals = [];

  for (let i = 0; i < 30; i++) {
    let img = random(imgs);

    // 1111.png만 더 작게
    let scaleValue;

    if (img === imgs[0] || img === imgs[1] || img === imgs[2]) {
      scaleValue = random(0.03, 0.06);
    } else {
      scaleValue = random(0.12, 0.22);
    }

 

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

// 동물 이동 및 그리기
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
    // 대각선으로 떨어짐
    a.x += a.speedX;
    a.y += a.speedY;

    // 회전
    a.angle += a.rotationSpeed;

    // 음악에 반응하는 크기
    let s = map(bass, 0, 255, 1, 1.15);

    push();

    translate(a.x, a.y);

    rotate(
      a.angle +
      sin(frameCount * 0.025 + a.x) *
      map(mid, 0, 255, 0, 0.12)
    );

    scale(s);

    tint(
      255,
      map(treble, 0, 255, 180, 255)
    );

    image(a.img, 0, 0, a.w, a.h);

    pop();

    // 화면 아래로 나가면 위에서 다시 시작
    if (a.y - a.h / 2 > height) {
      a.y = -a.h;
      a.x = random(width);

      a.speedX = random(-0.8, 1.5);
      a.speedY = random(0.8, 2.5);
    }

    // 좌우 경계 처리
    if (a.x > width + a.w / 2) {
      a.x = -a.w / 2;
    }

    if (a.x < -a.w / 2) {
      a.x = width + a.w / 2;
    }
  }

  noTint();
}

// 정지 상태에서 동물 위치 유지
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

// 클릭: 정지 / 처음부터 재시작
function triggerSound() {
  if (!isStopped) {
    // 현재 화면에서 정지
    isStopped = true;

    if (song.isPlaying()) {
      song.stop();
    }

  } else {
    // 처음 위치부터 재시작
    isStopped = false;

    generateArtwork();

    userStartAudio();

    song.stop();
    song.play();
  }
}

function mousePressed() {
  triggerSound();
  return false;
}

// Cargo iframe 메시지 연동
window.addEventListener("message", (event) => {
  if (event.data === "triggerSound") {
    triggerSound();
  }
});

// 키보드 단축키
function keyPressed() {
  if (key === "r" || key === "R") {
    saveGif("poison-garden", 8);
  }

  if (key === "s" || key === "S") {
    saveCanvas("poison-garden", "png");
  }
}
