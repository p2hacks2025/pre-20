import { COLS, ROWS, TYPE, STATE, MINO_SHAPES, type MinoType, MINO_COLORS } from '../constants/config';
import type { GameState } from '../types';

// ブロック回転の計算
const getRotatedShape = (shape: number[][]): number[][] => {
    const h = shape.length;
    const w = shape[0].length;

    // 幅と高さを入れ替え
    const rotated = Array.from({ length: w }, () => Array(h).fill(0));

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            rotated[x][h - 1 - y] = shape[y][x];
        }
    }

    return rotated;
};

// 次のブロックを生成
export const generateNextPiece = (state: GameState): void => {
    const keys = Object.keys(MINO_SHAPES) as MinoType[];
    const r = keys[Math.floor(Math.random() * keys.length)];

    state.nextMinoType = r;
    state.nextShape = MINO_SHAPES[r];

    let counter = 0;
    state.nextShape.forEach(row => {
        row.forEach(cell => {
            if (cell !== 0 && counter < 4) {
                const rnd = Math.random();
                if (rnd < 0.15) state.nextBlockTypes[counter] = TYPE.GOLD;
                else if (rnd < 0.25) state.nextBlockTypes[counter] = TYPE.PLATINUM;
                else if (rnd < 0.40) state.nextBlockTypes[counter] = TYPE.JANK;
                else state.nextBlockTypes[counter] = TYPE.NORMAL;
                counter++;
            }
        });
    });
};

// 衝突判定
export const canMove = (state: GameState, newX: number, newY: number, shape: number[][]): boolean => {
    return shape.every((row, i) => {
        return row.every((cell, j) => {
            if (cell === 0) return true;
            const x = newX + j;
            const y = newY + i;
            if (x < 0 || x >= COLS || y >= ROWS) return false;
            if (y >= 0 && state.grid[y][x] !== 0) return false;
            return true;
        });
    });
};

// スポーン処理
export const spawnPiece = (state: GameState): void => {
    state.currentShape = state.nextShape;
    state.currentMinoType = state.nextMinoType;
    state.currentBlockTypes = [...state.nextBlockTypes];

    state.canHold = true;

    //初期位置計算
    state.currentX = Math.floor(COLS / 2) - Math.floor(state.currentShape[0].length / 2);
    state.currentY = 0;

    generateNextPiece(state);

    if (!canMove(state, state.currentX, state.currentY, state.currentShape)) {
        state.gameState = STATE.GAMEOVER;
    }
};

// 回転処理
export const rotateShape = (state: GameState): void => {
    const rotated = getRotatedShape(state.currentShape);

    if (canMove(state, state.currentX, state.currentY, rotated)) {
        state.currentShape = rotated;
    } else if (canMove(state, state.currentX + 1, state.currentY, rotated)) {
        state.currentX += 1;
        state.currentShape = rotated;
    } else if (canMove(state, state.currentX - 1, state.currentY, rotated)) {
        state.currentX -= 1;
        state.currentShape = rotated;
    }
};

// 固定処理
export const lockPiece = (state: GameState): void => {
    const colorCode = MINO_COLORS[state.currentMinoType];
    let counter = 0;

    state.currentShape.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell !== 0 && counter < 4) {
                const x = state.currentX + j;
                const y = state.currentY + i;
                if (y >= 0) {
                    state.grid[y][x] = state.currentBlockTypes[counter];
                    state.colorGrid[y][x] = colorCode;
                }
                counter++;
            }
        });
    });
};

// 重力落下（ドリル後などの詰め処理）
export const applyGravityCascade = (state: GameState): void => {
    for (let x = 0; x < COLS; x++) {
        const activeBlocks: { t: number, c: string }[] = [];
        for (let y = 0; y < ROWS; y++) {
            if (state.grid[y][x] !== 0) {
                activeBlocks.push({ t: state.grid[y][x], c: state.colorGrid[y][x] });
            }
        }
        // 列をクリア
        for (let y = 0; y < ROWS; y++) {
            state.grid[y][x] = 0;
            state.colorGrid[y][x] = '';
        }
        // 下から詰める
        let pos = ROWS - 1;
        for (let i = activeBlocks.length - 1; i >= 0; i--) {
            state.grid[pos][x] = activeBlocks[i].t;
            state.colorGrid[pos][x] = activeBlocks[i].c;
            pos--;
        }
    }
};

// ホールド機能
export const holdPiece = (state: GameState): void => {
    if (!state.canHold) return;

    const currentMino = state.currentMinoType;
    const currentBlocks = [...state.currentBlockTypes];

    if (state.holdMinoType === null) {
        state.holdMinoType = currentMino;
        state.holdBlockTypes = currentBlocks;

        spawnPiece(state);
    } else {
        const heldMino = state.holdMinoType;
        const heldBlocks = [...state.holdBlockTypes];

        state.holdMinoType = currentMino;
        state.holdBlockTypes = currentBlocks;

        state.currentMinoType = heldMino;
        state.currentShape = MINO_SHAPES[heldMino];
        state.currentBlockTypes = heldBlocks;

        state.currentX = Math.floor(COLS / 2) - Math.floor(state.currentShape[0].length / 2);
        state.currentY = 0;
    }
    state.canHold = false;
};

// ドリル機能
export const useDrill = (state: GameState, targetRow: number): void => {
    if (state.drillUses <= 0) return;

    let moneyGained = 0;
    let explodeRowAbove = false;

    for (let x = 0; x < COLS; x++) {
        const type = state.grid[targetRow][x];
        if (type === TYPE.GOLD) {
            moneyGained += 10;
            state.score += 50;
        } else if (type === TYPE.PLATINUM) {
            moneyGained += 20;
            state.score += 80;
            explodeRowAbove = true;
        }
        state.grid[targetRow][x] = TYPE.EMPTY;
    }

    if (explodeRowAbove && targetRow > 0) {
        for (let x = 0; x < COLS; x++) {
            if (state.grid[targetRow - 1][x] === TYPE.GOLD) {
                moneyGained += 100;
                state.score += 500;
            }
            state.grid[targetRow - 1][x] = TYPE.EMPTY;
        }
    }

    state.money += moneyGained;
    state.drillUses--;
    applyGravityCascade(state);
};

// TNT機能
export const useTNT = (state: GameState, targetRow: number): void => {
    if (state.tntAmmo <= 0) return;
    state.tntAmmo--;

    for (let y = targetRow; y > 0; y--) {
        for (let x = 0; x < COLS; x++) {
            state.grid[y][x] = state.grid[y - 1][x];
            state.colorGrid[y][x] = state.colorGrid[y - 1][x];
        }
    }
    for (let x = 0; x < COLS; x++) state.grid[0][x] = 0;

    if (state.tntAmmo <= 0) state.gameState = STATE.PLAY;
};

// 判定系ヘルパー
export const isRowFull = (state: GameState, y: number): boolean =>
    state.grid[y].every(cell => cell !== 0);

export const rowHasGold = (state: GameState, y: number): boolean =>
    state.grid[y].includes(TYPE.GOLD);

export const rowHasPlatinum = (state: GameState, y: number): boolean =>
    state.grid[y].includes(TYPE.PLATINUM);
