export interface SwingMotion {
  messages: string[];
  scores: number[];
}

export interface SwingResults {
  toe_up: SwingMotion;
  backswing: SwingMotion;
  top: SwingMotion;
  downswing: SwingMotion;
  impact: SwingMotion;
  finish: SwingMotion;
  frames: number[];
  video: string | null;
}