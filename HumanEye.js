// Three.js 기본 씬 생성
const scene = new THREE.Scene();

// 화면 비율 계산 (반응형 대응)
const aspect = window.innerWidth / window.innerHeight;

// 2D 효과를 위한 직교 투영 카메라 설정 (좌/우/상/하, near/far)
const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
camera.position.z = 1; // 카메라 위치 설정

// WebGL 렌더러 초기화 (안티앨리어싱 적용)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('threeContainer').appendChild(renderer.domElement); // DOM에 렌더러 추가

// 셰이더 전용 변수들
const uniforms = {
  uTime: { value: 0 }, // 시간 흐름 추적
  uClickPos: { value: new THREE.Vector2(0.5, 0.5) }, // 클릭 위치 저장 (정규화 좌표)
  uClickTime: { value: -100.0 }, // 클릭 시간 기록 (초기값 -100으로 설정)
  uTexture: { value: null } // 눈동자 텍스처
};

// 텍스처 로더로 눈동자 이미지 불러오기
const loader = new THREE.TextureLoader();
loader.load('iris.png', texture => {
  // 텍스처 래핑 및 필터링 설정
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  uniforms.uTexture.value = texture; // 셰이더에 텍스처 전달

  // 동공 메시 크기 계산 (화면 비율 보정)
  const planeWidth = 0.55 * 2 * aspect;
  const planeHeight = 0.65 * 2;

  // 평면 지오메트리 생성
  const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

  // 커스텀 셰이더 머티리얼 정의
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: ` // UV 좌표 전달
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: ` // 파동 효과 계산
      precision mediump float;
      uniform float uTime;
      uniform vec2 uClickPos;
      uniform float uClickTime;
      uniform sampler2D uTexture;
      varying vec2 vUv;

      void main() {
        // 파동 계산
        float elapsed = uTime - uClickTime; // 경과 시간
        float dist = distance(vUv, uClickPos); // 클릭 지점과의 거리
        float ripple = sin(dist * 40.0 - elapsed * 5.0) // 사인 파형 생성
                     * exp(-6.0 * dist) // 거리 감쇠
                     * exp(-elapsed * 1.0); // 시간 감쇠
        ripple *= step(0.0, elapsed); // 클릭 이후에만 효과 적용

        // UV 좌표 왜곡 계산
        vec2 uv = vUv + normalize(vUv - uClickPos) * ripple * 0.03;

        // 비네팅 효과 (가장자리 어둡게)
        float vignette = smoothstep(0.8, 0.4, distance(vUv, vec2(0.5)));
        vec3 base = texture2D(uTexture, uv).rgb * vignette;
        gl_FragColor = vec4(base, 1.0);
      }
    `
  });

  // 메시 생성 및 씬 추가
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // 클릭/터치 이벤트 핸들러
  function triggerRipple(e) {
    // 화면 좌표 정규화 (0~1 범위)
    const x = (e.clientX || e.touches?.[0]?.clientX) / window.innerWidth;
    const y = 1.0 - (e.clientY || e.touches?.[0]?.clientY) / window.innerHeight;
    
    // 셰이더 변수 업데이트
    uniforms.uClickPos.value.set(x, y);
    uniforms.uClickTime.value = uniforms.uTime.value;

    // 최초 클릭 시 UI 전환
    if (!window.hasTriggered) {
      window.hasTriggered = true;
      setTimeout(() => {
        document.getElementById('overlayText').style.display = 'none';
        document.getElementById('nextContainer').style.display = 'flex';
      }, 1200);
    }
  }

  // 이벤트 리스너 등록
  window.addEventListener("click", triggerRipple);
  window.addEventListener("touchstart", triggerRipple);

  // 애니메이션 루프 시작
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    uniforms.uTime.value = clock.getElapsedTime(); // 시간 업데이트
    renderer.render(scene, camera); 
  }
  animate();
});

// 창 크기 변경 핸들러
window.addEventListener('resize', () => {
  const newAspect = window.innerWidth / window.innerHeight;
  camera.left = -newAspect; // 새로운 왼쪽 경계
  camera.right = newAspect; // 새로운 오른쪽 경계
  camera.updateProjectionMatrix(); // 카메라 설정 갱신
  renderer.setSize(window.innerWidth, window.innerHeight); // 렌더러 크기 조정
});

// 정보 모달 제어
document.getElementById("infoIcon").addEventListener("click", () => {
  document.getElementById("infoModal").style.display = "flex";
});
function closeInfo() {
  document.getElementById("infoModal").style.display = "none";
}

// 페이지 전환 효과
document.getElementById("transitionPopup").addEventListener("click", () => {
  document.body.classList.add("fade-out"); // 페이드 아웃 클래스 추가
  setTimeout(() => {
    window.location.href = "ColorBlind2.html"; // 1초 후 페이지 이동
  }, 1000);
});
