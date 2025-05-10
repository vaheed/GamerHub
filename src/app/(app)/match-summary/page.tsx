"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Copy, Loader2, AlertTriangle, Sparkles, FileJson } from "lucide-react";
import React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { generateSummaryAction } from "./actions";
import { useToast } from "@/hooks/use-toast";

// Base structure for example data, date will be filled dynamically
const exampleMatchDataBase = {
  game: "CS:GO",
  map: "Dust II",
  // date: will be set dynamically by generateExampleJson
  durationMinutes: 45,
  teams: {
    teamA: {
      name: "Terrorists",
      score: 16,
      players: [
        { name: "Player1_T", kills: 25, deaths: 18, assists: 5, headshotPercentage: 0.45, mvps: 3 },
        { name: "Player2_T", kills: 20, deaths: 20, assists: 3, headshotPercentage: 0.30, mvps: 1 },
      ]
    },
    teamB: {
      name: "Counter-Terrorists",
      score: 12,
      players: [
        { name: "Player3_CT", kills: 22, deaths: 19, assists: 7, headshotPercentage: 0.50, mvps: 2 },
        { name: "Player4_CT", kills: 15, deaths: 22, assists: 4, headshotPercentage: 0.25, mvps: 0 },
      ]
    }
  },
  roundsPlayed: 28,
  keyEvents: [
    { round: 5, player: "Player1_T", action: "Triple kill with AK-47" },
    { round: 15, player: "Player3_CT", action: "1v2 clutch with AWP" },
    { round: 28, team: "Terrorists", action: "Won match by defusing bomb" }
  ]
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Summary
        </>
      )}
    </Button>
  );
}

export default function MatchSummaryPage() {
  const initialState = { summary: undefined, error: undefined, inputError: undefined };
  const [state, formAction] = useFormState(generateSummaryAction, initialState);
  // Initialize with a placeholder or empty string to avoid mismatch
  const [matchData, setMatchData] = React.useState<string>("Loading example data..."); 
  const { toast } = useToast();

  const generateExampleJsonWithDynamicDate = React.useCallback(() => {
    return JSON.stringify(
      {
        ...exampleMatchDataBase,
        date: new Date().toISOString(), // Dynamic date generated on client
      },
      null,
      2
    );
  }, []);

  React.useEffect(() => {
    // Set initial example data on client mount
    setMatchData(generateExampleJsonWithDynamicDate());
  }, [generateExampleJsonWithDynamicDate]);

  const handleCopySummary = () => {
    if (state.summary) {
      navigator.clipboard.writeText(state.summary);
      toast({ title: "Copied to clipboard!", description: "Summary copied successfully." });
    }
  };
  
  const handleUseExampleData = () => {
    // Use current date when button is clicked
    setMatchData(generateExampleJsonWithDynamicDate()); 
  };

  const isLoadingExampleData = matchData === "Loading example data...";

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
             <Bot className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">AI-Powered Match Summary</CardTitle>
              <CardDescription>
                Paste your JSON match data below to get an AI-generated summary.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="matchData" className="font-semibold flex items-center">
                  <FileJson className="mr-2 h-5 w-5 text-primary/80" />
                  Match Data (JSON)
                </Label>
                <Button type="button" variant="link" size="sm" onClick={handleUseExampleData} className="p-0 h-auto">
                  Use Example Data
                </Button>
              </div>
              <Textarea
                id="matchData"
                name="matchData"
                rows={12}
                placeholder='{ "game": "CS:GO", "score": "16-10", ... }'
                value={matchData}
                onChange={(e) => setMatchData(e.target.value)}
                className="font-mono text-xs bg-muted/30 focus:bg-card transition-colors"
                disabled={isLoadingExampleData}
              />
              {state?.inputError && (
                <p className="mt-2 text-sm text-destructive flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" /> {state.inputError}
                </p>
              )}
            </div>
            <SubmitButton />
          </CardContent>
        </form>
        
        {state?.error && (
          <CardFooter className="border-t pt-6">
            <div className="w-full p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/30">
              <div className="flex items-center font-semibold">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Error Generating Summary
              </div>
              <p className="text-sm mt-1">{state.error}</p>
            </div>
          </CardFooter>
        )}

        {state?.summary && (
          <CardFooter className="border-t pt-6 flex-col items-start gap-4">
            <div>
                <h3 className="text-lg font-semibold flex items-center text-primary">
                    <Sparkles className="mr-2 h-5 w-5"/>
                    Generated Summary
                </h3>
            </div>
            <div className="w-full p-4 rounded-md bg-muted/50 border relative group">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {state.summary}
              </pre>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCopySummary} 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Copy summary"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

