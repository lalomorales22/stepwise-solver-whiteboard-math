export interface SavedProblem {
  id: string;
  problemStatement: string;
  solutionSteps: string[];
  whiteboardStepTexts: string[]; // Changed from whiteboardImages
  narrationTexts: string[];
  createdAt: string; // ISO date string
}

export interface SolutionData {
  problemStatement: string;
  solutionSteps: string[];
  whiteboardStepTexts: string[]; // Changed from whiteboardImages
  narrationTexts: string[];
}
