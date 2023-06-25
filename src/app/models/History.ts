export interface History {
  c: string;
  s: number;
  a: Action;
  data: Coord[];
}

export interface Coord {
  sx: number;
  sy: number;
  x: number;
  y: number;
}

export enum Action {
  DRAW = 'DRAW',
  ERASER = 'ERASER',
  FILL = 'FILL'
}
