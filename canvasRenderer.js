// canvasRenderer.js

// [수정] 원하는 타일 크기로 설정합니다. 48, 64 등 자유롭게 조절해보세요.
export let TILE_SIZE = 64;

// 화면 크기에 맞춰 타일 크기를 동적으로 조절합니다.
export function updateTileSize(displayWidth, displayHeight) {
    const base = Math.min(displayWidth, displayHeight);
    // 너무 크거나 작지 않도록 범위를 제한합니다.
    TILE_SIZE = Math.max(32, Math.min(96, Math.floor(base / 20)));
}

// 이미지 로딩을 위한 객체
export const assetLoader = {
    images: {},
    imageSources: {
        player: 'assets/images/player.png',
        floor: 'assets/images/floor-tile.png',
        wall: 'assets/images/wall-tile.png',
        zombie: 'assets/images/zombie.png',
        warrior: 'assets/images/warrior.png',
        archer: 'assets/images/archer.png',
        wizard: 'assets/images/wizard.png',
        healer: 'assets/images/healer.png',
        bard: 'assets/images/bard.png',
        paladin: 'assets/images/paladin.png',
        item: 'assets/images/gold.png',
        corpse: 'assets/images/corpse.png',
        chest: 'assets/images/chest.png',
        // ... 필요한 모든 이미지 경로 추가 ...
    },
    load(callback) {
        let loaded = 0;
        const numImages = Object.keys(this.imageSources).length;
        if (numImages === 0) {
            callback({});
            return;
        }
        for (const key in this.imageSources) {
            this.images[key] = new Image();
            this.images[key].src = this.imageSources[key];
            this.images[key].onload = () => {
                if (++loaded >= numImages) {
                    callback(this.images);
                }
            };
            this.images[key].onerror = () => {
                console.error(`Failed to load image: ${this.imageSources[key]}`);
                if (++loaded >= numImages) {
                    callback(this.images);
                }
            }
        }
    }
};

// 게임 상태를 캔버스에 그리는 메인 함수
export function renderGame(canvas, ctx, images, gameState) {
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    const halfScreenTilesX = canvas.width / TILE_SIZE / 2;
    const halfScreenTilesY = canvas.height / TILE_SIZE / 2;
    let cameraX = gameState.player.x - halfScreenTilesX;
    let cameraY = gameState.player.y - halfScreenTilesY;

    cameraX = Math.max(0, Math.min(cameraX, gameState.dungeonSize - canvas.width / TILE_SIZE));
    cameraY = Math.max(0, Math.min(cameraY, gameState.dungeonSize - canvas.height / TILE_SIZE));

    cameraX = Math.floor(cameraX);
    cameraY = Math.floor(cameraY);

    const startCol = Math.max(0, cameraX);
    const endCol = Math.min(gameState.dungeonSize, cameraX + Math.ceil(canvas.width / TILE_SIZE) + 1);
    const startRow = Math.max(0, cameraY);
    const endRow = Math.min(gameState.dungeonSize, cameraY + Math.ceil(canvas.height / TILE_SIZE) + 1);

    // 타일, 지형지물, 아이템 그리기
    for (let y = startRow; y < endRow; y++) {
        for (let x = startCol; x < endCol; x++) {
            const screenX = (x - cameraX) * TILE_SIZE;
            const screenY = (y - cameraY) * TILE_SIZE;

            if (gameState.fogOfWar[y]?.[x]) {
                ctx.fillStyle = '#000';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                continue;
            }

            const cellType = gameState.dungeon[y][x];
            const tileImage = (cellType === 'wall') ? images.wall : images.floor;
            if(tileImage) ctx.drawImage(tileImage, screenX, screenY, TILE_SIZE, TILE_SIZE);

            if (images[cellType]) {
                ctx.drawImage(images[cellType], screenX, screenY, TILE_SIZE, TILE_SIZE);
            } else {
                const colors = {
                    chest: '#B8860B',
                    mine: '#888',
                    tree: '#228B22',
                    bones: '#DDD',
                    grave: '#555',
                    altar: '#FFCC00',
                    exit: '#00FFFF',
                    shop: '#FF69B4'
                };
                if (colors[cellType]) {
                    ctx.fillStyle = colors[cellType];
                    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }

    // 유닛(몬스터, 용병, 플레이어)과 UI 그리기
    const allUnits = [...gameState.monsters, ...gameState.activeMercenaries, gameState.player].sort((a, b) => a.y - b.y);
    allUnits.forEach(unit => {
        if(!unit || (unit.health !== undefined && unit.health <= 0)) return;

        const screenX = (unit.x - cameraX) * TILE_SIZE;
        const screenY = (unit.y - cameraY) * TILE_SIZE;

        if (screenX < -TILE_SIZE || screenX > canvas.width || screenY < -TILE_SIZE || screenY > canvas.height) return;

        const unitImageKey = unit.type ? unit.type.toLowerCase() : (unit.id === 'player' ? 'player' : 'zombie');
        const unitImage = images[unitImageKey] || images.zombie;
        
        if (unitImage) ctx.drawImage(unitImage, screenX, screenY, TILE_SIZE, TILE_SIZE); // [수정]

        drawHealthBar(ctx, screenX, screenY, TILE_SIZE, unit); // [수정]
        drawEffectIcons(ctx, screenX, screenY, TILE_SIZE, unit); // [수정]
    });
}

function drawHealthBar(ctx, x, y, size, unit) { // [수정] size 매개변수 추가
    const maxHp = getStat(unit, 'maxHealth');
    if (maxHp > 0 && unit.health < maxHp) {
        const hpRatio = unit.health / maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y - 8, size, 5); // [수정]
        ctx.fillStyle = hpRatio > 0.5 ? '#4CAF50' : hpRatio > 0.25 ? '#FFC107' : '#F44336';
        ctx.fillRect(x, y - 8, size * hpRatio, 5); // [수정]
    }
}

function drawEffectIcons(ctx, x, y, size, unit) { // [수정] size 매개변수 추가
    // 이 함수는 나중에 버프/디버프 아이콘을 그릴 때 사용됩니다.
    // 현재는 비워두어도 괜찮습니다.
}

// 이 파일에서만 임시로 사용하는 getStat 함수
function getStat(unit, stat) {
    return unit[stat] || 0;
}
