
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
    // These are the steps formatted for display (e.g., with <sup> tags)
    const displaySolutionSteps = analysisResult.solution.split('\n').filter(step => step.trim() !== '');

    if (displaySolutionSteps.length === 0) {
      throw new Error("Could not generate solution steps.");
    }
    
    // 2. Generate whiteboard presentation (text-based using display steps)
    const presentationResult = await generateWhiteboardPresentation({
      problem: problemStatement, 
      solutionSteps: displaySolutionSteps, // Use display steps for whiteboard
    });

    // 3. Generate voice narration for each step, using display steps as input to get speakable versions
    const narrationTexts: string[] = [];
    for (const step of displaySolutionSteps) { 
      // Truncate input to generateVoiceNarration if too long, to avoid issues with TTS or narration model limits.
      // The narration model is expected to make this speakable, not just echo it.
      const stepForNarration = step.substring(0, 1000); 
      const narrationResult = await generateVoiceNarration({ technicalStep: stepForNarration });
      narrationTexts.push(narrationResult.voiceNarration);
    }
    
    if (presentationResult.presentedSteps.length !== displaySolutionSteps.length || narrationTexts.length !== displaySolutionSteps.length) {
        console.warn("Mismatch in generated content lengths", {
            steps: displaySolutionSteps.length,
            presentedSteps: presentationResult.presentedSteps.length,
            narrations: narrationTexts.length
        });
    }

    return {
      problemStatement, 
      solutionSteps: displaySolutionSteps, // These are the steps for display (e.g. on whiteboard)
      whiteboardStepTexts: presentationResult.presentedSteps, // Textual steps for the whiteboard (same as solutionSteps)
      narrationTexts, // Speakable versions of each step
    };
  } catch (error) {
    console.error('Error in solveProblemAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while solving the problem.';
    throw new Error(`Failed to solve problem: ${errorMessage}`);
  }
}
