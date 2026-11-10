import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { useState } from "react";
import {
  calculateStatistics,
  calculateTotalTime,
  startBenchmark,
} from "../util";
import { benchmarkImagesPNG } from "../lists/images";
import type { BenchmarkResult } from "../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const lineColors = ["#FF9100", "#76FF03", "#2979FF", "#FF5252", "#D500F9"];
const tableHeadings = [
  "Resolution, px",
  "Upload, ms",
  "Decode, ms",
  "Resample, ms",
  "Prediction, ms",
  "Total, ms",
];

export default function Benchmark() {
  const [benchmarkResults, setBenchmarkResults] = useState<{
    png: BenchmarkResult[][];
    jpeg: BenchmarkResult[][];
  }>({ png: [], jpeg: [] });

  const [activeTab, setActiveTab] = useState<{
    type: "png" | "jpeg";
    index: number;
  }>({ type: "png", index: 0 });

  const [isBenchmarkComplete, setIsBenchmarkComplete] = useState(true);

  function swapType() {
    setActiveTab((prev) => {
      const newType = prev.type === "png" ? "jpeg" : "png";

      if (benchmarkResults[newType].length > 0)
        return { type: newType, index: 0 };
      else return prev;
    });
  }

  return (
    <div className="w-full border border-gray-300 rounded-2xl p-5 shadow-xl bg-white">
      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold text-black">Benchmarking</p>
        <button
          onClick={() =>
            startBenchmark(setBenchmarkResults, setIsBenchmarkComplete)
          }
          className="cursor-pointer text-white py-2 px-4 rounded-lg bg-slate-900 hover:scale-105 active:scale-95 transition-all disabled:bg-slate-600 disabled:hover:scale-100 disabled:active:scale-100"
          disabled={!isBenchmarkComplete}
        >
          {isBenchmarkComplete ? "Start Process" : "In Progress..."}
        </button>
      </div>

      {benchmarkResults.png.length > 0 && (
        <>
          <div className="flex justify-between items-center mt-12 mb-3 gap-8">
            <p className="text-lg font-semibold text-black">Results: </p>
            <div className="flex gap-3 ml-auto items-center">
              <p>Type:</p>
              <button
                onClick={swapType}
                className="bg-slate-900 text-white p-1 px-3 rounded-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                {activeTab.type.toUpperCase()}
              </button>
            </div>
            <div className="flex gap-3 items-center">
              <p>Page:</p>
              <button
                className="bg-slate-900 text-white p-1 w-10 rounded-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                onClick={() =>
                  setActiveTab((prev) => ({
                    ...prev,
                    index: prev.index - 1 < 0 ? prev.index : prev.index - 1,
                  }))
                }
              >
                -
              </button>
              {activeTab.index + 1}
              <button
                className="bg-slate-900 text-white p-1 w-10 rounded-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                onClick={() =>
                  setActiveTab((prev) => ({
                    ...prev,
                    index:
                      prev.index + 1 >= benchmarkResults[activeTab.type].length
                        ? prev.index
                        : prev.index + 1,
                  }))
                }
              >
                +
              </button>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                {tableHeadings.map((th) => (
                  <th className="text-center" key={th + "th"}>
                    {th}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {benchmarkResults[activeTab.type][activeTab.index].map((res) => (
                <tr className="border-b" key={res.resolution + "tr"}>
                  <td className="text-center">
                    {res.resolution} x {res.resolution}
                  </td>
                  <td className="text-center">
                    <p>reference: {res.uploadTime.reference.toFixed(3)}</p>
                    <p>analyzed: {res.uploadTime.analyze.toFixed(3)}</p>
                  </td>
                  <td className="text-center">
                    <p>reference: {res.decodeTime.reference.toFixed(3)}</p>
                    <p>analyzed: {res.decodeTime.analyze.toFixed(3)}</p>
                  </td>
                  <td className="text-center">
                    <p>reference: {res.resampleTime.reference.toFixed(3)}</p>
                    <p>analyzed: {res.resampleTime.analyze.toFixed(3)}</p>
                  </td>
                  <td className="text-center">
                    {res.predictionTime.toFixed(3)}
                  </td>
                  <td className="text-center">
                    {calculateTotalTime(res).toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-12">
            <p className="text-lg font-semibold text-black">
              Total processing times on each launch:
            </p>
            <Line
              data={{
                labels: benchmarkImagesPNG.data.map(
                  (d) => `${d.resolution} x ${d.resolution}`,
                ),
                datasets: benchmarkResults[activeTab.type].map((result, i) => ({
                  label: `Launch ${i + 1}`,
                  data: result.map((r) => calculateTotalTime(r)),
                  borderColor: lineColors[i],
                })),
              }}
            />
          </div>
          {benchmarkResults[activeTab.type].length === 5 && (
            <table className="w-full mt-12">
              <thead>
                <tr className="border-b">
                  {[
                    "Resolution",
                    "Min Total, ms",
                    "Max Total, ms",
                    "Average Total, ms",
                  ].map((th) => (
                    <th className="text-center" key={th + "th"}>
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {calculateStatistics(benchmarkResults[activeTab.type]).map(
                  (stat) => (
                    <tr className="border-b" key={stat.resolution + "tr"}>
                      <td className="text-center">
                        {stat.resolution} x {stat.resolution}
                      </td>
                      <td className="text-center">{stat.min.toFixed(3)}</td>
                      <td className="text-center">{stat.max.toFixed(3)}</td>
                      <td className="text-center">{stat.avg.toFixed(3)}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}
          {benchmarkResults.png.length === 5 &&
            benchmarkResults.jpeg.length === 5 && (
              <div className="mt-12">
                <p className="text-lg font-semibold text-black">
                  Comparison of average processing times on images of different
                  formats:
                </p>
                <Line
                  data={{
                    labels: benchmarkImagesPNG.data.map(
                      (d) => `${d.resolution} x ${d.resolution}`,
                    ),
                    datasets: [
                      {
                        label: "PNG",
                        data: calculateStatistics(benchmarkResults.png).map(
                          (stat) => stat.avg,
                        ),
                        borderColor: lineColors[0],
                      },
                      {
                        label: "JPEG",
                        data: calculateStatistics(benchmarkResults.jpeg).map(
                          (stat) => stat.avg,
                        ),
                        borderColor: lineColors[2],
                      },
                    ],
                  }}
                />
              </div>
            )}
        </>
      )}
    </div>
  );
}
