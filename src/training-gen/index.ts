export const N = 32,
  GRID = 16,
  CELL = N / GRID;

export const SHAPES = [
  "circle",
  "square",
  "triangle",
  "diamond",
  "star",
] as const;

export const rnd = (a: number, b: number) => a + Math.random() * (b - a);

export type Shape = (typeof SHAPES)[number];

export interface Parameters {
  r: number;
  cx: number;
  cy: number;
}

export interface Hole {
  x: number;
  y: number;
  r: number;
}

export interface Cell {
  x: number;
  y: number;
  diff?: number;
}
