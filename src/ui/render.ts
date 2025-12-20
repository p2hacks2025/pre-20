import p5 from 'p5';
import type { GameState } from '../types';
import { COLS, ROWS, BLOCK_SIZE, TYPE, STATE, BTN_LAYOUT, MINO_COLORS, MINO_SHAPES, LEFT_UI_WIDTH } from '../constants/config';
import { canMove, isRowFull, rowHasGold, rowHasPlatinum } from '../core/logic';

// ボタン位置初期化
export const initButtonPositions = (p: p5) => {
    const rightUiX = LEFT_UI_WIDTH + (COLS * BLOCK_SIZE) + 20;

    BTN_LAYOUT.DRILL.x = rightUiX;
    BTN_LAYOUT.MONEY.x = rightUiX;
};

// 単体ブロック描画
const drawSingleBlock = (p: p5, x: number, y: number, type: number, colorArg: string): void => {
    if (type === TYPE.GOLD) {
        p.fill(255, 215, 0);
        p.stroke(255, 255, 200);
        p.rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        p.fill(255, 255, 200);
        p.rect(x + 5, y + 5, 5, 5);
    } else if (type === TYPE.PLATINUM) {
        p.fill(192, 192, 192);
        p.stroke(255);
        p.rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        p.fill(255);
        p.triangle(x, y, x + 10, y, x, y + 10);
    } else if (type === TYPE.JANK) {
        p.fill(105, 123, 124);
        p.stroke(255);
        p.rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        p.fill(50);
        p.ellipse(x + 15, y + 15, 10, 10);
    } else {
        p.fill(colorArg);
        p.stroke(0);
        p.rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
    }
};

// グリッド描画
export const drawGrid = (p: p5, state: GameState): void => {
    state.grid.forEach((row, y) => {
        row.forEach((type, x) => {
            if (type !== 0) {
                drawSingleBlock(p, x * BLOCK_SIZE, y * BLOCK_SIZE, type, state.colorGrid[y][x]);
            } else {
                p.noFill();
                p.stroke(40);
                p.rect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
};

// 操作ブロック描画
export const drawCurrentPiece = (p: p5, state: GameState): void => {
    const colorCode = MINO_COLORS[state.currentMinoType];
    let counter = 0;

    state.currentShape.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell !== 0 && counter < 4) {
                const type = state.currentBlockTypes[counter];
                drawSingleBlock(p, (state.currentX + j) * BLOCK_SIZE, (state.currentY + i) * BLOCK_SIZE, type, colorCode);
                counter++;
            }
        });
    });
};

// ゴースト描画
export const drawGhost = (p: p5, state: GameState): void => {
    let ghostY = state.currentY;

    while (canMove(state, state.currentX, ghostY + 1, state.currentShape)) ghostY++;

    p.noFill();
    p.stroke(255, 100);
    state.currentShape.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell !== 0) {
                p.rect((state.currentX + j) * BLOCK_SIZE, (ghostY + i) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
};

export const drawHold = (p: p5, state: GameState): void => {
    p.push();
    p.translate(20, 20);
    p.textAlign(p.LEFT, p.TOP);
    p.fill(255);
    p.textSize(20);
    p.text("HOLD", 0, 0);

    // 使用済みなら暗くする
    if (!state.canHold) p.fill(150);

    if (state.holdMinoType !== null) {
        const holdColor = MINO_COLORS[state.holdMinoType];
        const holdShape = MINO_SHAPES[state.holdMinoType];
        let counter = 0;

        // HOLDの下にブロックを描画
        holdShape.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell !== 0 && counter < 4) {
                    drawSingleBlock(p, j * BLOCK_SIZE, 40 + i * BLOCK_SIZE, state.holdBlockTypes[counter], holdColor);
                    counter++;
                }
            });
        });
    }
    p.pop();
};

// UI描画
export const drawUI = (p: p5, state: GameState): void => {
    p.push();
    p.translate(LEFT_UI_WIDTH + (COLS * BLOCK_SIZE), 0);
    p.textAlign(p.LEFT, p.TOP);
    p.fill(255);
    p.textSize(20);
    p.text("NEXT", 20, 20);

    const nextColor = MINO_COLORS[state.nextMinoType];
    let counter = 0;

    state.nextShape.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell !== 0 && counter < 4) {
                drawSingleBlock(p, 20 + j * BLOCK_SIZE, 50 + i * BLOCK_SIZE, state.nextBlockTypes[counter], nextColor);
                counter++;
            }
        });
    });

    const statY = 180;
    p.fill(255);
    p.text(`SCORE: ${state.score}`, 20, statY);
    p.fill('#FFFF00');
    p.text(`MONEY: ${state.money} YEN`, 20, statY + 30);
    p.fill('#00FF00');
    p.text(`DRILL: ${state.drillUses} Left`, 20, statY + 60);
    p.pop();

    drawButtons(p, state);

    const elapsedSec = Math.floor((p.frameCount - state.gameStartFrame) / 60);
    const remainingSec = Math.max(0, state.timeLimitSec - elapsedSec);
    p.fill(255);
    p.textAlign(p.LEFT);
    p.text(`TIME: ${remainingSec}s`, 90, BTN_LAYOUT.DRILL.y - 20);
};

