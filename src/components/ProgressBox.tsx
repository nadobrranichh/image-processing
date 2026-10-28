import { useEffect, useState } from "react";
import useImageStore from "../store/useImageStore";
import {
  highlight,
  loadModel,
  predictDefects,
  trainRecognizerAndUse,
} from "../training-gen/shapes";
import { N } from "../training-gen";
import { useProgressStore } from "../store/useProgressStore";

export default function ProgressBox() {
  const {
    hasSubmitted,
    referenceCanvas,
    analyzeCanvas,
    setDefects,
    setResultCanvas,
  } = useImageStore((state) => state);
  const {
    preparation,
    setPreparation,
    training,
    setTraining,
    finding,
    setFinding,
    reset,
  } = useProgressStore();
  const [isUseTrainedModel, setIsUseTrainedModel] = useState(false);

  const steps = [
    { name: "Preparing Data", value: preparation, weight: 0.05 },
    { name: "Training model", value: training, weight: 0.85 },
    { name: "Looking for defects", value: finding, weight: 0.1 },
  ];
  const percentage = steps.reduce(
    (acc, { value, weight }) => acc + value * weight,
    0,
  );

  async function analyzeForDefects() {
    reset();
    let net;
    if (isUseTrainedModel) {
      setPreparation(100);
      net = await loadModel(setTraining);
    } else net = await trainRecognizerAndUse(setTraining, setPreparation);

    const cells = await predictDefects(referenceCanvas!, analyzeCanvas!, net);
    setFinding(100);
    setDefects(cells.toSorted((a, b) => b.diff! - a.diff!));
    const defectsView = document.createElement("canvas");
    defectsView.width = defectsView.height = N * 8;
    const vctx = defectsView.getContext("2d")!;
    vctx.imageSmoothingEnabled = false;
    vctx.drawImage(analyzeCanvas!, 0, 0, defectsView.width, defectsView.height);
    highlight(vctx, cells, 8);
    setResultCanvas(defectsView);
  }

  useEffect(() => {
    if (hasSubmitted && analyzeCanvas && referenceCanvas) analyzeForDefects();
  }, [hasSubmitted, analyzeCanvas, referenceCanvas]);

  return (
    <div className="w-full mb-8 p-5 border border-gray-300 rounded-2xl shadow-xl bg-white">
      <div className="flex justify-between mb-4 items-center">
        <p className="text-lg font-semibold text-black">Analysis</p>
        <div className="flex gap-2">
          <div>Use a trained model?</div>{" "}
          <input
            type="checkbox"
            onChange={(e) => setIsUseTrainedModel(e.target.checked)}
          />
        </div>
      </div>
      <div className="flex justify-between mb-2">
        <p className="text-sm text-black">ENTER STATUS</p>
        <p className="text-sm font-mono">{percentage} %</p>
      </div>
      <div
        className="relative h-3 rounded-full bg-gray-200 mb-4 after:content-[''] after:absolute after:top-0 after:bottom-0 after:left-0 after:bg-slate-900 after:w-[var(--fill)] after:rounded-full"
        style={
          {
            "--fill": `${percentage}%`,
            transition: "all 0.2s ease",
          } as React.CSSProperties
        }
      ></div>
      <div className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <div key={step.name} className="flex gap-2">
            <div
              className={`rounded-[50%] w-6 aspect-square  flex justify-center items-center 
                ${step.value === 100 ? "bg-green-200 text-green-600" : "bg-gray-200 text-sm text-gray-600"}`}
            >
              {i + 1}
            </div>
            <p>{step.name}</p>
            <p className="ml-auto font-mono text-sm text-gray-500">
              {step.value}%
            </p>
            <p></p>
          </div>
        ))}
      </div>
    </div>
  );
}
