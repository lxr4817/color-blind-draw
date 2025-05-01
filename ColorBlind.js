// 색맹 시뮬레이션 타입
let colorBlindTypes = ['protanopia', 'deuteranopia', 'tritanopia'];
let colorBlindType;

// 캔버스 및 팔레트 관련 변수
let canvasW, canvasH;
let paletteRadius = 130;
let paletteCenter;
let selectedColor;
let transformedColor;
let eraserMode = false;
let brushSize = 15;

// 색맹 시뮬레이션 행렬 (Machado et al.)
const colorBlindMatrices = {
  'protanopia': [
    0.567, 0.433, 0,
    0.558, 0.442, 0,
    0, 0.242, 0.758
  ],
  'deuteranopia': [
    0.625, 0.375, 0,
    0.7, 0.3, 0,
    0, 0.3, 0.7
  ],
  'tritanopia': [
    0.95, 0.05, 0,
    0, 0.433, 0.567,
    0, 0.475, 0.525
  ]
};

function setup() {
    canvasW = windowWidth;
    canvasH = windowHeight;
    frameRate(60);
    createCanvas(canvasW, canvasH);
    background(255);
    paletteCenter = createVector(canvasW - paletteRadius - 30, paletteRadius + 30);

    // 랜덤 색각 유형 선택
    colorBlindType = random(colorBlindTypes);

    // 기본 색상은 빨간색
    selectedColor = color(255, 0, 0);
    transformedColor = simulateColorBlindness(selectedColor, colorBlindType);
}

function touchStarted() {
    mousePressed();
    return false;
  }
  
  function touchMoved() {
    mouseDragged();
    return false;
  }

function draw() {
  // 팔레트 배경
  noStroke();
  fill(255);
  circle(paletteCenter.x, paletteCenter.y, paletteRadius * 2 + 10);

  // 컬러휠 그리기
  drawColorWheel();

  // 선택된 색상 표시
  drawSelectedColorIndicator();

  // 버튼 그리기
  drawButtons();

  // 브러시 크기 표시
  drawBrushSizeUI();
}

function drawColorWheel() {
  colorMode(HSB);
  let steps = 360;
  for (let i = 0; i < steps; i++) {
    let angle = map(i, 0, steps, 0, TWO_PI);
    for (let r = 0; r < paletteRadius; r += 2) {
      let hue = i % 360;
      let saturation = map(r, 0, paletteRadius, 20, 100);
      let x = paletteCenter.x + cos(angle) * r;
      let y = paletteCenter.y + sin(angle) * r;
      fill(hue, saturation, 100);
      circle(x, y, 4);
    }
  }
  colorMode(RGB);
}

function drawSelectedColorIndicator() {
  stroke(0);
  strokeWeight(2);
  fill(selectedColor);
  circle(paletteCenter.x - paletteRadius - 20, paletteCenter.y, 30);
  noStroke();
}

function drawButtons() {
  // 초기화 버튼
  fill(230);
  rect(30, 30, 80, 36, 8);
  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("초기화", 30 + 40, 30 + 18);

  // 지우개 버튼
  fill(eraserMode ? color(200, 220, 255) : 230);
  rect(130, 30, 80, 36, 8);
  fill(0);
  text("지우개", 130 + 40, 30 + 18);
  textAlign(LEFT, BASELINE);

  // 브러시 크기 조절 버튼
  fill(220);
  rect(230, 30, 36, 36, 8);
  fill(0);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("+", 230 + 18, 30 + 18);

  fill(220);
  rect(276, 30, 36, 36, 8);
  fill(0);
  text("-", 276 + 18, 30 + 18);
  textAlign(LEFT, BASELINE);
}

function drawBrushSizeUI() {
  fill(0);
  textSize(16);
  textAlign(LEFT, CENTER);
  text("브러시 크기: " + brushSize, 330, 48);
  // 브러시 미리보기
  noStroke();
  fill(100);
  ellipse(420, 48, brushSize, brushSize);
}

function mousePressed() {
  // 초기화 버튼 클릭
  if (mouseX > 30 && mouseX < 110 && mouseY > 30 && mouseY < 66) {
    background(255);
    return;
  }
  // 지우개 버튼 클릭
  if (mouseX > 130 && mouseX < 210 && mouseY > 30 && mouseY < 66) {
    eraserMode = !eraserMode;
    return;
  }
  // 브러시 크기 + 버튼
  if (mouseX > 230 && mouseX < 266 && mouseY > 30 && mouseY < 66) {
    brushSize = min(brushSize + 2, 100);
    return;
  }
  // 브러시 크기 - 버튼
  if (mouseX > 276 && mouseX < 312 && mouseY > 30 && mouseY < 66) {
    brushSize = max(brushSize - 2, 2);
    return;
  }
  // 컬러휠 클릭
  let d = dist(mouseX, mouseY, paletteCenter.x, paletteCenter.y);
  if (d < paletteRadius) {
    let dx = mouseX - paletteCenter.x;
    let dy = mouseY - paletteCenter.y;
    let angle = atan2(dy, dx);
    if (angle < 0) angle += TWO_PI;
    let hue = degrees(angle);
    let sat = constrain(map(dist(mouseX, mouseY, paletteCenter.x, paletteCenter.y), 0, paletteRadius, 20, 100), 20, 100);
    colorMode(HSB);
    selectedColor = color(hue, sat, 100);
    colorMode(RGB);
    transformedColor = simulateColorBlindness(selectedColor, colorBlindType);
    eraserMode = false;
  }
}

function mouseDragged() {
    let d = dist(mouseX, mouseY, paletteCenter.x, paletteCenter.y);
    if (
      ((mouseY > 0 && mouseY < 80) && (mouseX > 30 && mouseX < 312)) ||
      (d < paletteRadius + 30)
    ) return;
  
    strokeWeight(brushSize);
    stroke(eraserMode ? 255 : transformedColor);
    line(pmouseX, pmouseY, mouseX, mouseY); // ← 선으로 연결
  }

function simulateColorBlindness(c, type) {
  colorMode(RGB);
  let r = red(c) / 255;
  let g = green(c) / 255;
  let b = blue(c) / 255;
  let m = colorBlindMatrices[type];
  let r2 = r * m[0] + g * m[1] + b * m[2];
  let g2 = r * m[3] + g * m[4] + b * m[5];
  let b2 = r * m[6] + g * m[7] + b * m[8];
  return color(constrain(r2 * 255, 0, 255), constrain(g2 * 255, 0, 255), constrain(b2 * 255, 0, 255));
}
