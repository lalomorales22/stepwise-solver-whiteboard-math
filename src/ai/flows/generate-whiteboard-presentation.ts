// src/ai/flows/generate-whiteboard-presentation.ts
'use server';

/**
 * @fileOverview Generates a whiteboard presentation for a math problem solution.
 *
 * - generateWhiteboardPresentation - A function that generates a whiteboard presentation for a math problem solution.
 * - GenerateWhiteboardPresentationInput - The input type for the generateWhiteboardPresentation function.
 * - GenerateWhiteboardPresentationOutput - The return type for the generateWhiteboardPresentation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWhiteboardPresentationInputSchema = z.object({
  problem: z.string().describe('The math problem to solve.'),
  solutionSteps: z.array(z.string()).describe('The step-by-step solution to the problem.'),
});
export type GenerateWhiteboardPresentationInput = z.infer<typeof GenerateWhiteboardPresentationInputSchema>;

const GenerateWhiteboardPresentationOutputSchema = z.object({
  whiteboardDataUris: z.array(z.string()).describe('Array of data URIs for whiteboard images, one per step.'),
});
export type GenerateWhiteboardPresentationOutput = z.infer<typeof GenerateWhiteboardPresentationOutputSchema>;

export async function generateWhiteboardPresentation(
  input: GenerateWhiteboardPresentationInput
): Promise<GenerateWhiteboardPresentationOutput> {
  return generateWhiteboardPresentationFlow(input);
}

const whiteboardStepPrompt = ai.definePrompt({
  name: 'whiteboardStepPrompt',
  input: {schema: z.object({step: z.string()})},
  output: {schema: z.object({whiteboardDataUri: z.string()})},
  prompt: `Create a whiteboard drawing that visually represents the following step in solving a math problem. The image should focus on clarity and be suitable for a whiteboard animation. Return the image as a data URI.

Step: {{{step}}}

Data URI: {{media url=whiteboardDataUri}}`,
});

const generateWhiteboardPresentationFlow = ai.defineFlow(
  {
    name: 'generateWhiteboardPresentationFlow',
    inputSchema: GenerateWhiteboardPresentationInputSchema,
    outputSchema: GenerateWhiteboardPresentationOutputSchema,
  },
  async input => {
    const whiteboardDataUris: string[] = [];
    for (const step of input.solutionSteps) {
      const {media} = await ai.generate({
        // IMPORTANT: ONLY the googleai/gemini-2.0-flash-exp model is able to generate images. You MUST use exactly this model to generate images.
        model: 'googleai/gemini-2.0-flash-exp',

        prompt: step,

        config: {
          responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
        },
      });
      whiteboardDataUris.push(media.url!);
    }
    return {whiteboardDataUris};
  }
);
