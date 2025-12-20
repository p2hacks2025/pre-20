import p5 from 'p5';
import { WINDOW_W, WINDOW_H, COLS, BLOCK_SIZE, ROWS, STATE, BTN_LAYOUT } from './constants/config';
import { createInitialState, resetGame } from './store/state';
import { spawnPiece, canMove, rotateShape, lockPiece, generateNextPiece, useDrill, rowHasGold, useTNT, isRowFull } from './core/logic';
import { initButtonPositions, drawTitle, drawGrid, drawGhost, drawCurrentPiece, drawDrillOverlay, drawTNTOverlay, drawGameOver, drawUI } from './ui/render';

const sketch = (p: p5) => {
	const state = createInitialState();

	p.setup = () => {
		p.createCanvas(WINDOW_W, WINDOW_H);
		initButtonPositions(p);
		generateNextPiece(state);
	};

	p.draw = () => {
		p.background(20);

		if (state.gameState === STATE.TITLE) {
			drawTitle(p);
			return;
		}

		if (state.gameState === STATE.PLAY) {
			const elapsedSec = Math.floor((p.frameCount - state.gameStartFrame) / 60);
			const remainingSec = state.timeLimitSec - elapsedSec;
			if (remainingSec <= 0) {
				if (state.score >= 800) state.gameCleared = true;
				state.gameState = STATE.GAMEOVER;
			}
		}

		p.stroke(100);
		p.line(COLS * BLOCK_SIZE, 0, COLS * BLOCK_SIZE, p.height);

		drawGrid(p, state);

		if (state.gameState === STATE.PLAY) {
			drawGhost(p, state);
			drawCurrentPiece(p, state);
			updateGameLogic();
		} else if (state.gameState === STATE.DRILL || state.gameState === STATE.TNT) {
			drawCurrentPiece(p, state);
			if (state.gameState === STATE.DRILL) drawDrillOverlay(p, state);
			else drawTNTOverlay(p, state);
		} else if (state.gameState === STATE.GAMEOVER) {
			drawGameOver(p, state);
		}

		if (state.gameState !== STATE.GAMEOVER) {
			drawUI(p, state);
		}
	};

	const updateGameLogic = () => {
		if (p.frameCount % state.dropInterval === 0) {
			if (canMove(state, state.currentX, state.currentY + 1, state.currentShape)) {
				state.currentY++;
			} else {
				lockPiece(state);
				spawnPiece(state);
			}
		}
		if (p.frameCount % 600 === 0 && state.dropInterval > 10) {
			state.dropInterval -= 2;
		}
	};

	// 移動関数
	const tryMove = (dx: number, dy: number): boolean => {
		if (canMove(state, state.currentX + dx, state.currentY + dy, state.currentShape)) {
			state.currentX += dx;
			state.currentY += dy;
			return true;
		}
		return false;
	};

	// ハードドロップ
	const executeHardDrop = () => {
		while (tryMove(0, 1)) {
			// 地面につくまで
		}
		lockPiece(state);
		spawnPiece(state);
	};

	// ゲーム開始処理
	const startGame = () => {
		resetGame(state, p.frameCount);
		spawnPiece(state);
	};

	p.keyPressed = () => {
		switch (state.gameState) {
			case STATE.TITLE:
				if (p.key === 'Enter') startGame();
				break;
			case STATE.GAMEOVER:
				if (p.key === 'Enter') state.gameState = STATE.TITLE;
				break;
			case STATE.PLAY:
				handlePlayInput();
				break;
		}
	};

	// プレイ中の入力処理を分離
	const handlePlayInput = () => {
		switch (p.key) {
			case 'ArrowLeft':
				tryMove(-1, 0);
				break;
			case 'ArrowRight':
				tryMove(1, 0);
				break;
			case 'ArrowDown':
				tryMove(0, 1);
				break;
			case 'ArrowUp':
				rotateShape(state);
				break;
			case ' ':
				executeHardDrop();
				break;
		}
	};

	p.mousePressed = () => {
		if (p.mouseX >= BTN_LAYOUT.DRILL.x && p.mouseX <= BTN_LAYOUT.DRILL.x + BTN_LAYOUT.DRILL.w &&
			p.mouseY >= BTN_LAYOUT.DRILL.y && p.mouseY <= BTN_LAYOUT.DRILL.y + BTN_LAYOUT.DRILL.h) {
			state.gameState = (state.gameState === STATE.DRILL) ? STATE.PLAY : STATE.DRILL;
		}
		else if (p.mouseX >= BTN_LAYOUT.MONEY.x && p.mouseX <= BTN_LAYOUT.MONEY.x + BTN_LAYOUT.MONEY.w &&
			p.mouseY >= BTN_LAYOUT.MONEY.y && p.mouseY <= BTN_LAYOUT.MONEY.y + BTN_LAYOUT.MONEY.h) {
			if (state.money >= 1000) {
				state.money -= 1000;
				state.tntAmmo = 3;
				state.gameState = STATE.TNT;
			}
			else if (state.money >= 100) {
				state.money -= 100;
				state.drillUses += 3;
			}
		}

		const my = Math.floor(p.mouseY / BLOCK_SIZE);
		if (p.mouseX < COLS * BLOCK_SIZE && my >= 0 && my < ROWS && isRowFull(state, my)) {
			if (state.gameState === STATE.DRILL) useDrill(state, my);
			else if (state.gameState === STATE.TNT && !rowHasGold(state, my)) useTNT(state, my);
		}
	};
};

// p5インスタンスの作成（第2引数にDOM要素を渡す）
new p5(sketch, document.getElementById('app')!);
