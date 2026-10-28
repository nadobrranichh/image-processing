import { NeuralNetwork } from "brain.js";
import type { INeuralNetworkData } from "brain.js/dist/neural-network";
import { CELL, GRID, N, SHAPES, type Shape } from ".";
import type { Parameters, Hole, Cell } from ".";

export const rnd = (a: number, b: number) => a + Math.random() * (b - a);

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

export function toFeatures(canvas: HTMLCanvasElement) {
  const d = canvas.getContext("2d")!.getImageData(0, 0, N, N).data;
  const f = [];
  for (let gy = 0; gy < GRID; gy++)
    for (let gx = 0; gx < GRID; gx++) {
      let s = 0;
      for (let y = 0; y < CELL; y++)
        for (let x = 0; x < CELL; x++) {
          const i = ((gy * CELL + y) * N + gx * CELL + x) * 4;
          s += (d[i] + d[i + 1] + d[i + 2]) / 3 / 255;
        }
      f.push(1 - s / (CELL * CELL));
    }
  return f;
}

function holesToMask(holes: Hole[]): number[] {
  const mask = new Array(GRID * GRID).fill(0);
  const s = CELL / 2;

  for (const h of holes) {
    for (let cy = 0; cy < GRID; cy++) {
      for (let cx = 0; cx < GRID; cx++) {
        const ccx = (cx + 0.5) * CELL;
        const ccy = (cy + 0.5) * CELL;

        const dx = Math.max(Math.abs(h.x - ccx) - s, 0);
        const dy = Math.max(Math.abs(h.y - ccy) - s, 0);
        if (Math.hypot(dx, dy) <= h.r) mask[cy * GRID + cx] = 1;
      }
    }
  }

  return mask;
}

function makeDefectRecongizerTrainPair(shape: Shape, defect: boolean) {
  const parameters = randomParameters();

  const holes = defect ? randomHoles(Math.floor(rnd(1, 4)), parameters) : [];

  const ref = drawShape(shape, [], parameters);
  const test = drawShape(shape, holes, parameters);

  const a = toFeatures(ref);
  const b = toFeatures(test);
  return {
    input: a.map((v, i) => v - b[i]),
    output: holesToMask(holes),
  };
}

async function trainRecognizer(
  iterations: number,
  callbackPeriod: number,
  callback: (status: { iterations: number; error: number }) => void,
  onPrepareData?: (value: number) => void,
) {
  const trainData = [];
  for (const [i, shape] of SHAPES.entries()) {
    for (let j = 0; j < 300; j++) {
      const pair = makeDefectRecongizerTrainPair(shape, j % 3 !== 0);
      trainData.push(pair);
    }
    onPrepareData?.(100 * ((i + 1) / SHAPES.length));
  }
  trainData.sort(() => Math.random() - 0.5);

  const net = new NeuralNetwork({ hiddenLayers: [128, 64] });
  await net.trainAsync(trainData, {
    iterations,
    errorThresh: 0.0005,
    callbackPeriod,
    callback,
  });

  return net;
}

export async function trainRecognizerAndSave() {
  const ITERATIONS = 500;
  const net = await trainRecognizer(ITERATIONS, ITERATIONS / 100, (status) =>
    console.log(status),
  );

  const blob = new Blob([JSON.stringify(net.toJSON())], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "defect-model.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function loadModel(
  onTrainProgress?: (fraction: number) => void,
): Promise<NeuralNetwork<INeuralNetworkData, INeuralNetworkData>> {
  const res = await fetch("src/models/defect-model-light.json");
  const net = new NeuralNetwork({ hiddenLayers: [128, 64] });
  net.fromJSON(await res.json());
  onTrainProgress?.(100);
  return net;
}

export async function trainRecognizerAndUse(
  onTrainProgress?: (fraction: number) => void,
  onPrepareProgress?: (fraction: number) => void,
) {
  const ITERATIONS = 20;
  const net = await trainRecognizer(
    ITERATIONS,
    ITERATIONS / 10,
    (status) => onTrainProgress?.((100 * status.iterations) / ITERATIONS),
    onPrepareProgress,
  );

  onTrainProgress?.(100);

  return net;
}

export async function predictDefects(
  referenceCanvas: HTMLCanvasElement,
  analyzeCanvas: HTMLCanvasElement,
  net?: NeuralNetwork<INeuralNetworkData, INeuralNetworkData>,
  threshold = 0.75,
) {
  if (!net) net = await loadModel();
  const referenceFeatures = toFeatures(referenceCanvas);
  const analyzeFeatures = toFeatures(analyzeCanvas);
  const diff = referenceFeatures.map((v, i) => v - analyzeFeatures[i]);
  const out = net.run(diff) as ArrayLike<number>;

  const cells: Cell[] = [];
  for (let i = 0; i < GRID * GRID; i++) {
    if (out[i] > threshold)
      cells.push({ x: i % GRID, y: Math.floor(i / GRID), diff: out[i] });
  }

  return cells;
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
