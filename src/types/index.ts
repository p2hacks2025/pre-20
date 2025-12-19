export interface GameState {
    gameState: number;
    grid: number[][];
    colorGrid: number[][];

    // 操作ブロック
    currentShape: number[][];
    currentColorIndex: number;
    currentX: number;
    currentY: number;
    currentBlockTypes: number[];

    // 次のブロック
    nextShape: number[][];
    nextColorIndex: number;
    nextBlockTypes: number[];

    // ステータス
    score: number;
    money: number;
    drillUses: number;
    tntAmmo: number;

    // システム
    gameStartFrame: number;
    gameCleared: boolean;
    dropInterval: number;
    timeLimitSec: number;
}