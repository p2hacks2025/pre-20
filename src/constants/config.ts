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

// テトリミノ定義
export const SHAPES: number[][][] = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]]
];

// 色定義
export const SHAPE_COLORS = [
    '#00F0F0', '#F0F000', '#A000F0', '#F00000', '#00F000', '#F0A000', '#0000F0'
];

// UIボタン位置
export const BTN_LAYOUT = {
    DRILL: { x: 0, y: 300, w: 210, h: 50 },
    MONEY: { x: 0, y: 380, w: 210, h: 50 }
};