// src/ai/flows/generate-whiteboard-presentation.ts
'use server';

/**
 * @fileOverview Prepares solution steps for textual display on a whiteboard.
 *
 * - generateWhiteboardPresentation - A function that takes solution steps and prepares them for display.
 * - GenerateWhiteboardPresentationInput - The input type for the generateWhiteboardPresentation function.
 * - GenerateWhiteboardPresentationOutput - The return type for the generateWhiteboardPresentation function.
 */

import {ai} from '@/ai/genkit'; // ai object might not be needed if no AI call is made
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
  // For now, we simply pass the solution steps through.
  // In the future, an AI could be used here to rephrase or format steps specifically for a text-based whiteboard.
  return { presentedSteps: input.solutionSteps };
}

// The flow definition can be simplified or removed if no AI call is made.
// If we keep it for potential future AI formatting:
const generateWhiteboardPresentationFlow = ai.defineFlow(
  {
    name: 'generateWhiteboardPresentationFlow',
    inputSchema: GenerateWhiteboardPresentationInputSchema,
    outputSchema: GenerateWhiteboardPresentationOutputSchema,
  },
  async input => {
    // Currently, this flow just passes the steps through.
    // No direct AI call here to avoid image generation costs/limits.
    // If AI-based text formatting were desired in the future, it would go here.
    return { presentedSteps: input.solutionSteps };
  }
);
