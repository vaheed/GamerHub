"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeaderboardEntry, Player, Game } from "@/types"; // Assuming Game type is available
import { Filter, Globe, ShieldCheck, Star, Swords, Trophy, Users, AlertTriangle, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState, useCallback } from "react";
import { listLeaderboardRecords as fetchNakamaLeaderboard, getCurrentNakamaSession, logout } from "@/lib/nakama-client";
import { useRouter } from "next/navigation";


const gameFilters: (Game & { icon?: React.ReactNode })[] = [ // Adjusted type to match potential Game type
  { id: "all_games_lb", name: "All Games", icon: <Globe className="h-4 w-4 mr-2" />, imageUrl: "" }, // Example, adapt to your Nakama leaderboard IDs
  { id: "csgo_elo_lb", name: "CS:GO", imageUrl: "https://picsum.photos/seed/csgo/20/20" },
  { id: "dota2_wins_lb", name: "Dota 2", imageUrl: "https://picsum.photos/seed/dota2/20/20" },
  { id: "lol_kd_lb", name: "League of Legends", imageUrl: "https://picsum.photos/seed/lol/20/20" },
];

const metricFilters = [ // These might just control sorting/display if Nakama leaderboard is specific
  { id: "elo", name: "ELO Score", icon: <Star className="h-4 w-4 mr-2" />, nakamaLeaderboardId: "global_elo_leaderboard" }, // Example Nakama leaderboard ID
  { id: "wins", name: "Win Count", icon: <Trophy className="h-4 w-4 mr-2" />, nakamaLeaderboardId: "global_wins_leaderboard" },
  { id: "kd", name: "K/D Ratio", icon: <Swords className="h-4 w-4 mr-2" />, nakamaLeaderboardId: "global_kd_leaderboard" },
];

const regionFilters = [
  { id: "global", name: "Global", icon: <Globe className="h-4 w-4 mr-2" /> },
  // Other filters like Friends, NA, EU would require server-side logic in Nakama or client-side filtering if all data is fetched.
];


