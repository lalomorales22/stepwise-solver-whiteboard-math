
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
  problem: z.string().describe('The math problem to solve.'), // This field is not currently used in the image generation loop.
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

// The whiteboardStepPrompt was unused and has been removed.
// The flow directly calls ai.generate for image creation.

const generateWhiteboardPresentationFlow = ai.defineFlow(
  {
    name: 'generateWhiteboardPresentationFlow',
    inputSchema: GenerateWhiteboardPresentationInputSchema,
    outputSchema: GenerateWhiteboardPresentationOutputSchema,
  },
  async input => {
    const whiteboardDataUris: string[] = [];
    for (const step of input.solutionSteps) {
      // Construct a more descriptive prompt for image generation
      const imagePrompt = `Create a clear, whiteboard-style drawing that visually represents the following math solution step: "${step}"`;
      
      const {media} = await ai.generate({
        // IMPORTANT: ONLY the googleai/gemini-2.0-flash-exp model is able to generate images. You MUST use exactly this model to generate images.
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: imagePrompt, // Use the refined, more descriptive prompt
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
        },
      });

      if (!media || !media.url) {
        // This handles cases where the API call might succeed but doesn't return a media URL.
        // The original error (400 Bad Request) suggests the API call itself was failing.
        console.error(`Image generation API call succeeded but no media URL was returned for step: "${step}" with prompt: "${imagePrompt}"`);
        throw new Error(`Failed to obtain image URL for step: ${step}. The image model did not return a valid image.`);
      }
      whiteboardDataUris.push(media.url);
    }
    return {whiteboardDataUris};
  }
);