// ボタン描画
const drawButtons = (p: p5, state: GameState): void => {
    p.textAlign(p.CENTER, p.CENTER);
    const localX = 20;

    // Drill
    p.fill(state.gameState === STATE.DRILL ? p.color(200, 50, 50) : p.color(100));
    p.stroke(255);
    p.rect(localX, BTN_LAYOUT.DRILL.y, BTN_LAYOUT.DRILL.w, BTN_LAYOUT.DRILL.h, 10);

    p.fill(255);
    p.textSize(20);
    p.text("ACTIVATE DRILL", localX + BTN_LAYOUT.DRILL.w / 2, BTN_LAYOUT.DRILL.y + BTN_LAYOUT.DRILL.h / 2);

    // Money
    if (state.gameState === STATE.TNT) p.fill(255, 100, 0);
    else p.fill(218, 165, 32);

    p.rect(localX, BTN_LAYOUT.MONEY.y, BTN_LAYOUT.MONEY.w, BTN_LAYOUT.MONEY.h, 10);
    p.fill(0);

    const cx = localX + BTN_LAYOUT.MONEY.w / 2;
    const cy = BTN_LAYOUT.MONEY.y + BTN_LAYOUT.MONEY.h / 2;

    if (state.gameState === STATE.TNT) p.text(`TNT ACTIVE: ${state.tntAmmo}`, cx, cy);
    else if (state.money >= 1000) p.text("BUY TNT x3 (1000Y)", cx, cy);
    else p.text("BUY DRILL x3 (100Y)", cx, cy);
};

// オーバーレイ描画
export const drawDrillOverlay = (p: p5, state: GameState): void => {
    const my = Math.floor(p.mouseY / BLOCK_SIZE);
    const gridMouseX = p.mouseX - LEFT_UI_WIDTH;

    if (gridMouseX >= 0 && gridMouseX < COLS * BLOCK_SIZE && my >= 0 && my < ROWS && isRowFull(state, my)) {
        p.fill(255, 0, 0, 100);
        p.rect(0, my * BLOCK_SIZE, COLS * BLOCK_SIZE, BLOCK_SIZE);
        p.fill(255);
        p.textAlign(p.CENTER);
        p.text(rowHasPlatinum(state, my) ? "PLATINUM BLAST!" : "DRILL GOLD", COLS * BLOCK_SIZE / 2, my * BLOCK_SIZE + 20);
    }
};

export const drawTNTOverlay = (p: p5, state: GameState): void => {
    const my = Math.floor(p.mouseY / BLOCK_SIZE);
    const gridMouseX = p.mouseX - LEFT_UI_WIDTH;
    if (gridMouseX >= 0 && gridMouseX < COLS * BLOCK_SIZE && my >= 0 && my < ROWS && isRowFull(state, my)) {
        if (!rowHasGold(state, my)) {
            p.fill(255, 140, 0, 150);
            p.rect(0, my * BLOCK_SIZE, COLS * BLOCK_SIZE, BLOCK_SIZE);
            p.fill(255);
            p.textAlign(p.CENTER);
            p.text("TNT EXPLOSION", COLS * BLOCK_SIZE / 2, my * BLOCK_SIZE + 20);
        }
    }
};

export const drawTitle = (p: p5): void => {
    p.background(10);
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(42);
    p.text("GOOOOOOOLden", p.width / 2, p.height / 2 - 60);
    p.textSize(18);
    p.text("Press SPACE to Start", p.width / 2, p.height / 2 + 20);
};

export const drawGameOver = (p: p5, state: GameState): void => {
    p.fill(0, 180);
    p.rect(0, 0, p.width, p.height);
    p.textAlign(p.CENTER, p.CENTER);
    if (state.gameCleared) {
        p.fill(180, 200, 255);
        p.textSize(36);
        p.text("NIGHT CLEAR!", p.width / 2, p.height / 2);
    } else {
        p.fill(255, 0, 0);
        p.textSize(36);
        p.text("GAME OVER", p.width / 2, p.height / 2);
    }
    p.textSize(16);
    p.fill(255);
    p.text("Press ENTER to Retry", p.width / 2, p.height / 2 + 60);
};