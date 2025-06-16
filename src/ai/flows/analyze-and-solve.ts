'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing and solving math problems.
 *
 * - analyzeAndSolve - A function that takes a math problem as input and returns a step-by-step solution.
 * - AnalyzeAndSolveInput - The input type for the analyzeAndSolve function.
 * - AnalyzeAndSolveOutput - The return type for the analyzeAndSolve function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAndSolveInputSchema = z.object({
  problem: z
    .string()
    .describe('The math problem to be solved. This should be a valid math equation or word problem.'),
});
export type AnalyzeAndSolveInput = z.infer<typeof AnalyzeAndSolveInputSchema>;

const AnalyzeAndSolveOutputSchema = z.object({
  solution: z
    .string()
    .describe('A step-by-step solution to the math problem, explained in a way that is easy to understand.'),
});
export type AnalyzeAndSolveOutput = z.infer<typeof AnalyzeAndSolveOutputSchema>;

export async function analyzeAndSolve(input: AnalyzeAndSolveInput): Promise<AnalyzeAndSolveOutput> {
  return analyzeAndSolveFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAndSolvePrompt',
  input: {schema: AnalyzeAndSolveInputSchema},
  output: {schema: AnalyzeAndSolveOutputSchema},
  prompt: `You are an expert math tutor. Your goal is to help students understand how to solve math problems step by step.

  Please provide a detailed, step-by-step solution to the following math problem:

  Problem: {{{problem}}}

  Solution: `,
});

const analyzeAndSolveFlow = ai.defineFlow(
  {
    name: 'analyzeAndSolveFlow',
    inputSchema: AnalyzeAndSolveInputSchema,
    outputSchema: AnalyzeAndSolveOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
