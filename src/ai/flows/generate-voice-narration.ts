// src/ai/flows/generate-voice-narration.ts
'use server';

/**
 * @fileOverview Generates voice narration for the solution steps of a math problem.
 *
 * - generateVoiceNarration - A function that generates voice narration for the solution steps.
 * - GenerateVoiceNarrationInput - The input type for the generateVoiceNarration function.
 * - GenerateVoiceNarrationOutput - The return type for the generateVoiceNarration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVoiceNarrationInputSchema = z.object({
  solutionSteps: z
    .string()
    .describe('The step-by-step solution of the math problem.'),
});

export type GenerateVoiceNarrationInput = z.infer<
  typeof GenerateVoiceNarrationInputSchema
>;

const GenerateVoiceNarrationOutputSchema = z.object({
  voiceNarration: z
    .string()
    .describe('The voice narration explaining the solution steps.'),
});

export type GenerateVoiceNarrationOutput = z.infer<
  typeof GenerateVoiceNarrationOutputSchema
>;

export async function generateVoiceNarration(
  input: GenerateVoiceNarrationInput
): Promise<GenerateVoiceNarrationOutput> {
  return generateVoiceNarrationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVoiceNarrationPrompt',
  input: {schema: GenerateVoiceNarrationInputSchema},
  output: {schema: GenerateVoiceNarrationOutputSchema},
  prompt: `You are a math tutor who explains math problems in voice narration.

  Solution Steps: {{{solutionSteps}}}
  Create voice narration to explain the solution steps.`, // Changed the prompt to follow the Zeus model.
});

const generateVoiceNarrationFlow = ai.defineFlow(
  {
    name: 'generateVoiceNarrationFlow',
    inputSchema: GenerateVoiceNarrationInputSchema,
    outputSchema: GenerateVoiceNarrationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
