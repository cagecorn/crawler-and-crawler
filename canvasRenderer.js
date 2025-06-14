// canvasRenderer.js

// 이미지 로딩을 위한 객체
export const assetLoader = {
    images: {},
    imageSources: {
        // Player & Mercenaries
        player: 'assets/images/player.png',
        warrior: 'assets/images/warrior.png',
        archer: 'assets/images/archer.png',
        healer: 'assets/images/healer.png',
        wizard: 'assets/images/wizard.png',
        bard: 'assets/images/bard.png',
        paladin: 'assets/images/paladin.png',

        // Monsters
        zombie: 'assets/images/zombie.png',
        goblin: 'assets/images/goblin.png',
        goblin_archer: 'assets/images/goblin-archer.png',
        goblin_wizard: 'assets/images/goblin-wizard.png',
        orc: 'assets/images/orc.png',
        orc_archer: 'assets/images/orc_archer.png',
        skeleton: 'assets/images/skeleton.png',
        skeleton_mage: 'assets/images/skeleton_mage.png',
        troll: 'assets/images/troll.png',
        dark_mage: 'assets/images/dark_mage.png',
        dark_knight: 'assets/images/dark_knight.png',
        demon_warrior: 'assets/images/demon_warrior.png',
        slime: 'assets/images/slime.png',
        kobold: 'assets/images/kobold.png',
        gargoyle: 'assets/images/gargoyle.png',
        banshee: 'assets/images/banshee.png',
        minotaur: 'assets/images/minotaur.png',
        lich: 'assets/images/lich.png',
        dragon_whelp: 'assets/images/dragon_whelp.png',
        elemental_golem: 'assets/images/elemental_golem.png',
        boss: 'assets/images/boss.png',

        // Tiles & Objects
        floor: 'assets/images/floor-tile.png',
        wall: 'assets/images/wall-tile.png',
        chest: 'assets/images/chest.png',
        corpse: 'assets/images/corpse.png',
        gold: 'assets/images/gold.png',

        // Items
        shortsword: 'assets/images/shortsword.png',
        bow: 'assets/images/bow.png',
        leatherarmor: 'assets/images/leatherarmor.png',

        // Effects
        dark_nova_effect: 'assets/images/dark-nova-effect.png'
    },

    load(callback) {
        let loaded = 0;
        const numImages = Object.keys(this.imageSources).length;
        for (const key in this.imageSources) {
            this.images[key] = new Image();
            this.images[key].src = this.imageSources[key];
            this.images[key].onload = () => {
                if (++loaded >= numImages) {
                    callback(this.images); // 모든 이미지 로딩 완료 후 콜백 실행
                }
            };
        }
    }
};

const TILE_SIZE = 32; // 셀 하나의 크기

// 게임 상태를 캔버스에 그리는 메인 함수
export function renderGame(canvas, ctx, images, gameState) {
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 1. 캔버스 초기화
    ctx.imageSmoothingEnabled = false; // 픽셀 아트가 번지지 않게 설정

    // 2. 카메라 위치 계산 (플레이어 중심)
    const startX = Math.floor(gameState.player.x - (canvas.width / TILE_SIZE / 2));
    const startY = Math.floor(gameState.player.y - (canvas.height / TILE_SIZE / 2));

    // 3. 화면에 보이는 영역만 그리기
    for (let y = 0; y < canvas.height / TILE_SIZE; y++) {
        for (let x = 0; x < canvas.width / TILE_SIZE; x++) {
            const mapX = startX + x;
            const mapY = startY + y;

            const screenX = x * TILE_SIZE;
            const screenY = y * TILE_SIZE;

            // 맵 경계를 벗어나면 그리지 않음
            if (mapX < 0 || mapY < 0 || mapX >= gameState.dungeonSize || mapY >= gameState.dungeonSize) continue;

            // 안개 그리기
            if (gameState.fogOfWar[mapY]?.[mapX]) {
                 ctx.fillStyle = '#000';
                 ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                 continue;
            }

            // 바닥 또는 벽 그리기
            const cellType = gameState.dungeon[mapY][mapX];
            const tileImage = (cellType === 'wall') ? images.wall : images.floor;
            if(tileImage) ctx.drawImage(tileImage, screenX, screenY, TILE_SIZE, TILE_SIZE);

            // 아이템, 시체 등 다른 요소들 그리기...
            // (이 부분은 gameState를 확인하며 drawImage로 추가 구현)
        }
    }
    
    // 4. 유닛(몬스터, 용병, 플레이어) 그리기
    const allUnits = [...gameState.monsters, ...gameState.activeMercenaries, gameState.player];
    allUnits.forEach(unit => {
        if(!unit || (unit.health !== undefined && unit.health <= 0)) return;

        const screenX = (unit.x - startX) * TILE_SIZE;
        const screenY = (unit.y - startY) * TILE_SIZE;

        // 화면 밖에 있으면 그리지 않음
        if (screenX < -TILE_SIZE || screenX > canvas.width || screenY < -TILE_SIZE || screenY > canvas.height) return;

        let unitImage;
        if(unit === gameState.player) unitImage = images.player;
        else unitImage = images[unit.type?.toLowerCase()] || images.zombie;

        if(unitImage) ctx.drawImage(unitImage, screenX, screenY, TILE_SIZE, TILE_SIZE);

        // 체력바 그리기
        drawHealthBar(ctx, screenX, screenY, unit);
        // 효과 아이콘 그리기
        drawEffectIcons(ctx, screenX, screenY, unit);
    });
}

function drawHealthBar(ctx, x, y, unit) {
    const maxHp = getStat(unit, 'maxHealth');
    if (unit.health < maxHp) {
        const hpRatio = unit.health / maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y - 6, TILE_SIZE, 4);
        ctx.fillStyle = hpRatio > 0.5 ? '#0f0' : hpRatio > 0.25 ? '#ff0' : '#f00';
        ctx.fillRect(x, y - 6, TILE_SIZE * hpRatio, 4);
    }
}

function drawEffectIcons(ctx, x, y, unit) {
    // 이 함수는 updateUnitEffectIcons를 대체합니다.
    // 기존 로직을 가져와 ctx.fillText()를 사용해 아이콘을 그립니다.
    // 예시: ctx.fillText('💪', x, y - 10);
    // 이 부분은 게임 로직과 폰트 스타일에 맞춰 추가 구현이 필요합니다.
}

// 이 파일에서 사용될 getStat 함수 (mechanics.js에도 동일 함수가 있음)
// 모듈 시스템에서는 각 파일이 독립적이므로, 필요 함수를 가져오거나 직접 정의해야 합니다.
// 여기서는 간단하게 gameState에서 직접 가져오는 것으로 대체합니다.
function getStat(unit, stat) {
    // mechanics.js의 getStat 함수 로직이 여기에 필요합니다.
    // 지금은 임시로 기본값만 반환합니다.
    return unit[stat] || 0;
}
