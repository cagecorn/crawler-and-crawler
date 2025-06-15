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
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    // CSS 크기를 먼저 설정해 비율을 고정합니다.
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    // 해상도는 실제 픽셀 수에 맞춰 조정합니다.
    canvas.width = Math.floor(displayWidth * dpr);
    canvas.height = Math.floor(displayHeight * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    updateTileSize(displayWidth, displayHeight);

    // 리사이즈 후 즉시 다시 그려서 빈 화면이 보이지 않게 합니다.
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
