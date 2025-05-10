"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LeaderboardEntry, Player } from "@/types";
import { Filter, Globe, ShieldCheck, Star, Swords, Trophy, Users } from "lucide-react";
import Image from "next/image";
import React from "react";

const mockPlayers: Player[] = Array.from({ length: 15 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `Player${String.fromCharCode(65 + i)}${i + 10}`,
  avatarUrl: `https://picsum.photos/seed/leader${i}/40/40`,
  elo: 2200 - i * 50,
  kdRatio: 2.5 - i * 0.1,
  wins: 300 - i * 10,
}));

const mockLeaderboard: LeaderboardEntry[] = mockPlayers.map((player, index) => ({
  rank: index + 1,
  player,
  score: player.elo, // Default to ELO
}));

const gameFilters = [
  { id: "all", name: "All Games", icon: <Globe className="h-4 w-4 mr-2" /> },
  { id: "csgo", name: "CS:GO", imageUrl: "https://picsum.photos/seed/csgo/20/20" },
  { id: "dota2", name: "Dota 2", imageUrl: "https://picsum.photos/seed/dota2/20/20" },
  { id: "lol", name: "League of Legends", imageUrl: "https://picsum.photos/seed/lol/20/20" },
];

const metricFilters = [
  { id: "elo", name: "ELO Score", icon: <Star className="h-4 w-4 mr-2" /> },
  { id: "wins", name: "Win Count", icon: <Trophy className="h-4 w-4 mr-2" /> },
  { id: "kd", name: "K/D Ratio", icon: <Swords className="h-4 w-4 mr-2" /> },
];

const regionFilters = [
  { id: "global", name: "Global", icon: <Globe className="h-4 w-4 mr-2" /> },
  { id: "friends", name: "Friends", icon: <Users className="h-4 w-4 mr-2" /> },
  { id: "na", name: "North America", },
  { id: "eu", name: "Europe", },
];


export default function LeaderboardsPage() {
  const [leaderboardData, setLeaderboardData] = React.useState(mockLeaderboard);
  const [selectedMetric, setSelectedMetric] = React.useState(metricFilters[0].id);

  // TODO: Implement actual filtering logic based on selections
  const handleMetricChange = (metricId: string) => {
    setSelectedMetric(metricId);
    let sortedPlayers = [...mockPlayers];
    if (metricId === "elo") {
      sortedPlayers.sort((a, b) => b.elo - a.elo);
    } else if (metricId === "wins") {
      sortedPlayers.sort((a, b) => b.wins - a.wins);
    } else if (metricId === "kd") {
      sortedPlayers.sort((a, b) => b.kdRatio - a.kdRatio);
    }
    
    setLeaderboardData(sortedPlayers.map((p, i) => ({
      rank: i + 1,
      player: p,
      score: metricId === "elo" ? p.elo : metricId === "wins" ? p.wins : p.kdRatio,
    })));
  };
  
  const getScoreDisplay = (entry: LeaderboardEntry) => {
    if (selectedMetric === "kd") return entry.score.toFixed(2);
    return entry.score.toLocaleString();
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
            <Select defaultValue={gameFilters[0].id}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by game" />
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
            <Select value={selectedMetric} onValueChange={handleMetricChange}>
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
            <Select defaultValue={regionFilters[0].id}>
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
          {leaderboardData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] text-center">Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead className="text-right">
                        {metricFilters.find(m => m.id === selectedMetric)?.name || "Score"}
                    </TableHead>
                    <TableHead className="text-center hidden sm:table-cell">ELO</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Wins</TableHead>
                    <TableHead className="text-center hidden lg:table-cell">K/D</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData.map((entry) => (
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
                            <AvatarImage src={entry.player.avatarUrl} alt={entry.player.name} data-ai-hint="leaderboard avatar" />
                            <AvatarFallback>{entry.player.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{entry.player.name}</p>
                            <p className="text-xs text-muted-foreground">Member since 2023</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary text-lg">{getScoreDisplay(entry)}</TableCell>
                      <TableCell className="text-center hidden sm:table-cell">{entry.player.elo.toLocaleString()}</TableCell>
                      <TableCell className="text-center hidden md:table-cell">{entry.player.wins.toLocaleString()}</TableCell>
                      <TableCell className="text-center hidden lg:table-cell">{entry.player.kdRatio.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="text-center py-10 text-muted-foreground">
              <Trophy className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No Leaderboard Data</p>
              <p>Check back later or adjust your filters.</p>
            </div>
          )}
        </CardContent>
        {leaderboardData.length > 0 && (
          <CardFooter className="flex justify-center">
            <Button variant="outline">Load More Players</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
