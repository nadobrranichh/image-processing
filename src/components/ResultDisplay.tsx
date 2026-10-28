import useImageStore from "../store/useImageStore";
import Container from "./Container";
import Defect from "./Defect";

export default function ResultDisplay({
  analyzedCanvas,
}: {
  analyzedCanvas: HTMLCanvasElement;
}) {
  const { defects, referenceCanvas, analyzeCanvas, resultCanvas } =
    useImageStore((state) => state);

  return (
    <div className="w-full border border-gray-300 rounded-2xl p-5 shadow-xl bg-white">
      <div className="flex items-center justify-between mb-5">
        <p className="font-semibold">Found defects</p>
        <span className="rounded-full border border-gray-300 bg-gray-200 px-2.5 font-mono text-[11px] ">
          {defects ? "Done" : "Awaiting analysis"}
        </span>
      </div>
      <div
        className={`rounded-2xl border border-gray-300 ${defects && defects.length > 0 ? "flex flex-wrap justify-evenly gap-4 p-5 " : "py-10"}`}
      >
        {defects ? (
          defects.length > 0 ? (
            defects.map((defect) => (
              <Defect
                key={`${defect.x} + ${defect.y}`}
                analyzedCanvas={analyzedCanvas}
                data={defect}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 font-semibold">
              The process hasn't identified any defects on the image provided.
            </p>
          )
        ) : (
          <>
            <p className="text-center text-gray-500 font-semibold">
              No results yet. Upload the images to start a scan.
            </p>
            <p className="text-gray-500 text-center text-sm">
              each finding will show its type, location and match
            </p>
          </>
        )}
      </div>
      <div className="flex justify-evenly">
        {referenceCanvas && <Container canvasElement={referenceCanvas} />}
        {analyzeCanvas && <Container canvasElement={analyzeCanvas} />}
        {resultCanvas && <Container canvasElement={resultCanvas} />}
      </div>
    </div>
  );
}
