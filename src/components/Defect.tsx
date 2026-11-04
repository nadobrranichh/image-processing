import { useEffect, useRef } from "react";
import { type Cell } from "../training-gen";
import { highlightCellInRegion } from "../training-gen/drawing";

export default function Defect({
  analyzedCanvas,
  data,
}: {
  analyzedCanvas: HTMLCanvasElement;
  data: Cell;
}) {
  const contanerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const highlighted = highlightCellInRegion(analyzedCanvas, data, 7, 96);
    contanerRef.current?.appendChild(highlighted);
  }, []);
  return (
    <div className="flex flex-col gap-2 items-center text-center border rounded-xl border-gray-300 px-4 py-2">
      <h2 className="text-lg font-semibold">Hole in the shape</h2>
      <div className="aspect-square text-center border" ref={contanerRef}></div>
      <p>{(data.diff! * 100).toFixed(2)}% certainty</p>
    </div>
  );
}
