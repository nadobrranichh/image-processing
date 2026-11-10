import RefImage100PNG from "../assets/test/png/diamond-100.png";
import AnalyzeImage100PNG from "../assets/test/png/diamond-defected-100.png";
import RefImage10000PNG from "../assets/test/png/circle-10000.png";
import AnalyzeImage10000PNG from "../assets/test/png/circle-defected-10000.png";
import RefImage1000PNG from "../assets/test/png/square-1000.png";
import AnalyzeImage1000PNG from "../assets/test/png/square-defefcted-1000.png";
import RefImage4000PNG from "../assets/test/png/triangle-4000.png";
import AnalyzeImage4000PNG from "../assets/test/png/triangle-defected-4000.png";
import RefImage100JPEG from "../assets/test/jpeg/diamond-100.jpeg";
import AnalyzeImage100JPEG from "../assets/test/jpeg/diamond-defected-100.jpeg";
import RefImage10000JPEG from "../assets/test/jpeg/circle-10000.jpeg";
import AnalyzeImage10000JPEG from "../assets/test/jpeg/circle-defected-10000.jpeg";
import RefImage1000JPEG from "../assets/test/jpeg/square-1000.jpeg";
import AnalyzeImage1000JPEG from "../assets/test/jpeg/square-defefcted-1000.jpeg";
import RefImage4000JPEG from "../assets/test/jpeg/triangle-4000.jpeg";
import AnalyzeImage4000JPEG from "../assets/test/jpeg/triangle-defected-4000.jpeg";

interface ImagesStore {
  type: "png" | "jpeg";
  data: { resolution: number; reference: string; analyze: string }[];
}

export const benchmarkImagesPNG: ImagesStore = {
  type: "png",
  data: [
    { resolution: 100, reference: RefImage100PNG, analyze: AnalyzeImage100PNG },
    {
      resolution: 1000,
      reference: RefImage1000PNG,
      analyze: AnalyzeImage1000PNG,
    },
    {
      resolution: 4000,
      reference: RefImage4000PNG,
      analyze: AnalyzeImage4000PNG,
    },
    {
      resolution: 10000,
      reference: RefImage10000PNG,
      analyze: AnalyzeImage10000PNG,
    },
  ],
};

export const benchmarkImagesJPEG: ImagesStore = {
  type: "jpeg",
  data: [
    {
      resolution: 100,
      reference: RefImage100JPEG,
      analyze: AnalyzeImage100JPEG,
    },
    {
      resolution: 1000,
      reference: RefImage1000JPEG,
      analyze: AnalyzeImage1000JPEG,
    },
    {
      resolution: 4000,
      reference: RefImage4000JPEG,
      analyze: AnalyzeImage4000JPEG,
    },
    {
      resolution: 10000,
      reference: RefImage10000JPEG,
      analyze: AnalyzeImage10000JPEG,
    },
  ],
};
