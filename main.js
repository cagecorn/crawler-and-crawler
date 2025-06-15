// main.js

import { assetLoader, renderGame, updateTileSize } from './canvasRenderer.js';
// ui.js와 mechanics.js의 경로가 src 폴더 안이라면 './src/ui.js' 와 같이 수정해주세요.
import { updateStats, updateInventoryDisplay, updateMercenaryDisplay, updateSkillDisplay, updateMaterialsDisplay, showMonsterDetails, showMercenaryDetails } from './src/ui.js';
import {
    gameState, startGame, processTurn, movePlayer,
    skill1Action, skill2Action, meleeAttackAction, rangedAction, healAction,
    recallMercenaries, pickUpAction,
    findPath, autoMoveStep,
    saveGame, loadGame
} from './src/mechanics.js';

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
    // 게임의 내부 해상도를 고정합니다. 16:9 비율의 해상도를 추천합니다.
    const internalWidth = 480;
    const internalHeight = 270;

    // 캔버스의 실제 해상도를 이 값으로 고정합니다.
    canvas.width = internalWidth;
    canvas.height = internalHeight;

    // 이전에 적용했을 수 있는 모든 변환(transform)을 초기화합니다.
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 이미지 스무딩은 계속 비활성화 상태를 유지합니다.
    ctx.imageSmoothingEnabled = false;

    // CSS가 캔버스를 화면에 맞게 확대/축소하므로, 타일 크기는 내부 해상도 기준으로 계산합니다.
    updateTileSize(internalWidth, internalHeight);

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
