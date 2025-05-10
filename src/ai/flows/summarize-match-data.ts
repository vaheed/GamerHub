'use server';
/**
 * @fileOverview Summarizes match data using an AI model. Allows players to quickly understand their performance.
 *
 * - summarizeMatchData - A function that summarizes the match data.
 * - SummarizeMatchDataInput - The input type for the summarizeMatchData function.
 * - SummarizeMatchDataOutput - The return type for the summarizeMatchData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMatchDataInputSchema = z.object({
  matchData: z.string().describe('JSON string containing the match data to summarize.'),
});
export type SummarizeMatchDataInput = z.infer<typeof SummarizeMatchDataInputSchema>;

const SummarizeMatchDataOutputSchema = z.object({
  summary: z.string().describe('A summary of the match, highlighting key moments and stats.'),
});
export type SummarizeMatchDataOutput = z.infer<typeof SummarizeMatchDataOutputSchema>;

export async function summarizeMatchData(input: SummarizeMatchDataInput): Promise<SummarizeMatchDataOutput> {
  return summarizeMatchDataFlow(input);
}

const summarizeMatchDataPrompt = ai.definePrompt({
  name: 'summarizeMatchDataPrompt',
  input: {schema: SummarizeMatchDataInputSchema},
  output: {schema: SummarizeMatchDataOutputSchema},
  prompt: `You are an AI assistant that summarizes match data for players.

  Given the following match data, create a concise summary highlighting key moments, player performance, and important statistics.

  Match Data:
  {{matchData}}
  `,
});

const summarizeMatchDataFlow = ai.defineFlow(
  {
    name: 'summarizeMatchDataFlow',
    inputSchema: SummarizeMatchDataInputSchema,
    outputSchema: SummarizeMatchDataOutputSchema,
  },
  async input => {
    const {output} = await summarizeMatchDataPrompt(input);
    return output!;
  }
);
