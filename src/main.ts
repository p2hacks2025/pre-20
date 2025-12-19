import './style.css'
import p5 from 'p5'

// スケッチの定義（pはp5のインスタンス）
const sketch = (p: p5) => {
  p.setup = () => {
    // 親要素のサイズに合わせてキャンバスを作成
    const container = document.getElementById('app');
    const w = container?.clientWidth || p.windowWidth;
    const h = container?.clientHeight || p.windowHeight;
    p.createCanvas(w, h);
  };

  p.draw = () => {
    p.background(30); // ダークグレー背景

    // テスト描画: マウスに追従する円
    p.fill(255, 100, 100);
    p.noStroke();
    p.circle(p.mouseX, p.mouseY, 50);
  };

  p.windowResized = () => {
    // ウィンドウリサイズ時の対応
    const container = document.getElementById('app');
    if (container) {
      p.resizeCanvas(container.clientWidth, container.clientHeight);
    }
  };
};

// p5インスタンスの作成（第2引数にDOM要素を渡す）
new p5(sketch, document.getElementById('app')!);