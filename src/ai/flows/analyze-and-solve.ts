
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing and solving math problems,
 * accepting either a text description or an image of the problem.
 *
 * - analyzeAndSolve - A function that takes a math problem (text or image) and returns a step-by-step solution
 *                     along with the AI's interpretation of the problem.
 * - AnalyzeAndSolveInput - The input type for the analyzeAndSolve function.
 * - AnalyzeAndSolveOutput - The return type for the analyzeAndSolve function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeAndSolveInputSchema = z.object({
  problem: z
    .string()
    .optional()
    .describe('The math problem to be solved, as a text string. Optional if photoDataUri is provided.'),
  photoDataUri: z
    .string()
    .optional()
    .describe("A photo of the math problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. Optional if problem text is provided.")
}).superRefine((data, ctx) => {
  if (!data.problem && !data.photoDataUri) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Either a problem description (text) or a photo of the problem must be provided.",
    });
  }
});
export type AnalyzeAndSolveInput = z.infer<typeof AnalyzeAndSolveInputSchema>;

const AnalyzeAndSolveOutputSchema = z.object({
  analyzedProblem: z
    .string()
    .describe('The math problem that was identified and solved, either from the text input or extracted from the image.'),
  solution: z
    .string()
    .describe('A step-by-step solution to the math problem, explained in a way that is easy to understand. Use HTML <sup> tags for exponents (e.g., x<sup>2</sup>). For fractions, use a/b format.'),
});
export type AnalyzeAndSolveOutput = z.infer<typeof AnalyzeAndSolveOutputSchema>;

export async function analyzeAndSolve(input: AnalyzeAndSolveInput): Promise<AnalyzeAndSolveOutput> {
  if (!input.problem && !input.photoDataUri) {
    throw new Error("Either problem text or image must be provided.");
  }
  return analyzeAndSolveFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeAndSolvePrompt',
  input: {schema: AnalyzeAndSolveInputSchema},
  output: {schema: AnalyzeAndSolveOutputSchema},
  prompt: `You are an expert math tutor. Your goal is to help students understand how to solve math problems step by step.

{{#if problem}}
The problem has been provided as text:
Problem: {{{problem}}}
{{else if photoDataUri}}
The problem has been provided as an image. Analyze the image to identify the math problem.
Image: {{media url=photoDataUri}}
First, clearly state the math problem you identified from the image in the 'analyzedProblem' field.
{{/if}}

Then, provide a detailed, step-by-step solution to the identified math problem in the 'solution' field.
Format the solution for clear display:
- Use HTML &lt;sup&gt; tags for exponents (e.g., x&lt;sup&gt;2&lt;/sup&gt; for x squared).
- For fractions, use the format a/b (e.g., 1/2 for one half).
- Ensure each step is on a new line.

If the input was text, the 'analyzedProblem' field should contain that original problem text.
If the input was an image, the 'analyzedProblem' field must contain the problem statement you extracted from the image.
`,
});

const analyzeAndSolveFlow = ai.defineFlow(
  {
    name: 'analyzeAndSolveFlow',
    inputSchema: AnalyzeAndSolveInputSchema,
    outputSchema: AnalyzeAndSolveOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI failed to generate a response for analyzing the problem.");
    }
    // Ensure analyzedProblem is populated, especially if only text was provided
    if (input.problem && !output.analyzedProblem) {
      output.analyzedProblem = input.problem;
    }
    return output;
  }
);

