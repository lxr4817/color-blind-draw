// 전역 변수 선언
let canvasW, canvasH; // 캔버스 크기
let paletteRadius = 130; // 색상 팔레트 반지름
let paletteRotation = 0; // 팔레트 회전 각도
let paletteCenter; // 팔레트 중심 좌표
let selectedColor; // 선택된 색상
let transformedColor; // 변환된 색상(미사용)
let eraserMode = false; // 지우개 모드 플래그
let brushSize = 15; // 브러시 크기
let showRealColor = false; // 실제 색상 표시 여부

// 그래픽 버퍼
let realCanvas; // 실제 드로잉이 저장되는 그래픽 버퍼
let paletteGraphics; // 색상 팔레트 그래픽 버퍼

function setup() {
  // 캔버스 크기 설정 (최대 1800x1000)
  canvasW = min(windowWidth, 1800);
  canvasH = min(windowHeight, 1000);
  let cnv = createCanvas(canvasW, canvasH);
  cnv.parent("canvas-container");

  // 실제 드로잉 버퍼 초기화
  realCanvas = createGraphics(canvasW, canvasH);
  realCanvas.background(255);

  // 색상 팔레트 초기 설정
  paletteCenter = createVector(canvasW - paletteRadius - 40, paletteRadius + 40);
  paletteGraphics = createGraphics(canvasW, canvasH);
  paletteRotation = random(TWO_PI); // 무작위 회전 각도 설정
  drawPaletteToGraphics(); // 팔레트 그래픽 생성

  // 기본 설정
  frameRate(60);
  selectedColor = color(255, 0, 0); // 초기 색상 설정(빨강)
  transformedColor = selectedColor;

  loop();
  bindUIEvents(); // UI 이벤트 바인딩
  updateBrushDisplay(); // 브러시 크기 표시 업데이트
}

function draw() {
  background(255);

  // 실제 색상 표시 모드
  if (showRealColor) {
    image(realCanvas, 0, 0); // 실제 드로잉 표시
    image(paletteGraphics, 0, 0); // 실제 팔레트 표시
  } 
  // 그레이스케일 필터 모드
  else {
    let filteredCanvas = realCanvas.get();
    filteredCanvas.filter(GRAY); // 그레이스케일 필터 적용
    image(filteredCanvas, 0, 0);

    let filteredPalette = paletteGraphics.get();
    filteredPalette.filter(GRAY); // 팔레트도 그레이스케일
    image(filteredPalette, 0, 0);
  }

  drawSelectedColorIndicator(); // 선택 색상 표시기
}

// 색상 팔레트 생성 함수
function drawPaletteToGraphics() {
  paletteGraphics.clear();
  paletteGraphics.colorMode(HSB); // HSB 색공간 사용
  let steps = 360; // 360도 전체 색상
  
  paletteGraphics.push();
  paletteGraphics.translate(paletteCenter.x, paletteCenter.y);
  paletteGraphics.rotate(paletteRotation);
  
  // 반경별 색상 링 생성
  for (let i = 0; i < steps; i++) {
    let angle = map(i, 0, steps, 0, TWO_PI);
    for (let r = 0; r < paletteRadius; r += 2) {
      let hue = i % 360; // 색상 각도
      let saturation = map(r, 0, paletteRadius, 20, 100); // 반경에 따른 채도 변화
      let x = cos(angle) * r;
      let y = sin(angle) * r;
      paletteGraphics.fill(hue, saturation, 100);
      paletteGraphics.noStroke();
      paletteGraphics.circle(x, y, 4); // 작은 원으로 색상 표시
    }
  }
  paletteGraphics.pop();
  paletteGraphics.colorMode(RGB); // RGB 모드로 복원
}

// 선택 색상 표시기
function drawSelectedColorIndicator() {
  if (!showRealColor) return;
  stroke(0);
  strokeWeight(2);
  fill(selectedColor);
  circle(paletteCenter.x - paletteRadius - 20, paletteCenter.y, 30); // 팔레트 왼쪽에 원형 표시
  noStroke();
}

