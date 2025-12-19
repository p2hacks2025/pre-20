export const COLS = 10;
export const ROWS = 20;
export const BLOCK_SIZE = 30;
export const UI_WIDTH = 250;
export const WINDOW_W = COLS * BLOCK_SIZE + UI_WIDTH;
export const WINDOW_H = ROWS * BLOCK_SIZE;

// ブロックタイプ
export const TYPE = {
    EMPTY: 0,
    NORMAL: 1,
    GOLD: 2,
    PLATINUM: 3,
    JANK: 4,
} as const;

// ゲーム状態
export const STATE = {
    TITLE: -1,
    PLAY: 0,
    DRILL: 1,
    TNT: 3,
    GAMEOVER: 2,
} as const;

export type MinoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

// 各ブロックの形状データ (0: 空白, 1: ブロック)
export const MINO_SHAPES: Record<MinoType, number[][]> = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    O: [
        [1, 1],
        [1, 1],
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
};

// 各ブロックの色定義
export const MINO_COLORS: Record<MinoType, string> = {
    I: '#06b6d4', // Cyan
    O: '#fbbf24', // Amber
    T: '#a855f7', // Purple
    S: '#22c55e', // Green
    Z: '#ef4444', // Red
    J: '#3b82f6', // Blue
    L: '#f97316', // Orange
};

// UIボタン位置
export const BTN_LAYOUT = {
    DRILL: { x: 0, y: 300, w: 210, h: 50 },
    MONEY: { x: 0, y: 380, w: 210, h: 50 }
};