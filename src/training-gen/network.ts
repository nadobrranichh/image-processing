import { NeuralNetwork } from "brain.js";
import type { INeuralNetworkData } from "brain.js/dist/neural-network";
import { CELL, GRID, N, SHAPES, rnd } from ".";
import type { Hole, Cell, Shape } from ".";
import { randomParameters, randomHoles, drawShape } from "./drawing";

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

export function downloadModel(
  net: NeuralNetwork<INeuralNetworkData, INeuralNetworkData>,
) {
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
  let net;

  try {
    const res = await fetch("src/models/defect-model-light.json");
    const data = await res.json();
    net = new NeuralNetwork({ hiddenLayers: [128, 64] });
    net.fromJSON(data);
  } catch (error) {
    net = await trainRecognizerAndUse(onTrainProgress);
  }

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

interface PredictArgs {
  referenceCanvas: HTMLCanvasElement;
  analyzeCanvas: HTMLCanvasElement;
  net?: NeuralNetwork<INeuralNetworkData, INeuralNetworkData>;
  threshold?: number;
  track?: boolean;
}

export async function predictDefects({
  referenceCanvas,
  analyzeCanvas,
  net,
  threshold = 0.75,
  track,
}: PredictArgs) {
  if (!net) net = await loadModel();

  const times = { before: 0, after: 0 };

  const referenceFeatures = toFeatures(referenceCanvas);
  const analyzeFeatures = toFeatures(analyzeCanvas);
  const diff = referenceFeatures.map((v, i) => v - analyzeFeatures[i]);

  if (track) times.before = performance.now();
  const out = net.run(diff) as ArrayLike<number>;
  const cells: Cell[] = [];
  for (let i = 0; i < GRID * GRID; i++) {
    if (out[i] > threshold)
      cells.push({ x: i % GRID, y: Math.floor(i / GRID), diff: out[i] });
  }
  if (track) times.after = performance.now();

  return {
    cells,
    ...(track && {
      predictionTime: times.after - times.before,
    }),
  };
}