// 마우스 클릭 이벤트 (색상 선택)
function mousePressed() {
  let d = dist(mouseX, mouseY, paletteCenter.x, paletteCenter.y);
  if (d < paletteRadius) {
    // 각도 계산 (팔레트 회전 보정)
    let dx = mouseX - paletteCenter.x;
    let dy = mouseY - paletteCenter.y;
    let angle = atan2(dy, dx) - paletteRotation;
    if (angle < 0) angle += TWO_PI;

    // HSB 색상 계산
    let hue = degrees(angle);
    let sat = constrain(map(d, 0, paletteRadius, 20, 100), 20, 100);

    colorMode(HSB);
    selectedColor = color(hue, sat, 100); // 최대 밝기(100%)
    colorMode(RGB);

    transformedColor = selectedColor;
    eraserMode = false; // 색상 선택 시 지우개 모드 해제
    document.getElementById("eraserBtn")?.classList.remove("active");
  }
}

// 드래그 시 드로잉
function mouseDragged() {
  // UI 영역이나 팔레트 근처에서는 드로잉 금지
  let d = dist(mouseX, mouseY, paletteCenter.x, paletteCenter.y);
  if ((mouseY > 0 && mouseY < 80 && mouseX > 30 && mouseX < 440) || d < paletteRadius + 30) return;

  realCanvas.strokeWeight(brushSize);
  realCanvas.stroke(eraserMode ? 255 : selectedColor); // 지우개 모드시 흰색
  realCanvas.line(pmouseX, pmouseY, mouseX, mouseY); // 선 그리기
}

// 터치 이벤트 처리
function touchStarted() {
  mousePressed();
  return false;
}

function touchMoved() {
  mouseDragged();
  return false;
}

// 창 크기 변경 핸들러
function windowResized() {
  canvasW = min(windowWidth, 1800);
  canvasH = min(windowHeight, 1000);
  resizeCanvas(canvasW, canvasH);
  // 모든 그래픽 버퍼 리셋
  realCanvas = createGraphics(canvasW, canvasH);
  realCanvas.background(255);
  paletteCenter = createVector(canvasW - paletteRadius - 40, paletteRadius + 40);
  paletteGraphics = createGraphics(canvasW, canvasH);
  drawPaletteToGraphics();
}

// 브러시 크기 표시 업데이트
function updateBrushDisplay() {
  const display = document.getElementById("brushDisplay");
  if (display) {
    display.style.width = `${brushSize}px`;
    display.style.height = `${brushSize}px`;
  }
}

// UI 이벤트 바인딩
function bindUIEvents() {
  const resetBtn = document.getElementById("resetBtn");
  const eraserBtn = document.getElementById("eraserBtn");
  const increaseBtn = document.getElementById("increaseBtn");
  const decreaseBtn = document.getElementById("decreaseBtn");
  const filterToggleBtn = document.getElementById("filterToggleBtn");
  const finishBtn = document.getElementById("finishBtn");
  const guideMessage = document.getElementById("guideMessage");
  const introBtn = document.getElementById("introBtn");

  resetBtn?.addEventListener("click", () => {
    realCanvas.background(255); // 캔버스 리셋
  });

  eraserBtn?.addEventListener("click", () => {
    eraserMode = !eraserMode; // 지우개 모드 토글
    eraserBtn.classList.toggle("active", eraserMode);
  });

  increaseBtn?.addEventListener("click", () => {
    brushSize = Math.min(brushSize + 2, 100); // 브러시 크기 증가
    updateBrushDisplay();
  });

  decreaseBtn?.addEventListener("click", () => {
    brushSize = Math.max(brushSize - 2, 2); // 브러시 크기 감소
    updateBrushDisplay();
  });

  filterToggleBtn?.addEventListener("click", () => {
    showRealColor = !showRealColor; // 필터 모드 토글
    filterToggleBtn.innerText = showRealColor ? "Filter OFF" : "Filter ON";
  });

  finishBtn?.addEventListener("click", () => {
    showRealColor = true; // 실제 색상 강제 표시
    filterToggleBtn.innerText = "Filter OFF";
    guideMessage.style.display = "block"; // 안내 메시지 표시
    setTimeout(() => {
      guideMessage.style.display = "none";
    }, 8000);
  });

  introBtn?.addEventListener("click", () => {
    document.body.classList.add("fade-out"); // 페이드 아웃 클래스 추가
    setTimeout(() => {
      window.location.href = "ColorBlind1.html"; // 1초 후 페이지 이동
    }, 1000);
  });
}
