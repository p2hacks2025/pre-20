import { COLS, ROWS, STATE, SHAPES, TYPE } from '../constants/config';
import { GameState } from '../types';

export const createInitialState = (): GameState => ({
  gameState: STATE.TITLE,
  grid: Array.from({ length: ROWS }, () => Array(COLS).fill(TYPE.EMPTY)),
  colorGrid: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),

  currentShape: [],
  currentColorIndex: 0,
  currentX: 0,
  currentY: 0,
  currentBlockTypes: Array(4).fill(TYPE.NORMAL),

  nextShape: SHAPES[0],
  nextColorIndex: 0,
  nextBlockTypes: Array(4).fill(TYPE.NORMAL),

  score: 0,
  money: 0,
  drillUses: 5,
  tntAmmo: 0,

  gameStartFrame: 0,
  gameCleared: false,
  dropInterval: 60,
  timeLimitSec: 90,
});

export const resetGame = (state: GameState, currentFrame: number): void => {
  state.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(TYPE.EMPTY));
  state.colorGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  state.score = 0;
  state.money = 0;
  state.drillUses = 5;
  state.tntAmmo = 0;
  state.dropInterval = 60;
  state.gameState = STATE.PLAY;
  state.gameStartFrame = currentFrame;
  state.gameCleared = false;
};