
'use server';

import { analyzeAndSolve, type AnalyzeAndSolveInput } from '@/ai/flows/analyze-and-solve';
import { generateWhiteboardPresentation } from '@/ai/flows/generate-whiteboard-presentation';
import { generateVoiceNarration } from '@/ai/flows/generate-voice-narration';
import type { SolutionData } from '@/types';

interface SolveProblemParams {
  problem?: string;
  imageDataUri?: string;
}

interface SolveProblemResult extends SolutionData {
  // any additional fields if necessary
}

export async function solveProblemAction(params: SolveProblemParams): Promise<SolveProblemResult> {
  try {
    if (!params.problem && !params.imageDataUri) {
      throw new Error("Either a problem statement or an image must be provided.");
    }

    // 1. Analyze and get solution steps (and the analyzed problem statement)
    const analysisInput: AnalyzeAndSolveInput = {};
    if (params.problem) analysisInput.problem = params.problem;
    if (params.imageDataUri) analysisInput.photoDataUri = params.imageDataUri;
    
    const analysisResult = await analyzeAndSolve(analysisInput);
    
    if (!analysisResult.analyzedProblem || !analysisResult.solution) {
        throw new Error("AI could not analyze the problem or generate a solution.");
    }
    const problemStatement = analysisResult.analyzedProblem;
    const rawSolutionSteps = analysisResult.solution.split('\n').filter(step => step.trim() !== '');

    if (rawSolutionSteps.length === 0) {
      throw new Error("Could not generate solution steps.");
    }
    
    // Prepare steps for presentation and narration, ensuring they are not too verbose for single calls
    const solutionSteps = rawSolutionSteps.map(step => step.substring(0, 1000)); // Truncate steps if too long for narration

    // 2. Generate whiteboard presentation (now text-based)
    const presentationResult = await generateWhiteboardPresentation({
      problem: problemStatement, 
      solutionSteps: solutionSteps,
    });

    // 3. Generate voice narration for each step
    const narrationTexts: string[] = [];
    for (const step of solutionSteps) { // Narrate based on the original solution steps
      const narrationResult = await generateVoiceNarration({ solutionSteps: step });
      narrationTexts.push(narrationResult.voiceNarration);
    }
    
    if (presentationResult.presentedSteps.length !== solutionSteps.length || narrationTexts.length !== solutionSteps.length) {
        console.warn("Mismatch in generated content lengths", {
            steps: solutionSteps.length,
            presentedSteps: presentationResult.presentedSteps.length,
            narrations: narrationTexts.length
        });
    }

    return {
      problemStatement, 
      solutionSteps, // The core, detailed solution steps
      whiteboardStepTexts: presentationResult.presentedSteps, // Textual steps for the whiteboard
      narrationTexts,
    };
  } catch (error) {
    console.error('Error in solveProblemAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while solving the problem.';
    throw new Error(`Failed to solve problem: ${errorMessage}`);
  }
}
