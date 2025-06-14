// main.js

import { assetLoader, renderGame } from './canvasRenderer.js';
import { gameState, startGame, processTurn, movePlayer, useSkill /* 필요한 모든 함수 임포트 */ } from './mechanics.js';

// 1. 전역 변수 설정
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let gameImages = {};

// 2. 메인 게임 루프
function gameLoop() {
    // 1초에 60번, 부드럽게 화면을 새로 그립니다.
    renderGame(canvas, ctx, gameImages, gameState);
    requestAnimationFrame(gameLoop);
}

// 3. 게임 시작점
window.onload = () => {
    // 모든 이미지 리소스를 불러옵니다.
    assetLoader.load((loadedImages) => {
        gameImages = loadedImages;
        console.log("모든 이미지 로딩 완료!");

        // 로딩이 끝나면 게임 로직을 시작합니다.
        startGame(); 

        // 렌더링 루프를 시작합니다.
        gameLoop(); 

        // 모든 사용자 입력(이벤트 리스너)을 여기에 설정합니다.
        document.addEventListener('keydown', (e) => {
            e.preventDefault(); // 스크롤 등 기본 동작 방지
            switch (e.key) {
                case 'ArrowUp': movePlayer(0, -1); break;
                case 'ArrowDown': movePlayer(0, 1); break;
                case 'ArrowLeft': movePlayer(-1, 0); break;
                case 'ArrowRight': movePlayer(1, 0); break;
                // 기타 키보드 입력...
            }
        });
    });
};
