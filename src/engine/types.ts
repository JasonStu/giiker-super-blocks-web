export type BlockColor = 'red' | 'yellow' | 'blue' | 'green';

export type BlockId =
  | 'r1' | 'r2' | 'r3' | 'r4'
  | 'y1' | 'y2' | 'y3' | 'y4'
  | 'b1' | 'b2' | 'b3' | 'b4'
  | 'g1' | 'g2' | 'g3' | 'g4';

export type Coord = [number, number]; // [x, y] where 0 <= x, y < 8

export interface BlockDefinition {
  id: BlockId;
  color: BlockColor;
  name: string;
  cells: Coord[];
}

export interface PlacedBlock {
  id: BlockId;
  color: BlockColor;
  rootX: number; // grid x anchor
  rootY: number; // grid y anchor
  rotation: 0 | 1 | 2 | 3; // 0=0°, 1=90°, 2=180°, 3=270°
  cells: Coord[]; // absolute grid coords [[x, y], ...]
}
