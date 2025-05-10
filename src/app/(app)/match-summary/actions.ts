"use server";

import { summarizeMatchData, type SummarizeMatchDataInput } from "@/ai/flows/summarize-match-data";
import { z } from "zod";

const SummarizeActionInputSchema = z.object({
  matchData: z.string().min(1, "Match data cannot be empty."),
});

export async function generateSummaryAction(
  prevState: any,
  formData: FormData
): Promise<{ summary?: string; error?: string; inputError?: string }> {
  const validatedFields = SummarizeActionInputSchema.safeParse({
    matchData: formData.get("matchData"),
  });

  if (!validatedFields.success) {
    return {
      inputError: validatedFields.error.flatten().fieldErrors.matchData?.[0] || "Invalid input.",
    };
  }
  
  try {
    // Validate if matchData is valid JSON
    JSON.parse(validatedFields.data.matchData);
  } catch (e) {
    return {
      inputError: "Match data must be a valid JSON string.",
    };
  }

  try {
    const input: SummarizeMatchDataInput = {
      matchData: validatedFields.data.matchData,
    };
    const result = await summarizeMatchData(input);
    if (result.summary) {
      return { summary: result.summary };
    } else {
      return { error: "Failed to generate summary. The AI returned no content." };
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    return { error: "An unexpected error occurred while generating the summary." };
  }
}
