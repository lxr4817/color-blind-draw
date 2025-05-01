let canvasW, canvasH;
let paletteRadius = 130;
let paletteRotation = 0;
let paletteCenter;
let selectedColor;
let transformedColor;
let eraserMode = false;
let brushSize = 15;
let showRealColor = false; // 필터 ON/OFF 상태

let realCanvas; // 실제 컬러로 그리는 레이어
let paletteGraphics; // 팔레트 전용 그래픽 레이어

function setup() {
    canvasW = windowWidth;
    canvasH = windowHeight;
    createCanvas(canvasW, canvasH);
    realCanvas = createGraphics(canvasW, canvasH);
    realCanvas.background(255);
  
    paletteCenter = createVector(canvasW - paletteRadius - 30, paletteRadius + 30); 
  
    paletteGraphics = createGraphics(canvasW, canvasH);
    paletteRotation = random(TWO_PI);
    drawPaletteToGraphics(); // ← 그 다음 호출
  
    frameRate(60);
    selectedColor = color(255, 0, 0);
    transformedColor = selectedColor;
  }

function draw() {
  background(255);

  // 그림 영역 처리
  if (showRealColor) {
    image(realCanvas, 0, 0);
    image(paletteGraphics, 0, 0);
  } else {
    let filteredCanvas = realCanvas.get();
    filteredCanvas.filter(GRAY);
    image(filteredCanvas, 0, 0);

    let filteredPalette = paletteGraphics.get();
    filteredPalette.filter(GRAY);
    image(filteredPalette, 0, 0);
  }

  drawSelectedColorIndicator();
  drawButtons();
  drawBrushSizeUI();
  drawFilterToggleButton();
}

function drawPaletteToGraphics() {
    paletteGraphics.clear();
    paletteGraphics.colorMode(HSB);
    let steps = 360;
    paletteGraphics.push();
    paletteGraphics.translate(paletteCenter.x, paletteCenter.y);
    paletteGraphics.rotate(paletteRotation); //팔레트 랜덤 로테이트
    for (let i = 0; i < steps; i++) {
      let angle = map(i, 0, steps, 0, TWO_PI);
      for (let r = 0; r < paletteRadius; r += 2) {
        let hue = i % 360;
        let saturation = map(r, 0, paletteRadius, 20, 100);
        let x = cos(angle) * r;
        let y = sin(angle) * r;
        paletteGraphics.fill(hue, saturation, 100);
        paletteGraphics.noStroke();
        paletteGraphics.circle(x, y, 4);
      }
    }
    paletteGraphics.pop();
    paletteGraphics.colorMode(RGB);
  }
  

function drawSelectedColorIndicator() {
  if (!showRealColor) return;
  stroke(0);
  strokeWeight(2);
  fill(selectedColor);
  circle(paletteCenter.x - paletteRadius - 20, paletteCenter.y, 30);
  noStroke();
}

function drawButtons() {
  fill(230);
  rect(30, 30, 80, 36, 8);
  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text("초기화", 70, 48);

  fill(eraserMode ? color(200, 220, 255) : 230);
  rect(130, 30, 80, 36, 8);
  fill(0);
  text("지우개", 170, 48);

  fill(220);
  rect(230, 30, 36, 36, 8);
  fill(0);
  textSize(24);
  text("+", 248, 48);

  fill(220);
  rect(276, 30, 36, 36, 8);
  fill(0);
  text("-", 294, 48);
}

function drawFilterToggleButton() {
  fill(showRealColor ? color(180, 250, 180) : 230);
  rect(330, 30, 100, 36, 8);
  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(showRealColor ? "필터 OFF" : "필터 ON", 380, 48);
}

function drawBrushSizeUI() {
  fill(0);
  textSize(16);
  textAlign(LEFT, CENTER);
  text("브러시 크기: " + brushSize, 450, 48);
  noStroke();
  fill(100);
  ellipse(580, 48, brushSize, brushSize);
}

function mousePressed() {
  if (mouseY > 30 && mouseY < 66) {
    if (mouseX > 30 && mouseX < 110) {
      realCanvas.background(255);
      return;
    } else if (mouseX > 130 && mouseX < 210) {
      eraserMode = !eraserMode;
      return;
    } else if (mouseX > 230 && mouseX < 266) {
      brushSize = min(brushSize + 2, 100);
      return;
    } else if (mouseX > 276 && mouseX < 312) {
      brushSize = max(brushSize - 2, 2);
      return;
    } else if (mouseX > 330 && mouseX < 430) {
      showRealColor = !showRealColor;
      return;
    }
    }
    let d = dist(mouseX, mouseY, paletteCenter.x, paletteCenter.y);
    if (d < paletteRadius) {
        let dx = mouseX - paletteCenter.x;
        let dy = mouseY - paletteCenter.y;
    
        let angle = atan2(dy, dx) - paletteRotation;
        if (angle < 0) angle += TWO_PI;
    
        let hue = degrees(angle);
        let sat = constrain(map(d, 0, paletteRadius, 20, 100), 20, 100);
    
        colorMode(HSB);
        selectedColor = color(hue, sat, 100);
        colorMode(RGB);
    
        transformedColor = selectedColor;
        eraserMode = false;
    }
}

function mouseDragged() {
  let d = dist(mouseX, mouseY, paletteCenter.x, paletteCenter.y);
  if ((mouseY > 0 && mouseY < 80 && mouseX > 30 && mouseX < 440) || d < paletteRadius + 30) return;

  realCanvas.strokeWeight(brushSize);
  realCanvas.stroke(eraserMode ? 255 : selectedColor);
  realCanvas.line(pmouseX, pmouseY, mouseX, mouseY);
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    showRealColor = !showRealColor;
  }
}

function touchStarted() {
  mousePressed();
  return false;
}

function touchMoved() {
  mouseDragged();
  return false;
}