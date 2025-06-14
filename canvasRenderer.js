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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    const visibleWidth = Math.ceil(canvas.width / TILE_SIZE);
    const visibleHeight = Math.ceil(canvas.height / TILE_SIZE);

    const startX = Math.floor(gameState.player.x - visibleWidth / 2);
    const startY = Math.floor(gameState.player.y - visibleHeight / 2);

    for (let y = 0; y < visibleHeight; y++) {
        for (let x = 0; x < visibleWidth; x++) {
            const mapX = startX + x;
            const mapY = startY + y;
            const screenX = x * TILE_SIZE;
            const screenY = y * TILE_SIZE;
            if (mapX < 0 || mapY < 0 || mapX >= gameState.dungeonSize || mapY >= gameState.dungeonSize) continue;

            const cellType = gameState.dungeon[mapY][mapX];
            const tileImage = (cellType === 'wall') ? images.wall : images.floor;
            if (tileImage) ctx.drawImage(tileImage, screenX, screenY, TILE_SIZE, TILE_SIZE);
            if (images[cellType]) ctx.drawImage(images[cellType], screenX, screenY, TILE_SIZE, TILE_SIZE);

            const item = gameState.items.find(it => it.x === mapX && it.y === mapY);
            if (item && images[item.key]) ctx.drawImage(images[item.key], screenX, screenY, TILE_SIZE, TILE_SIZE);

            const corpse = gameState.corpses && gameState.corpses.find(c => c.x === mapX && c.y === mapY);
            if (corpse && images.corpse) ctx.drawImage(images.corpse, screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
    }

    const allUnits = [...gameState.monsters, ...gameState.activeMercenaries, gameState.player]
        .filter(u => u && (u.health === undefined || u.health > 0))
        .sort((a, b) => a.y - b.y);
    allUnits.forEach(unit => {
        const screenX = (unit.x - startX) * TILE_SIZE;
        const screenY = (unit.y - startY) * TILE_SIZE;
        if (screenX < -TILE_SIZE || screenX > canvas.width || screenY < -TILE_SIZE || screenY > canvas.height) return;
        const key = unit.type ? unit.type.toLowerCase() : (unit.id === 'player' ? 'player' : 'zombie');
        const img = images[key] || images.zombie;
        if (img) ctx.drawImage(img, screenX, screenY, TILE_SIZE, TILE_SIZE);
        drawHealthBar(ctx, screenX, screenY, TILE_SIZE, unit);
        drawEffectIcons(ctx, screenX, screenY, TILE_SIZE, unit);
    });

    if (Array.isArray(gameState.projectiles)) {
        ctx.font = '16px sans-serif';
        gameState.projectiles.forEach(p => {
            const sx = (p.x - startX) * TILE_SIZE;
            const sy = (p.y - startY) * TILE_SIZE;
            if (sx < -TILE_SIZE || sx > canvas.width || sy < -TILE_SIZE || sy > canvas.height) return;
            ctx.fillText(p.icon || '⬤', sx + TILE_SIZE / 4, sy + TILE_SIZE / 2);
        });
    }

    for (let y = 0; y < visibleHeight; y++) {
        for (let x = 0; x < visibleWidth; x++) {
            const mapX = startX + x;
            const mapY = startY + y;
            if (mapX < 0 || mapY < 0 || mapX >= gameState.dungeonSize || mapY >= gameState.dungeonSize) continue;
            if (gameState.fogOfWar[mapY]?.[mapX]) {
                ctx.fillStyle = '#000';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

function drawHealthBar(ctx, x, y, size, unit) {
    const maxHp = getStat(unit, 'maxHealth');
    if (maxHp && unit.health < maxHp) {
        const ratio = unit.health / maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y - 6, size, 4);
        ctx.fillStyle = ratio > 0.5 ? '#0f0' : ratio > 0.25 ? '#ff0' : '#f00';
        ctx.fillRect(x, y - 6, size * ratio, 4);
    }
}

function drawEffectIcons(ctx, x, y, size, unit) {
    ctx.font = '10px sans-serif';
    ctx.fillStyle = 'white';
    const buffIcons = getActiveBuffIcons(unit);
    const debuffIcons = getActiveDebuffIcons(unit);
    buffIcons.forEach((icon, idx) => {
        ctx.fillText(icon, x + idx * 12, y - 5);
    });
    debuffIcons.forEach((icon, idx) => {
        ctx.fillText(icon, x + idx * 12, y + size + 10);
    });
}

const STATUS_ICONS = {
    poison: '☠️',
    burn: '🔥',
    freeze: '❄️',
    bleed: '🩸',
    paralysis: '⚡',
    nightmare: '😱',
    silence: '🤐',
    petrify: '🪨',
    debuff: '⬇️'
};

function getActiveBuffIcons(unit) {
    const icons = [];
    if (Array.isArray(unit.buffs)) {
        unit.buffs.forEach(b => {
            const defs = window.SKILL_DEFS || {};
            const info = defs[b.name] || (window.MERCENARY_SKILLS && window.MERCENARY_SKILLS[b.name]) || (window.MONSTER_SKILLS && window.MONSTER_SKILLS[b.name]);
            if (info && info.icon) icons.push(info.icon);
        });
    }
    if (unit.shield && unit.shieldTurns > 0) icons.push('🛡️');
    if (unit.attackBuff && unit.attackBuffTurns > 0) icons.push('💪');
    return icons;
}

function getActiveDebuffIcons(unit) {
    const icons = [];
    for (const key in STATUS_ICONS) {
        if (unit[key]) icons.push(STATUS_ICONS[key]);
    }
    return icons;
}

// 이 파일에서 사용될 getStat 함수 (mechanics.js에도 동일 함수가 있음)
// 모듈 시스템에서는 각 파일이 독립적이므로, 필요 함수를 가져오거나 직접 정의해야 합니다.
// 여기서는 간단하게 gameState에서 직접 가져오는 것으로 대체합니다.
function getStat(unit, stat) {
    // mechanics.js의 getStat 함수 로직이 여기에 필요합니다.
    // 지금은 임시로 기본값만 반환합니다.
    return unit[stat] || 0;
}
