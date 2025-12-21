import './style.css'
import p5 from 'p5';
import { COLS, BLOCK_SIZE, ROWS, STATE, BOARD_W, BOARD_H } from './constants/config';
import { createInitialState, resetGame } from './store/state';
import { spawnPiece, canMove, rotateShape, lockPiece, generateNextPiece, useDrill, rowHasGold, useTNT, isRowFull, holdPiece } from './core/logic';
import { drawGrid, drawGhost, drawCurrentPiece, drawInteractionOverlay, drawGameOverAnimation } from './ui/render';
import { updateDOM, setupDOMEvents } from './ui/dom';
import type { GameAssets } from './types';

(p5 as any).disableFriendlyErrors = true;

const sketch = (p: p5) => {
	const state = createInitialState();
	const assets: GameAssets = { bg: null, frame: null, tile: null, normalBlockTexture: null };

	const bgm = new Audio('/8bit-maou-kessen.mp3');
	bgm.loop = true;   // ループ再生を有効にする
	bgm.volume = 0.3;  // 音量設定 (0.0 〜 1.0) ※大きすぎないように注意

	(p as any).preload = () => {
		// publicフォルダの画像を読み込み
		assets.normalBlockTexture = p.loadImage('/maptile_ganpeki_gray.png');
	};

	p.setup = () => {
		p.createCanvas(BOARD_W, BOARD_H);
		// assets.normalBlockTexture = p.loadImage('/maptile_ganpeki_gray.png');

		// 次のブロック生成
		generateNextPiece(state);

		// HTML側のボタンイベント登録
		setupDOMEvents(state, startGame);
	};

	p.draw = () => {
		// 1. 画面クリア（透明にする）
		p.clear();

		// 2. タイトル画面
		if (state.gameState === STATE.TITLE) {
			state.gameStartFrame = p.frameCount;
			updateDOM(state, p.frameCount);
			// p.fill(255);
			// p.textAlign(p.CENTER, p.CENTER);
			// p.textSize(32);
			// p.textStyle(p.BOLD);
			// p.stroke(0);
			// p.strokeWeight(4);
			// p.text("GOOOOOOOLden Tetris", BOARD_W / 2, BOARD_H / 2 - 20);
			// p.textSize(16);
			// p.strokeWeight(0);
			// p.text("Press ENTER to Start", BOARD_W / 2, BOARD_H / 2 + 50);
			return; // タイトル時はここで終了
		}

		drawGrid(p, state, assets);

		// 3. ゲームロジック更新
		if (state.gameState === STATE.PLAY) {
			const elapsedSec = Math.floor((p.frameCount - state.gameStartFrame) / 60);
			const remainingSec = state.timeLimitSec - elapsedSec;

			if (remainingSec <= 0) {
				if (state.score >= 800) state.gameCleared = true;
				state.gameState = STATE.GAMEOVER;
				bgm.pause();
			}
			updateGameLogic();
		} else if (state.gameState === STATE.GAMEOVER || state.gameCleared) {
			if (state.fadeAlpha < 200) state.fadeAlpha += 2;
			if (state.gameOverTextY > BOARD_H / 2) state.gameOverTextY -= 1;
		}

		if (state.gameState === STATE.PLAY) {
			drawGhost(p, state);
			drawCurrentPiece(p, state, assets);
		} else if (state.gameState === STATE.DRILL || state.gameState === STATE.TNT) {
			drawCurrentPiece(p, state, assets);

			// マウス位置の計算
			const gridX = Math.floor(p.mouseX / BLOCK_SIZE);
			const gridY = Math.floor(p.mouseY / BLOCK_SIZE);
			drawInteractionOverlay(p, state, gridX, gridY);
		}

		if (state.gameState === STATE.GAMEOVER || state.gameCleared) {
			if (!bgm.paused) {
				bgm.pause();
			}
		}

		drawGameOverAnimation(p, state);

		updateDOM(state, p.frameCount);
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

	const tryMove = (dx: number, dy: number): boolean => {
		if (canMove(state, state.currentX + dx, state.currentY + dy, state.currentShape)) {
			state.currentX += dx;
			state.currentY += dy;
			return true;
		}
		return false;
	};

	const executeHardDrop = () => {
		while (tryMove(0, 1)) { }
		lockPiece(state);
		spawnPiece(state);
	};

	const startGame = () => {
		resetGame(state, p.frameCount);
		spawnPiece(state);
		bgm.currentTime = 0;
		bgm.play().catch(e => console.log("BGM Play Error:", e));
	};

	// キー入力
	p.keyPressed = () => {
		switch (state.gameState) {
			case STATE.TITLE:
				if (p.key === 'Enter') startGame();
				break;
			case STATE.GAMEOVER:
				if (p.key === 'Enter') state.gameState = STATE.TITLE;
				break;
			case STATE.PLAY:
				if (p.key === 'ArrowLeft') tryMove(-1, 0);
				else if (p.key === 'ArrowRight') tryMove(1, 0);
				else if (p.key === 'ArrowDown') tryMove(0, 1);
				else if (p.key === 'ArrowUp') rotateShape(state);
				else if (p.key === ' ') executeHardDrop();
				else if (p.key === 'Shift') holdPiece(state);
				break;
		}
	};

	// マウス入力 (ドリル/TNTの発火のみ担当)
	// UIボタンのクリックはdom.tsで処理される
	p.mousePressed = () => {
		// 盤面内のクリックか判定
		const gridX = Math.floor(p.mouseX / BLOCK_SIZE);
		const gridY = Math.floor(p.mouseY / BLOCK_SIZE);
		const isValidGrid = gridX >= 0 && gridX < COLS && gridY >= 0 && gridY < ROWS;

		if (isValidGrid && isRowFull(state, gridY)) {
			if (state.gameState === STATE.DRILL) useDrill(state, gridY);
			else if (state.gameState === STATE.TNT && !rowHasGold(state, gridY)) useTNT(state, gridY);
		}
	};
};

// p5インスタンス作成
new p5(sketch, document.getElementById('app')!);