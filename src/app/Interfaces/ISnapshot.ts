export interface Region {
    height: number;
    width: number;
    x: number;
    y: number;
  }
  
export interface Plate {
    code: string;
    region: Region;
    tag: string;
  }