export default function LeaderboardsPage() {
  const router = useRouter();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedGameId, setSelectedGameId] = useState(gameFilters[0].id); // This might map to a leaderboard ID or a filter
  const [selectedMetric, setSelectedMetric] = useState(metricFilters[0]);
  const [selectedRegion, setSelectedRegion] = useState(regionFilters[0].id);
  const [cursor, setCursor] = useState<string | undefined>(undefined);


  const fetchLeaderboard = useCallback(async (newCursor?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Determine the actual Nakama leaderboard ID to query based on filters
      // For simplicity, using selectedMetric.nakamaLeaderboardId directly
      const leaderboardIdToFetch = selectedMetric.nakamaLeaderboardId;
      
      const records = await fetchNakamaLeaderboard(leaderboardIdToFetch, 15, newCursor);
      if (newCursor) {
        setLeaderboardData(prev => [...prev, ...records]);
      } else {
        setLeaderboardData(records);
      }
      // Nakama's listLeaderboardRecords returns a cursor for pagination
      // For this mock, we don't have it, but a real API would provide one.
      // setCursor(records.next_cursor); // Assuming `records` is the API response object
      
    } catch (err: any) {
      console.error("Failed to fetch leaderboard data:", err);
      setError(err.message || "Failed to load leaderboard.");
       if (err.message.includes("Session expired") || err.message.includes("Not authenticated")) {
            await logout();
            router.push("/");
        }
    } finally {
      setIsLoading(false);
    }
  }, [router, selectedMetric]);

  useEffect(() => {
    const session = getCurrentNakamaSession();
    if (!session) {
      router.push("/");
      return;
    }
    fetchLeaderboard(); // Initial fetch
  }, [fetchLeaderboard, router]);

  const handleMetricChange = (metricId: string) => {
    const newMetric = metricFilters.find(m => m.id === metricId);
    if (newMetric) {
      setSelectedMetric(newMetric);
      setCursor(undefined); // Reset cursor for new metric
      // fetchLeaderboard will be called by useEffect due to selectedMetric change
    }
  };
  
  const getScoreDisplay = (entry: LeaderboardEntry) => {
    // If Nakama score is always a number, no need to check selectedMetric type here.
    return entry.score.toLocaleString();
  };

  const handleLoadMore = () => {
    // In a real scenario with Nakama, you'd pass the `cursor` from the previous response.
    // The mock fetchNakamaLeaderboard might need to simulate this.
    fetchLeaderboard(cursor); 
  };

  const renderLeaderboardRows = () => {
    if (isLoading && leaderboardData.length === 0) { // Show skeletons only on initial load
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell className="text-center"><Skeleton className="h-6 w-6 mx-auto" /></TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </TableCell>
          <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
          <TableCell className="text-center hidden sm:table-cell"><Skeleton className="h-5 w-12 mx-auto" /></TableCell>
          <TableCell className="text-center hidden md:table-cell"><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
          <TableCell className="text-center hidden lg:table-cell"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
        </TableRow>
      ));
    }

    if (error) {
         return (
            <TableRow>
                <TableCell colSpan={6} className="text-center text-destructive py-10">
                    <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">Error Loading Leaderboard</p>
                    <p>{error}</p>
                </TableCell>
            </TableRow>
        );
    }

    if (leaderboardData.length === 0 && !isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
            <Trophy className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No Leaderboard Data</p>
            <p>Check back later or adjust your filters.</p>
          </TableCell>
        </TableRow>
      );
    }

    return leaderboardData.map((entry) => (
      <TableRow key={entry.player.id} className="hover:bg-muted/50">
        <TableCell className="font-bold text-lg text-center">
          {entry.rank === 1 && <Trophy className="h-6 w-6 text-yellow-400 inline-block" />}
          {entry.rank === 2 && <Trophy className="h-5 w-5 text-gray-400 inline-block" />}
          {entry.rank === 3 && <Trophy className="h-5 w-5 text-yellow-600 inline-block" />}
          {entry.rank > 3 && entry.rank}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/50">
              <AvatarImage src={entry.player.avatarUrl || `https://picsum.photos/seed/${entry.player.id}/40/40`} alt={entry.player.displayName || entry.player.username} data-ai-hint="leaderboard avatar" />
              <AvatarFallback>{(entry.player.displayName || entry.player.username).charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{entry.player.displayName || entry.player.username}</p>
              {/* Member since info would need to come from Nakama user.create_time */}
              <p className="text-xs text-muted-foreground">UID: {entry.player.id.substring(0,8)}...</p>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right font-semibold text-primary text-lg">{getScoreDisplay(entry)}</TableCell>
        {/* The following stats (ELO, Wins, K/D) might be part of the leaderboard record's metadata in Nakama,
            or you'd fetch them separately if the leaderboard only contains a score.
            For simplicity, assuming they might be part of `entry.player` or `entry.metadata` */}
        <TableCell className="text-center hidden sm:table-cell">{(entry.player as any).elo?.toLocaleString() || '-'}</TableCell>
        <TableCell className="text-center hidden md:table-cell">{(entry.player as any).wins?.toLocaleString() || '-'}</TableCell>
        <TableCell className="text-center hidden lg:table-cell">{(entry.player as any).kdRatio?.toFixed(2) || '-'}</TableCell>
      </TableRow>
    ));
  };


  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Trophy className="mr-3 h-7 w-7 text-primary" />
                Leaderboards
              </CardTitle>
              <CardDescription>See who&apos;s topping the charts across games and metrics.</CardDescription>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select value={selectedGameId} onValueChange={setSelectedGameId} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by game/leaderboard" />
              </SelectTrigger>
              <SelectContent>
                {gameFilters.map(filter => (
                  <SelectItem key={filter.id} value={filter.id}>
                    <div className="flex items-center">
                      {filter.icon || (filter.imageUrl && <Image src={filter.imageUrl} alt={filter.name} width={16} height={16} className="mr-2 rounded-sm" data-ai-hint={`${filter.name} icon small`} />)}
                      {filter.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMetric.id} onValueChange={handleMetricChange} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by metric" />
              </SelectTrigger>
              <SelectContent>
                {metricFilters.map(filter => (
                  <SelectItem key={filter.id} value={filter.id}>
                     <div className="flex items-center">
                      {filter.icon}
                      {filter.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={setSelectedRegion} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by region/scope" />
              </SelectTrigger>
              <SelectContent>
                {regionFilters.map(filter => (
                  <SelectItem key={filter.id} value={filter.id}>
                    <div className="flex items-center">
                      {filter.icon}
                      {filter.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] text-center">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">
                      {selectedMetric.name || "Score"}
                  </TableHead>
                  <TableHead className="text-center hidden sm:table-cell">ELO</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Wins</TableHead>
                  <TableHead className="text-center hidden lg:table-cell">K/D</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderLeaderboardRows()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {leaderboardData.length > 0 && !isLoading && ( // Show Load More only if not loading and data exists
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={handleLoadMore} disabled={isLoading || !cursor /* Disable if no next cursor */}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Load More Players
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

