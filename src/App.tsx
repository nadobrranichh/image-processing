import { useRef } from "react";
import ResultDisplay from "./components/ResultDisplay";
import FileUpload from "./components/FileUpload";
import ProgressBox from "./components/ProgressBox";
import useImageStore from "./store/useImageStore";
import { randomParameters } from "./training-gen/drawing";
import { type Parameters } from "./training-gen";
import Benchmark from "./components/Benchmark";

function App() {
  const {
    referenceCanvas,
    setReferenceCanvas,
    analyzeCanvas,
    setAnalyzeCanvas,
    submit,
  } = useImageStore((state) => state);

  const parameters = useRef<Parameters>(randomParameters());

  return (
    <main className="p-5 lg:p-10 xl:px-70 xl:py-20  bg-linear-to-br from-rose-50 via-amber-50 to-blue-50 min-h-screen">
      <h2 className="text-3xl font-bold font-sans mb-3">
        Image defect recognition
      </h2>
      <p className="text-gray-600 mb-5 font-mono w-1/2">
        Upload an image of a shape and the app will tell if it has any holes,
        uneven edges or other defects.
      </p>
      <div className="w-full flex flex-col lg:grid lg:grid-cols-2 gap-8 mb-8">
        <FileUpload
          title="Reference Image"
          canvas={referenceCanvas}
          setCanvas={setReferenceCanvas}
          parameters={parameters.current}
        />
        <FileUpload
          title="Image to analyze"
          canvas={analyzeCanvas}
          setCanvas={setAnalyzeCanvas}
          parameters={parameters.current}
        />
      </div>
      <div className="mb-8">
        <button
          onClick={submit}
          disabled={!referenceCanvas || !analyzeCanvas}
          className={`w-full cursor-pointer text-white py-4 rounded-2xl text-xl font-bold ${!referenceCanvas || !analyzeCanvas ? "bg-slate-500" : "bg-slate-900"} hover:scale-105 active:scale-95 transition-all disabled:bg-slate-600 disabled:hover:scale-100 disabled:active:scale-100`}
        >
          Submit
        </button>
        {(!referenceCanvas || !analyzeCanvas) && (
          <p className="w-full text-center ">
            Select both images to start analyzing for defects.
          </p>
        )}
      </div>
      <ProgressBox />
      {analyzeCanvas && <ResultDisplay analyzedCanvas={analyzeCanvas} />}
      <Benchmark />
    </main>
  );
}

export default App;
