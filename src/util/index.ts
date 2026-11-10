import type { Dispatch } from "react";
import { N } from "../training-gen";
import type { BenchmarkResult } from "../types";
import { benchmarkImagesJPEG, benchmarkImagesPNG } from "../lists/images";
import { loadModel, predictDefects } from "../training-gen/network";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_TYPES = ["image/bmp", "image/jpeg", "image/png"];

interface HandleFileArgs {
  candidate: File | null | undefined;
  setCanvas: (cv: HTMLCanvasElement | null) => void;
  setError?: (err: string | null) => void;
  track?: boolean;
}

export const handleFile = async ({
  candidate,
  setCanvas,
  setError,
  track = false,
}: HandleFileArgs) => {
  if (!candidate) return null;

  if (!ACCEPTED_TYPES.includes(candidate.type)) {
    setError?.("Unsupported format — use BMP, JPG or PNG.");
    setCanvas(null);
    return null;
  }
  if (candidate.size > MAX_BYTES) {
    setError?.("File is too large — 2 MB max.");
    setCanvas(null);
    return null;
  }

  setError?.(null);

  const times = {
    resample: { before: 0, after: 0 },
    decode: { before: 0, after: 0 },
  };
  const cv = document.createElement("canvas");
  cv.width = cv.height = N;
  const ctx = cv.getContext("2d")!;
  if (track) times.decode.before = performance.now();
  const image: ImageBitmap = await createImageBitmap(candidate, {
    resizeWidth: N,
    resizeHeight: N,
  });
  if (track) times.decode.after = performance.now();

  if (track) times.resample.before = performance.now();
  ctx.drawImage(image, 0, 0, N, N);
  if (track) times.resample.after = performance.now();
  setCanvas(cv);
  image.close();

  return track
    ? {
        decode: times.decode.after - times.decode.before,
        resample: times.resample.after - times.resample.before,
      }
    : null;
};

export async function imageUrlToFile(url: string, filename: string) {
  const before = performance.now();
  const response = await fetch(url);
  const blob = await response.blob();
  const after = performance.now();

  return {
    uploadTime: after - before,
    file: new File([blob], filename, {
      type: blob.type,
    }),
  };
}

export function calculateTotalTime(result: BenchmarkResult) {
  return (
    result.predictionTime +
    result.decodeTime.reference +
    result.decodeTime.analyze +
    result.resampleTime.reference +
    result.resampleTime.analyze +
    result.uploadTime.reference +
    result.uploadTime.analyze
  );
}

export function calculateStatistics(res: BenchmarkResult[][]) {
  const groupedResults: Record<number, BenchmarkResult[]> = {};
  res.forEach((arr) =>
    arr.forEach((el) => {
      if (groupedResults[el.resolution])
        groupedResults[el.resolution] = [...groupedResults[el.resolution], el];
      else groupedResults[el.resolution] = [el];
    }),
  );
  const entries = Object.entries(groupedResults);
  const stats = entries.map((arr) => ({
    resolution: arr[0],
    min: Math.min(...arr[1].map((el) => calculateTotalTime(el))),
    max: Math.max(...arr[1].map((el) => calculateTotalTime(el))),
    avg:
      arr[1].reduce((acc, cur) => (acc += calculateTotalTime(cur)), 0) /
      arr[1].length,
  }));
  return stats;
}

export async function startBenchmark(
  setBenchmarkResults: Dispatch<
    React.SetStateAction<{
      png: BenchmarkResult[][];
      jpeg: BenchmarkResult[][];
    }>
  >,
  setIsBenchmarkComplete: React.Dispatch<React.SetStateAction<boolean>>,
) {
  setIsBenchmarkComplete(false);
  setBenchmarkResults({ png: [], jpeg: [] });
  let referenceCanvas = null,
    analyzeCanvas = null;
  const setReferenceCanvas = (cv: HTMLCanvasElement | null) =>
    (referenceCanvas = cv);
  const setAnalyzeCanvas = (cv: HTMLCanvasElement | null) =>
    (analyzeCanvas = cv);

  const net = await loadModel();
  for (const benchmarkImages of [benchmarkImagesPNG, benchmarkImagesJPEG]) {
    for (let i = 0; i < 5; i++) {
      const resultTimes: BenchmarkResult[] = [];
      for (const { resolution, reference, analyze } of benchmarkImages.data) {
        const { uploadTime: refUploadTime, file: refFile } =
          await imageUrlToFile(reference, `reference-${resolution}.png`);
        const { uploadTime: analyzeUploadTime, file: analyzeFile } =
          await imageUrlToFile(analyze, `analyze-${resolution}.png`);

        const refHandleTimes = await handleFile({
          candidate: refFile,
          setCanvas: setReferenceCanvas,
          setError: undefined,
          track: true,
        });

        const analyzeHandleTimes = await handleFile({
          candidate: analyzeFile,
          setCanvas: setAnalyzeCanvas,
          setError: undefined,
          track: true,
        });

        if (!referenceCanvas || !analyzeCanvas) {
          console.log("CANVASES ARENT THERE");
          return;
        }
        const { predictionTime } = await predictDefects({
          referenceCanvas,
          analyzeCanvas,
          net,
          threshold: 0.75,
          track: true,
        });

        resultTimes.push({
          resolution,
          uploadTime: {
            reference: refUploadTime,
            analyze: analyzeUploadTime,
          },
          resampleTime: {
            reference: refHandleTimes!.resample!,
            analyze: analyzeHandleTimes!.resample!,
          },
          decodeTime: {
            reference: refHandleTimes!.decode!,
            analyze: analyzeHandleTimes!.decode!,
          },
          predictionTime: predictionTime!,
        });
      }
      setBenchmarkResults((prev) => ({
        ...prev,
        [benchmarkImages.type]: [...prev[benchmarkImages.type], resultTimes],
      }));
    }
  }
  setIsBenchmarkComplete(true);
}
