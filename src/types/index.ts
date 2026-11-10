export interface BenchmarkResult {
  resolution: number;
  uploadTime: {
    reference: number;
    analyze: number;
  };
  decodeTime: {
    reference: number;
    analyze: number;
  };
  resampleTime: {
    reference: number;
    analyze: number;
  };
  predictionTime: number;
}
