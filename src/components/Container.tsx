import { useEffect, useRef } from "react";
import { N } from "../training-gen";

export default function Container({
  canvasElement,
}: {
  canvasElement: HTMLCanvasElement;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let canvasToDraw = canvasElement;
    if (canvasElement.width === N || canvasElement.height === N) {
      const adjusted = document.createElement("canvas");
      adjusted.width = adjusted.height = N * 8;
      const adjCtx = adjusted.getContext("2d");
      adjCtx?.drawImage(canvasElement, 0, 0, N * 8, N * 8);

      canvasToDraw = adjusted;
    }
    containerRef.current?.appendChild(canvasToDraw);

    return () => canvasElement.remove();
  }, []);

  return <div ref={containerRef} />;
}
