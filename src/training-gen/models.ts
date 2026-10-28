import { NeuralNetwork } from "brain.js";
import type { INeuralNetworkData } from "brain.js/dist/neural-network";

export function downloadModel(
  net: NeuralNetwork<INeuralNetworkData, INeuralNetworkData>,
) {
  const blob = new Blob([JSON.stringify(net.toJSON())], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "defect-model.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function loadModel(): Promise<
  NeuralNetwork<INeuralNetworkData, INeuralNetworkData>
> {
  const res = await fetch("/defect-model.json");
  const net = new NeuralNetwork({ hiddenLayers: [128, 64] });
  net.fromJSON(await res.json());
  return net;
}
