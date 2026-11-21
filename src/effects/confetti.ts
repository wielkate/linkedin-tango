const PIECE_COUNT = 260;
const DURATION_MILLISECONDS = 5000;
const GRAVITY_PER_FRAME = 0.12;
const COLORS = [
  "#e4572e",
  "#f3a712",
  "#29335c",
  "#669bbc",
  "#2a9d8f",
  "#d65db1",
];

interface ConfettiPiece {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

// A short burst of falling confetti drawn on a full-screen canvas that ignores the mouse.
// The canvas exists only while the animation runs.
export class Confetti {
  private canvas: HTMLCanvasElement | null = null;

  launch(): void {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isAlreadyRunning = this.canvas !== null;

    if (prefersReducedMotion || isAlreadyRunning) {
      return;
    }

    const canvas = this.createCanvas();
    const context = canvas.getContext("2d");

    if (context === null) {
      canvas.remove();
      return;
    }

    this.canvas = canvas;
    this.animate(
      canvas,
      context,
      this.createPieces(canvas.width),
      performance.now(),
    );
  }

  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:10;";
    document.body.appendChild(canvas);
    return canvas;
  }

  private createPieces(canvasWidth: number): ConfettiPiece[] {
    return Array.from({ length: PIECE_COUNT }, () => ({
      x: Math.random() * canvasWidth,
      y: -30 - Math.random() * 400,
      velocityX: (Math.random() - 0.5) * 6,
      velocityY: 2 + Math.random() * 4,
      size: 16 + Math.random() * 14,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
    }));
  }

  private animate(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    pieces: ConfettiPiece[],
    startedAtMilliseconds: number,
  ): void {
    const elapsedMilliseconds = performance.now() - startedAtMilliseconds;

    if (elapsedMilliseconds > DURATION_MILLISECONDS) {
      canvas.remove();
      this.canvas = null;
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = Math.min(
      1,
      (DURATION_MILLISECONDS - elapsedMilliseconds) / 1000,
    );

    for (const piece of pieces) {
      this.movePiece(piece);
      this.drawPiece(context, piece);
    }

    requestAnimationFrame(() =>
      this.animate(canvas, context, pieces, startedAtMilliseconds),
    );
  }

  private movePiece(piece: ConfettiPiece): void {
    piece.velocityY += GRAVITY_PER_FRAME;
    piece.x += piece.velocityX;
    piece.y += piece.velocityY * 0.5;
    piece.rotation += piece.rotationSpeed;
  }

  private drawPiece(
    context: CanvasRenderingContext2D,
    piece: ConfettiPiece,
  ): void {
    context.save();
    context.translate(piece.x, piece.y);
    context.rotate(piece.rotation);
    context.fillStyle = piece.color;
    context.fillRect(
      -piece.size / 2,
      -piece.size / 3,
      piece.size,
      (piece.size * 2) / 3,
    );
    context.restore();
  }
}
