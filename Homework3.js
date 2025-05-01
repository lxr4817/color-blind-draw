class Pearl {
    constructor(x, y, r) {
      this.x = x;
      this.y = y;
      this.r = r;
      this.vx = random(-1, 1);
      this.vy = random(-1, 1);
    }
  
    move() {
      this.x += this.vx;
      this.y += this.vy;
  
      // 컵 벽과 반사
      if (this.x < 200 || this.x > 400) this.vx *= -1;
      if (this.y < 200 || this.y > 500) this.vy *= -1;
    }
  
    display() {
      fill(50, 30, 30);
      noStroke();
      ellipse(this.x, this.y, this.r);
    }
  }

  class Ice {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.vx = random(-0.5, 0.5);
      this.vy = random(-0.5, 0.5);
    }
  
    move() {
      this.x += this.vx;
      this.y += this.vy;
  
      if (this.x < 205 || this.x > 395) this.vx *= -1;
      if (this.y < 205 || this.y > 350) this.vy *= -1;
    }
  
    display() {
      noStroke();
      fill(200, 240, 255, 150);
      rect(this.x, this.y, this.w, this.h, 5);
    }
  }

  function drawBackground() {
    background(245, 240, 230); // 따뜻한 카페 톤
  
    // 바닥
    fill(220, 200, 180);
    rect(0, 450, width, 150);
  
    // 벽에 액자 느낌
    fill(255);
    stroke(160);
    rect(50, 50, 100, 80);
    rect(450, 80, 80, 60);
  }

  
  let pearls = [];
  let ices = [];
  
  function setup() {
    createCanvas(600, 600);
  
    // 펄 추가
    for (let i = 0; i < 25; i++) {
      pearls.push(new Pearl(random(220, 380), random(370, 490), random(10, 14)));
    }
  
    // 얼음 추가
    for (let i = 0; i < 5; i++) {
      ices.push(new Ice(random(220, 380), random(220, 300), 25, 15));
    }
  }
  
  function draw() {
    drawBackground(); // 공원 or 카페 느낌
  
    // 컵
    fill(255, 230, 200, 200);
    stroke(180);
    rect(200, 200, 200, 300, 20);
  
    // 얼음
    for (let i of ices) {
      i.move();
      i.display();
    }
  
    // 펄
    for (let p of pearls) {
      p.move();
      p.display();
    }
  }
  