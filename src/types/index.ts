import type { MinoType } from "../constants/config";

export interface GameState {
    gameState: number;
    grid: number[][];
    colorGrid: string[][];

    // 操作ブロック
    currentShape: number[][];
    currentMinoType: MinoType;
    currentX: number;
    currentY: number;
    currentBlockTypes: number[];

    // 次のブロック
    nextShape: number[][];
    nextMinoType: MinoType;
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