// main.js

import { assetLoader, renderGame } from './canvasRenderer.js';
import { gameState, startGame, processTurn, movePlayer, useSkill, saveGame, loadGame } from './src/mechanics.js';
import { updateStats, updateInventoryDisplay, updateMercenaryDisplay, updateSkillDisplay, updateMaterialsDisplay } from './src/ui.js';

// --- UI 요소 가져오기 ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let gameImages = {};

const modalOverlay = document.getElementById('modal-overlay');
const menuButtons = document.querySelectorAll('.menu-btn');
const closeButtons = document.querySelectorAll('.close-btn');

// --- [추가] 캔버스 크기 조절 함수 ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // 리사이즈 후 즉시 다시 그려서 빈 화면이 보이지 않게 함
    if (window.isGameReady) {
        renderGame(canvas, ctx, gameImages, gameState);
    }
}

// 브라우저 창 크기가 바뀔 때마다 캔버스 크기도 조절
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
    
    if(panelId === 'stats-panel') updateStats();
    if(panelId === 'inventory-panel') updateInventoryDisplay();
    if(panelId === 'mercenary-panel') updateMercenaryDisplay();
    if(panelId === 'skills-panel') updateSkillDisplay();
    if(panelId === 'materials-panel') updateMaterialsDisplay();

    modalOverlay.classList.remove('hidden');
    document.getElementById(panelId).classList.add('active');
}

// --- 이벤트 리스너 ---
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
    if (gameState.gameRunning) {
        // 게임 로직 업데이트 (필요 시)
    }
    renderGame(canvas, ctx, gameImages, gameState);
    requestAnimationFrame(gameLoop);
}

// --- 게임 시작점 ---
window.isGameReady = false; // 게임 준비 완료 플래그
window.onload = () => {
    resizeCanvas(); // [추가] 최초 실행 시 캔버스 크기 설정

    assetLoader.load((loadedImages) => {
        gameImages = loadedImages;
        console.log("모든 이미지 로딩 완료!");

        startGame(); 
        
        window.isGameReady = true; // 게임 로직 및 렌더링 준비 완료
        gameLoop();  

        // 키보드 입력 처리
        document.addEventListener('keydown', (e) => {
            if (!gameState.gameRunning) return; // 모달이 열려있으면 입력 무시
            
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
