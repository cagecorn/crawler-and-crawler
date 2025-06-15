// main.js

import { assetLoader, renderGame, updateTileSize } from './canvasRenderer.js';
// 'ui.js' 파일이 src 폴더 안에 있다면 경로를 수정해주세요. 예: './src/ui.js'
import './src/ui.js';

// `ui.js` attaches its helper functions to the global `window` object. Read them
// from there instead of using ES module exports.
const { updateStats, updateInventoryDisplay, updateMercenaryDisplay, updateSkillDisplay, updateMaterialsDisplay } = window;
// mechanics.js도 마찬가지로 src 폴더 안에 있다면 경로를 수정해주세요.
// mechanics.js에서 전역(window)으로 노출된 객체와 함수를 사용합니다.
const { gameState, startGame, movePlayer, saveGame, loadGame } = window;

// --- UI 요소 가져오기 ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
// 이미지 스무딩(안티에일리어싱) 기능을 끕니다.
ctx.imageSmoothingEnabled = false;
let gameImages = {};

const modalOverlay = document.getElementById('modal-overlay');
const menuButtons = document.querySelectorAll('.menu-btn');
const closeButtons = document.querySelectorAll('.close-btn');

// --- [추가] 캔버스 크기 조절 함수 ---
function resizeCanvas() {
    const container = document.getElementById('game-container');
    const displayWidth = container.clientWidth;
    const displayHeight = container.clientHeight;

    // DPR(Device Pixel Ratio)는 1로 고정해서 픽셀 완벽을 유지합니다
    // 고해상도 화면에서도 도트가 선명하게 보이도록 하는 설정입니다
    const dpr = 1; // window.devicePixelRatio 대신 1로 고정

    // CSS 크기를 먼저 설정
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    // 실제 캔버스 해상도를 정수로 설정 (소수점 방지)
    canvas.width = Math.floor(displayWidth);
    canvas.height = Math.floor(displayHeight);

    // 컨텍스트 변환 설정 (픽셀 완벽을 위해)
    ctx.setTransform(1, 0, 0, 1, 0, 0); // dpr 대신 1 사용
    
    // 이미지 스무딩 끄기 (여러 브라우저 대응)
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.oImageSmoothingEnabled = false;

    // 타일 크기 업데이트
    updateTileSize(displayWidth, displayHeight);

    // 리사이즈 후 즉시 다시 그리기
    if (window.isGameReady) {
        renderGame(canvas, ctx, gameImages, gameState);
    }
}

// 브라우저 창 크기가 바뀔 때마다 캔버스 크기도 자동으로 조절합니다.
window.addEventListener('resize', resizeCanvas);


// --- 모달 제어 함수 ---
function hideAllModals() {
    modalOverlay.classList.add('hidden');
    document.querySelectorAll('.modal-panel').forEach(p => p.classList.remove('active'));
    gameState.gameRunning = true;
}

function showModal(panelId) {
    hideAllModals();
    gameState.gameRunning = false;
    
    // 각 패널에 맞는 UI 업데이트 함수 호출
    if(panelId === 'stats-panel') updateStats();
    if(panelId === 'inventory-panel') updateInventoryDisplay();
    if(panelId === 'mercenary-panel') updateMercenaryDisplay();
    if(panelId === 'skills-panel') updateSkillDisplay();
    if(panelId === 'materials-panel') updateMaterialsDisplay();

    modalOverlay.classList.remove('hidden');
    document.getElementById(panelId).classList.add('active');
}


// --- 이벤트 리스너 설정 ---
menuButtons.forEach(button => {
    button.addEventListener('click', () => {
        const panelId = button.dataset.panelId;
        showModal(panelId);
    });
});

closeButtons.forEach(button => {
    button.addEventListener('click', hideAllModals);
});

// `game-options-panel` 내부 버튼 이벤트 리스너들
document.getElementById('save-game').addEventListener('click', saveGame);
document.getElementById('load-game').addEventListener('click', () => {
    loadGame();
    hideAllModals();
});
document.getElementById('new-game').addEventListener('click', () => {
    if (confirm('새 게임을 시작하시겠습니까? 현재 진행상황은 사라집니다.')) {
        location.reload();
    }
});


// --- 메인 게임 루프 ---
function gameLoop() {
    renderGame(canvas, ctx, gameImages, gameState);
    requestAnimationFrame(gameLoop);
}


// --- 게임 시작점 ---
window.isGameReady = false; // 게임 준비 완료 플래그
window.onload = () => {
    resizeCanvas(); // [추가] 최초 실행 시 캔버스 크기를 먼저 설정합니다.

    assetLoader.load((loadedImages) => {
        gameImages = loadedImages;
        console.log("모든 이미지 로딩 완료!");

        startGame(); 
        
        window.isGameReady = true; 
        gameLoop();  

        // 키보드 입력 처리
        document.addEventListener('keydown', (e) => {
            if (!gameState.gameRunning) return; 
            
            e.preventDefault();
            switch (e.key) {
                case 'ArrowUp': movePlayer(0, -1); break;
                case 'ArrowDown': movePlayer(0, 1); break;
                case 'ArrowLeft': movePlayer(-1, 0); break;
                case 'ArrowRight': movePlayer(1, 0); break;
                // 기타 필요한 단축키 추가...
            }
        });
    });
};
