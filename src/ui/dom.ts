import type { GameState } from '../types';
import { MINO_SHAPES, MINO_COLORS, TYPE, STATE } from '../constants/config';

// DOM要素の参照をキャッシュ
const els = {
    score: document.getElementById('ui-score')!,
    time: document.getElementById('ui-time')!,
    money: document.getElementById('ui-money')!,

    // ドリル関係
    drillBar: document.getElementById('ui-drill-bar')!,
    drillText: document.getElementById('ui-drill-text')!,
    btnDrill: document.getElementById('btn-drill')!,

    hold: document.getElementById('ui-hold')!,
    next: document.getElementById('ui-next')!,
    btnShopDrill: document.getElementById('btn-shop-drill')!,
    btnShopTnt: document.getElementById('btn-shop-tnt')!,

    // タイトル画面
    titleScreen: document.getElementById('ui-title')!,
    btnStart: document.getElementById('btn-start')!,

    // ゲームオーバー画面
    gameoverScreen: document.getElementById('ui-gameover')!,
    goMessage: document.getElementById('go-message')!,
    goScore: document.getElementById('go-score')!,
    btnRetry: document.getElementById('btn-retry')!,
};

// ブロック描画ヘルパー
const renderMinoToHTML = (container: HTMLElement, shape: number[][], color: string, blockTypes: number[]) => {
    container.innerHTML = '';
    let counter = 0;

    shape.forEach((row) => {
        row.forEach((cell) => {
            const div = document.createElement('div');
            div.className = 'w-full h-full rounded-[2px] shadow-sm';

            if (cell !== 0) {
                const type = blockTypes[counter];
                if (type === TYPE.GOLD) {
                    div.style.background = 'linear-gradient(135deg, #ffd700, #b8860b)';
                    div.style.border = '1px solid #ffffc8';
                } else if (type === TYPE.PLATINUM) {
                    div.style.background = 'linear-gradient(135deg, #e0e0e0, #a0a0a0)';
                    div.style.border = '1px solid #ffffff';
                } else if (type === TYPE.JANK) {
                    div.style.backgroundColor = '#505050';
                    div.style.border = '1px solid #303030';
                } else {
                    div.style.backgroundColor = color;
                    div.style.border = '1px solid rgba(255,255,255,0.4)';
                }
                counter++;
            } else {
                div.style.backgroundColor = 'transparent';
            }
            container.appendChild(div);
        });
    });
};

export const updateDOM = (state: GameState, currentFrame: number) => {
    // ゲームスタート
    if (state.gameState === STATE.TITLE) {
        els.titleScreen.classList.remove('hidden');
        els.titleScreen.classList.remove('opacity-0');
    } else {
        els.titleScreen.classList.add('hidden');
    }

    // ゲームオーバー・クリア
    if (state.gameState === STATE.GAMEOVER || state.gameCleared) {
        els.gameoverScreen.classList.remove('hidden');

        // メッセージと色を出し分け
        if (state.gameCleared) {
            els.goMessage.innerHTML = "NIGHT<br>CLEAR!";
            els.goMessage.className = "text-4xl font-black italic tracking-tighter mb-4 drop-shadow-lg text-center leading-tight text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-500";
        } else {
            els.goMessage.innerHTML = "GAME<br>OVER";
            els.goMessage.className = "text-4xl font-black italic tracking-tighter mb-4 drop-shadow-lg text-center leading-tight text-red-600";
        }

        // 最終スコアを表示
        els.goScore.textContent = state.score.toString();
    } else {
        els.gameoverScreen.classList.add('hidden');
    }

    // スコア・お金・時間
    els.score.textContent = state.score.toString();
    els.money.textContent = state.money.toString();

    const elapsedSec = Math.floor((currentFrame - state.gameStartFrame) / 60);
    const rawRemainingSec = state.timeLimitSec - elapsedSec;

    // ゲームオーバー・クリア以外（プレイ中・タイトル）は常に時間を更新
    if (state.gameState !== STATE.GAMEOVER && !state.gameCleared) {
        const displaySec = Math.max(0, rawRemainingSec);
        els.time.textContent = displaySec.toString();

        if (displaySec <= 10) els.time.classList.add('text-red-500');
        else els.time.classList.remove('text-red-500');
    } else {
        // ゲーム終了時
        // タイムアップで終わった場合は、0を表示する
        if (rawRemainingSec <= 0) {
            els.time.textContent = "0";
            els.time.classList.add('text-red-500');
        }
    }

    // ドリルバッテリー表示 (バーで可視化)
    const displayDrill = Math.max(0, state.drillUses);
    els.drillText.textContent = displayDrill.toString();

    // バッテリーのバーを生成
    els.drillBar.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const bar = document.createElement('div');
        bar.className = `flex-1 rounded h-full transition-all ${i < displayDrill ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-gray-700'}`;
        els.drillBar.appendChild(bar);
    }

    // HOLD描画
    if (state.holdMinoType) {
        renderMinoToHTML(els.hold, MINO_SHAPES[state.holdMinoType], MINO_COLORS[state.holdMinoType], state.holdBlockTypes);
    } else {
        els.hold.innerHTML = '';
    }

    // NEXT描画
    renderMinoToHTML(els.next, state.nextShape, MINO_COLORS[state.nextMinoType], state.nextBlockTypes);

    // ドリルボタンの状態変化
    const btnSpan = els.btnDrill.querySelector('span')!;
    if (state.gameState === STATE.DRILL) {
        els.btnDrill.classList.add('ring-4', 'ring-red-400', 'from-red-500', 'to-red-700');
        btnSpan.innerHTML = "ACTIVE!<br><span class='text-sm font-normal'>CLICK BLOCKS</span>";
    } else {
        els.btnDrill.classList.remove('ring-4', 'ring-red-400', 'from-red-500', 'to-red-700');
        btnSpan.innerHTML = "ACTIVATE<br>DRILL";
    }
};

export const setupDOMEvents = (state: GameState, startGameCallback: () => void) => {
    els.btnStart.addEventListener('click', () => {
        if (state.gameState === STATE.TITLE) {
            startGameCallback();
        }
    });

    els.btnRetry.addEventListener('click', () => {
        if (state.gameState === STATE.GAMEOVER || state.gameCleared) {
            state.gameState = STATE.TITLE;
            state.gameCleared = false; // フラグもリセット
        }
    });

    els.btnDrill.addEventListener('click', () => {
        els.btnDrill.blur();
        if (state.gameState === STATE.PLAY) state.gameState = STATE.DRILL;
        else if (state.gameState === STATE.DRILL) state.gameState = STATE.PLAY;
    });

    els.btnShopDrill.addEventListener('click', () => {
        els.btnDrill.blur();
        if (state.money >= 100) { state.money -= 100; state.drillUses += 3; }
    });

    els.btnShopTnt.addEventListener('click', () => {
        els.btnDrill.blur();
        if (state.money >= 1000) { state.money -= 1000; state.tntAmmo = 3; state.gameState = STATE.TNT; }
    });
};