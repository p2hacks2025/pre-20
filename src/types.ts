import type { MinoType } from "./constants/config";

export interface GameAssets {
    bg: any;
    frame: any;
    tile: any;
    normalBlockTexture: any;
}

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

    // ホールド
    holdMinoType: MinoType | null;
    holdBlockTypes: number[];
    canHold: boolean;

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

    // 演出
    fadeAlpha: number;
    gameOverTextY: number;
}