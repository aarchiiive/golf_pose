export interface SwingMotion {
  messages: string[];
  scores: number[];
  video: string | null;
}

export interface SwingResults {
  toe_up: SwingMotion;
  backswing: SwingMotion;
  top: SwingMotion;
  downswing: SwingMotion;
  impact: SwingMotion;
  finish: SwingMotion;
}