'use server';

import { analyzeAndSolve } from '@/ai/flows/analyze-and-solve';
import { generateWhiteboardPresentation } from '@/ai/flows/generate-whiteboard-presentation';
import { generateVoiceNarration } from '@/ai/flows/generate-voice-narration';
import type { SolutionData } from '@/types';

interface SolveProblemResult extends SolutionData {
  // any additional fields if necessary
}

export async function solveProblemAction(problemStatement: string): Promise<SolveProblemResult> {
  try {
    // 1. Analyze and get solution steps
    const analysisResult = await analyzeAndSolve({ problem: problemStatement });
    const rawSolutionSteps = analysisResult.solution.split('\n').filter(step => step.trim() !== '');

    if (rawSolutionSteps.length === 0) {
      throw new Error("Could not generate solution steps.");
    }
    
    // Prepare steps for presentation and narration, ensuring they are not too verbose for single calls
    const solutionSteps = rawSolutionSteps.map(step => step.substring(0, 500)); // Truncate steps if too long for individual narration/whiteboard generation

    // 2. Generate whiteboard presentation
    const presentationResult = await generateWhiteboardPresentation({
      problem: problemStatement,
      solutionSteps: solutionSteps,
    });

    // 3. Generate voice narration for each step
    const narrationTexts: string[] = [];
    for (const step of solutionSteps) {
      const narrationResult = await generateVoiceNarration({ solutionSteps: step });
      narrationTexts.push(narrationResult.voiceNarration);
    }
    
    if (presentationResult.whiteboardDataUris.length !== solutionSteps.length || narrationTexts.length !== solutionSteps.length) {
        console.warn("Mismatch in generated content lengths", {
            steps: solutionSteps.length,
            images: presentationResult.whiteboardDataUris.length,
            narrations: narrationTexts.length
        });
        // Pad arrays if necessary, or handle this discrepancy in the client
    }


    return {
      problemStatement,
      solutionSteps,
      whiteboardImages: presentationResult.whiteboardDataUris,
      narrationTexts,
    };
  } catch (error) {
    console.error('Error in solveProblemAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while solving the problem.';
    // It's better to throw the error and let the client handle it, or return an error object
    // For now, re-throwing allows the client to catch it via try/catch on the action call
    throw new Error(`Failed to solve problem: ${errorMessage}`);
  }
}
