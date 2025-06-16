
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
  technicalStep: z // Renamed from solutionSteps
    .string()
    .describe('A single technical step of a math solution, which may include mathematical notation like x^2 or 2/3.'),
});

export type GenerateVoiceNarrationInput = z.infer<
  typeof GenerateVoiceNarrationInputSchema
>;

const GenerateVoiceNarrationOutputSchema = z.object({
  voiceNarration: z
    .string()
    .describe('The voice narration explaining the solution step, with mathematical symbols expanded into spoken words (e.g., "x squared", "two thirds").'),
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
  prompt: `You are a math tutor creating a voice narration script.
Given the following technical math solution step:
Technical Step: {{{technicalStep}}}

Rephrase this step into clear, natural-sounding language suitable for voice narration.
Expand all mathematical symbols and notations into words. For example:
- "x^2" or "x<sup>2</sup>" should become "x squared" or "x to the power of 2".
- "2/3" should become "two-thirds" or "two divided by three".
- "+" should become "plus".
- "=" should become "equals".
- Variables like 'x' or 'y' should be spoken as "ex" or "why".
Provide only the narrated text.`,
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
