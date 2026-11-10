import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { SHAPES, type Parameters } from "../training-gen";
import { rnd } from "../training-gen/";
import { drawShape, randomHoles } from "../training-gen/drawing";
import { handleFile } from "../util";

export default function FileUpload({
  title,
  canvas,
  setCanvas,
  parameters,
}: {
  title: string;
  canvas: HTMLCanvasElement | null;
  setCanvas: (canvas: HTMLCanvasElement | null) => void;
  parameters: Parameters;
}) {
  const [imageType, setImageType] = useState<"select" | "custom">("select");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isAnalyze = title.includes("analyze");

  const openBrowser = () => inputRef.current?.click();

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile({ candidate: f, setCanvas, setError });
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile({ candidate: f, setCanvas, setError });
  };

  return (
    <div className="w-full rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
      <h2 className="text-white text-center text-xl font-bold mb-2">{title}</h2>
      {/* Header */}
      <div className="mb-4 flex items-center  gap-3">
        <h2
          className={`cursor-pointer text-lg font-semibold tracking-tight text-slate-50 `}
        >
          <span
            onClick={() => setImageType("select")}
            className={imageType === "select" ? "underline" : "text-slate-500"}
          >
            Select
          </span>{" "}
          /{" "}
          <span
            onClick={() => setImageType("custom")}
            className={imageType === "custom" ? "underline" : " text-slate-500"}
          >
            Upload
          </span>{" "}
          an image
        </h2>
        <span
          className={`ml-auto shrink-0 whitespace-nowrap rounded-full border px-2.5 font-mono text-[11px] transition-colors ${
            canvas
              ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-200"
              : "border-blue-400/35 bg-blue-500/15 text-blue-200"
          }`}
        ></span>
      </div>

      {/* Dropzone */}
      {!canvas && imageType === "custom" && (
        <div
          onClick={openBrowser}
          onDrop={onDrop}
          className={`flex cursor-pointer items-center gap-3.5 rounded-xl border border-dashed p-5 transition-colors border-slate-700 bg-slate-800/60 hover:border-slate-500 ${
            error && "border-red-400 bg-red-400/5"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-slate-700/70 text-sky-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4.5 w-4.5"
            >
              <path d="M12 3v12" />
              <path d="m7 8 5-5 5 5" />
              <path d="M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="mb-0.5 text-sm font-semibold text-slate-50">
              Drop an image here, or browse files
            </p>
            <p className="font-mono text-[10.5px] tracking-wide text-slate-500">
              BMP, JPG OR PNG · UP TO 20 MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".bmp,.jpg,.jpeg,.png,image/bmp,image/jpeg,image/png"
            onChange={onInputChange}
            className="hidden"
          />
        </div>
      )}

      {!canvas && imageType === "select" && (
        <div className="flex justify-evenly h-28">
          {SHAPES.map((shape) => {
            const canvas = drawShape(
              shape,
              isAnalyze ? randomHoles(rnd(1, 3)) : [],
              parameters,
            );

            return (
              <img
                key={shape}
                src={canvas.toDataURL()}
                onClick={() => setCanvas(canvas)}
              />
            );
          })}
        </div>
      )}

      <div
        className={`mt-3 flex min-h-4.5 items-center gap-2 text-[12.5px] ${
          error ? "text-red-400" : "text-slate-400"
        }`}
      >
        {error ?? (canvas ? "Ready to scan" : "No image selected yet")}
      </div>

      {canvas && (
        <>
          <div className="mt-3 flex items-center gap-3 rounded-[10px] border border-slate-700 bg-slate-800/60 p-2.5 mb-5">
            <img
              src={canvas.toDataURL()}
              className="h-11 w-11 shrink-0 rounded-md bg-slate-950 object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-slate-50">
                {/* {file.name} */}
                Image uploaded!
              </div>
            </div>
          </div>
          <button
            className="w-full py-3 text-center text-white bg-slate-800/60 rounded-[10px] cursor-pointer border border-slate-700"
            onClick={() => setCanvas(null)}
          >
            Select another image
          </button>
        </>
      )}
    </div>
  );
}
