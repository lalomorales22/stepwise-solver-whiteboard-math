// src/ai/flows/generate-whiteboard-presentation.ts
'use server';

/**
 * @fileOverview Prepares solution steps for textual display on a whiteboard.
 *
 * - generateWhiteboardPresentation - A function that takes solution steps and prepares them for display.
 * - GenerateWhiteboardPresentationInput - The input type for the generateWhiteboardPresentation function.
 * - GenerateWhiteboardPresentationOutput - The return type for the generateWhiteboardPresentation function.
 */

// ai object from genkit is no longer needed here as no AI call or flow definition is made in this file.
import {z} from 'genkit';

const GenerateWhiteboardPresentationInputSchema = z.object({
  problem: z.string().describe('The math problem to solve.'),
  solutionSteps: z.array(z.string()).describe('The step-by-step solution to the problem.'),
});
export type GenerateWhiteboardPresentationInput = z.infer<typeof GenerateWhiteboardPresentationInputSchema>;

const GenerateWhiteboardPresentationOutputSchema = z.object({
  presentedSteps: z.array(z.string()).describe('Array of textual solution steps formatted for whiteboard display.'),
});
export type GenerateWhiteboardPresentationOutput = z.infer<typeof GenerateWhiteboardPresentationOutputSchema>;

export async function generateWhiteboardPresentation(
  input: GenerateWhiteboardPresentationInput
): Promise<GenerateWhiteboardPresentationOutput> {
  // This function simply passes the solution steps through for textual display.
  // No AI call is made here.
  return { presentedSteps: input.solutionSteps };
}

// The ai.defineFlow block has been completely removed from this file
// to ensure no AI model is invoked or flow registered by this module.
// The exported async function generateWhiteboardPresentation is called directly
// from solverActions.ts and performs no AI operations.
