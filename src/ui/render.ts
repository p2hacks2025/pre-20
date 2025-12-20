import p5 from 'p5';
import type { GameState } from '../types';
import { COLS, ROWS, BLOCK_SIZE, TYPE, MINO_COLORS, STATE, BOARD_W, BOARD_H } from '../constants/config';
import { canMove, isRowFull, rowHasGold, rowHasPlatinum } from '../core/logic';

// 単体ブロック描画
const drawSingleBlock = (p: p5, x: number, y: number, type: number, colorArg: string): void => {
    p.stroke(0, 50);
    p.strokeWeight(1);

    if (type === TYPE.GOLD) {
        p.fill(255, 215, 0);
        p.rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        // 光沢
        p.noStroke();
        p.fill(255, 255, 200, 150);
        p.rect(x + 2, y + 2, 8, 8);
    } else if (type === TYPE.PLATINUM) {
        p.fill(224, 224, 224);
        p.rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        // 光沢
        p.noStroke();
        p.fill(255, 255, 255, 180);
        p.triangle(x, y, x + 15, y, x, y + 15);
    } else if (type === TYPE.JANK) {
        p.fill(100, 110, 115);
        p.rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        p.fill(50);
        p.ellipse(x + 15, y + 15, 12, 12);
    } else {
        p.fill(colorArg);
        p.rect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        // 立体感
        p.noStroke();
        p.fill(255, 255, 255, 50);
        p.rect(x, y, BLOCK_SIZE, 5);
        p.fill(0, 0, 0, 30);
        p.rect(x, y + BLOCK_SIZE - 5, BLOCK_SIZE, 5);
    }
    p.stroke(0);
};

// グリッド描画
export const drawGrid = (p: p5, state: GameState): void => {
    // 盤面の背景（半透明の黒）
    p.fill(0, 0, 0, 200);
    p.noStroke();
    p.rect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);

    p.stroke(50);
    p.strokeWeight(1);
    for (let i = 0; i <= COLS; i++) p.line(i * BLOCK_SIZE, 0, i * BLOCK_SIZE, ROWS * BLOCK_SIZE);
    for (let j = 0; j <= ROWS; j++) p.line(0, j * BLOCK_SIZE, COLS * BLOCK_SIZE, j * BLOCK_SIZE);

    state.grid.forEach((row, y) => {
        row.forEach((type, x) => {
            if (type !== 0) {
                drawSingleBlock(p, x * BLOCK_SIZE, y * BLOCK_SIZE, type, state.colorGrid[y][x]);
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
    p.strokeWeight(2);
    state.currentShape.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell !== 0) {
                p.rect((state.currentX + j) * BLOCK_SIZE, (ghostY + i) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
};

// オーバーレイ描画（ドリル・TNT）
export const drawInteractionOverlay = (p: p5, state: GameState, mouseGridX: number, mouseGridY: number): void => {
    // 範囲外なら何もしない
    if (mouseGridX < 0 || mouseGridX >= COLS || mouseGridY < 0 || mouseGridY >= ROWS) return;

    if (state.gameState === STATE.DRILL) {
        if (isRowFull(state, mouseGridY)) {
            p.fill(255, 0, 0, 100);
            p.noStroke();
            p.rect(0, mouseGridY * BLOCK_SIZE, COLS * BLOCK_SIZE, BLOCK_SIZE);

            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(16);
            p.text(rowHasPlatinum(state, mouseGridY) ? "PLATINUM BLAST!" : "DRILL!", COLS * BLOCK_SIZE / 2, mouseGridY * BLOCK_SIZE + BLOCK_SIZE / 2);
        }
    } else if (state.gameState === STATE.TNT) {
        if (isRowFull(state, mouseGridY) && !rowHasGold(state, mouseGridY)) {
            p.fill(255, 140, 0, 150);
            p.noStroke();
            p.rect(0, mouseGridY * BLOCK_SIZE, COLS * BLOCK_SIZE, BLOCK_SIZE);

            p.fill(255);
            p.textAlign(p.CENTER, p.CENTER);
            p.text("TNT EXPLODE!", COLS * BLOCK_SIZE / 2, mouseGridY * BLOCK_SIZE + BLOCK_SIZE / 2);
        }
    }
};

export const drawGameOverAnimation = (p: p5, state: GameState) => {
    if (state.gameState !== 2 && !state.gameCleared) return;

    p.push();
    p.resetMatrix();

    // 暗転
    p.noStroke();
    p.fill(0, 0, 0, state.fadeAlpha);
    p.rect(0, 0, BOARD_W, BOARD_H);

    // 文字
    if (state.fadeAlpha > 100) {
        p.textSize(64);
        p.textStyle(p.BOLD);
        p.textAlign(p.CENTER, p.CENTER);

        if (state.gameCleared) {
            p.fill(0, 255, 255);
            p.text("NIGHT CLEAR!", BOARD_W / 2, state.gameOverTextY);
        } else {
            p.fill(255, 50, 50);
            p.text("GAME OVER", BOARD_W / 2, state.gameOverTextY);

            p.textSize(24);
            p.fill(255);
            p.text("Press ENTER to Retry", BOARD_W / 2, state.gameOverTextY + 80);
        }
    }
    p.pop();
};