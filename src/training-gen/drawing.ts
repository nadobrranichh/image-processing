import { CELL, N, type Shape } from ".";
import { rnd } from ".";
import type { Cell, Hole, Parameters } from ".";

export function shapePath(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.beginPath();
  if (shape === "circle") {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    return;
  }
  const pts = [];
  if (shape === "star") {
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r; // чергуємо вершини й впадини
      pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
  } else {
    const n = shape === "triangle" ? 3 : 4;
    const start = shape === "square" ? Math.PI / 4 : -Math.PI / 2; // ромб = вершина вгору
    for (let i = 0; i < n; i++) {
      const a = start + (i * 2 * Math.PI) / n;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  }
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

export const randomParameters = () => ({
  r: rnd(8, 13),
  cx: N / 2 + rnd(-2, 2),
  cy: N / 2 + rnd(-2, 2),
});

export function randomHoles(
  count: number,
  p: Parameters = randomParameters(),
): Hole[] {
  const holes: Hole[] = [];
  for (let k = 0; k < count; k++)
    holes.push({
      x: p.cx + rnd(-p.r / 2, p.r / 2),
      y: p.cy + rnd(-p.r / 2, p.r / 2),
      r: rnd(1.5, 3),
    });
  return holes;
}

export function drawShape(shape: Shape, holes: Hole[], p?: Parameters) {
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, N, N);

  const { r, cx, cy } = p ? p : randomParameters();

  ctx.fillStyle = "#000";
  shapePath(ctx, shape, cx, cy, r);
  ctx.fill();

  ctx.fillStyle = "#fff";
  for (const h of holes) {
    ctx.beginPath();
    ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
    ctx.fill();
  }

  return c;
}

export function highlight(
  ctx: CanvasRenderingContext2D,
  cells: Cell[],
  scale = 1,
) {
  // scale = розмір відображення / N
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  for (const c of cells)
    ctx.strokeRect(
      c.x * CELL * scale,
      c.y * CELL * scale,
      CELL * scale,
      CELL * scale,
    );
}

export function highlightCellInRegion(
  canvas: HTMLCanvasElement,
  cell: Cell,
  region = 7,
  outSize = 256,
) {
  const half = Math.floor(region / 2);

  const sx = (cell.x - half) * CELL;
  const sy = (cell.y - half) * CELL;
  const sSize = region * CELL;

  const out = document.createElement("canvas");
  out.width = out.height = outSize;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(canvas, sx, sy, sSize, sSize, 0, 0, outSize, outSize);

  // рамка навколо центральної клітинки
  const k = outSize / region; // розмір однієї клітинки у виході
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.strokeRect(half * k, half * k, k, k);

  return out;
}
