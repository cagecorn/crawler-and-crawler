// main.js

import { assetLoader, renderGame } from './canvasRenderer.js';
// 'ui.js' 파일이 src 폴더 안에 있다면 경로를 수정해주세요. 예: './src/ui.js'
import { updateStats, updateInventoryDisplay, updateMercenaryDisplay, updateSkillDisplay, updateMaterialsDisplay } from './src/ui.js';
// mechanics.js도 마찬가지로 src 폴더 안에 있다면 경로를 수정해주세요.
import { gameState, startGame, processTurn, movePlayer, useSkill, saveGame, loadGame } from './src/mechanics.js';

// --- UI 요소 가져오기 ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let gameImages = {};

const modalOverlay = document.getElementById('modal-overlay');
const menuButtons = document.querySelectorAll('.menu-btn');
const closeButtons = document.querySelectorAll('.close-btn');

// --- [추가] 캔버스 크기 조절 함수 ---
function resizeCanvas() {
    // 캔버스의 실제 해상도를 현재 보이는 창의 크기와 일치시킵니다.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
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
