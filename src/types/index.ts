export interface SavedProblem {
  id: string;
  problemStatement: string;
  solutionSteps: string[];
  whiteboardImages: string[];
  narrationTexts: string[];
  createdAt: string; // ISO date string
}

export interface SolutionData {
  problemStatement: string;
  solutionSteps: string[];
  whiteboardImages: string[];
  narrationTexts: string[];
}
