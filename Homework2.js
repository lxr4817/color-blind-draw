/*시인 이상의 『건축무한육면각체』에서 착안하였으며,
반복되는 육면체 구조로 무한성을 시각적으로 표현하고자 하였습니다.*/

let cubeCount = 5;
let layers = 10;

function preload() {
    font = loadFont('ChosunCentennial_ttf.ttf');
  }

function setup() {
  createCanvas(800, 800, WEBGL);
  angleMode(DEGREES);
  noFill();
  textFont(font);
}

function draw() {
  background(10);
  rotateX(sin(frameCount * 0.3) * 20);
  rotateY(cos(frameCount * 0.2) * 20);

  for (let i = 0; i < layers; i++) {
    for (let j = 0; j < cubeCount; j++) {
      let t = map(j, 0, cubeCount, 0, 1);
      let baseSize = map(sin(frameCount + j * 10 + i * 20), -1, 1, 50, 200);
      let alpha = map(j + i, 0, cubeCount + layers, 255, 10);

      push();
      rotateZ(frameCount * 0.1 + j * 5 + i * 2);
      rotateY(j * 10 + i * 5);
      stroke(255, alpha);

      // 정육면체를 점진적으로 위아래로 배치
      translate(0, (i - layers / 2) * 20, 0);
      box(baseSize);
      pop();
    }
  }

  // Text 요소
  push();
  rotateY(0);
  rotateX(0);
  translate(0, 300, 0);
  fill(255, 50);
  noStroke();
  textAlign(CENTER);
  textSize(24);
  text("건축무한육면각체", 0, 0);
  pop();
}
