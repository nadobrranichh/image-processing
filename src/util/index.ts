import { N } from "../training-gen";

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
