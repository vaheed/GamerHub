import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MatchSummary, Player } from "@/types";
import { Activity, ChevronRight, Clock, ShieldCheck, Swords, TrendingUp, Trophy, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const mockPlayer: Player = {
  id: "1",
  name: "GamerPro123",
  avatarUrl: "https://picsum.photos/seed/player1/100/100",
  elo: 1850,
  kdRatio: 1.75,
  wins: 230,
};

const mockRecentMatches: MatchSummary[] = [
  { id: "m1", game: "CS:GO", date: new Date(Date.now() - 86400000 * 1), result: "Win", summaryText: "Clutched a 1v3 on Dust II to secure the win. Great AWPing.", keyMoments: ["1v3 Clutch", "Triple Kill AWP"], bestPlays: ["Mid-air no-scope"] },
  { id: "m2", game: "Dota 2", date: new Date(Date.now() - 86400000 * 2), result: "Loss", summaryText: "Tough game against a strong mid laner. Good effort on creep score.", keyMoments: ["Early Gank Avoided", "Team Fight Participation"], bestPlays: ["Aegis Steal Attempt"] },
  { id: "m3", game: "League of Legends", date: new Date(Date.now() - 86400000 * 3), result: "Win", summaryText: "Dominated top lane with Garen. Achieved S+ rating.", keyMoments: ["First Blood Top", "Baron Secure"], bestPlays: ["Penta Kill"] },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Profile Section */}
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-4 border-primary">
              <AvatarImage src={mockPlayer.avatarUrl} alt={mockPlayer.name} data-ai-hint="gaming avatar" />
              <AvatarFallback>{mockPlayer.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{mockPlayer.name}</CardTitle>
            <CardDescription>Level 42 - Elite Sniper</CardDescription>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">CS:GO Main</Badge>
              <Badge variant="outline">Dota 2 Fan</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">ELO Rating</span>
              <span className="font-semibold text-lg text-primary">{mockPlayer.elo}</span>
            </div>
            <Progress value={(mockPlayer.elo / 2500) * 100} aria-label={`${mockPlayer.elo} ELO`} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-muted-foreground">Wins</p>
                  <p className="font-semibold">{mockPlayer.wins}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Swords className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-muted-foreground">K/D Ratio</p>
                  <p className="font-semibold">{mockPlayer.kdRatio.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                 <ShieldCheck className="h-5 w-5 text-green-500" />
                 <div>
                  <p className="text-muted-foreground">Win Rate</p>
                  <p className="font-semibold">62%</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                 <Zap className="h-5 w-5 text-blue-500" />
                 <div>
                  <p className="text-muted-foreground">Avg. Score</p>
                  <p className="font-semibold">2,450</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">View Full Profile</Button>
          </CardFooter>
        </Card>

        {/* Main Content Area: Match Summaries & Activity */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-primary" />
                Recent Match Summaries
              </CardTitle>
              <CardDescription>Your latest game performances and AI-powered insights.</CardDescription>
            </CardHeader>
            <CardContent>
              {mockRecentMatches.length > 0 ? (
                <div className="space-y-6">
                  {mockRecentMatches.map((match) => (
                    <Card key={match.id} className="bg-card/50 hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{match.game}</CardTitle>
                            <CardDescription className="text-xs">
                              {match.date.toLocaleDateString()} - {match.result === "Win" ? 
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">Win</Badge> : 
                                <Badge variant="destructive">Loss</Badge>}
                            </CardDescription>
                          </div>
                          <Image src={`https://picsum.photos/seed/${match.game.replace(/\s+/g, '')}/80/50`} alt={match.game} width={80} height={50} className="rounded-md object-cover" data-ai-hint={`${match.game} game art`}/>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">{match.summaryText}</p>
                        {match.keyMoments && (
                          <div className="text-xs">
                            <strong>Key Moments:</strong> {match.keyMoments.join(", ")}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                         <Link href={`/match-summary?matchId=${match.id}`} passHref>
                          <Button variant="link" size="sm" className="p-0 h-auto text-primary">
                            View Full Summary <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No recent matches to display. Go play a game!</p>
              )}
            </CardContent>
            <CardFooter>
               <Link href="/match-summary" passHref>
                <Button variant="outline" className="w-full">
                  View All Matches
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Activity className="mr-2 h-6 w-6 text-primary" />
                Last Activity
              </CardTitle>
              <CardDescription>Your recent interactions on GamerHub.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Joined Lobby</TableCell>
                    <TableCell>"CS:GO Competitive Matchmaking"</TableCell>
                    <TableCell className="text-right text-muted-foreground">2 hours ago</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Friend Request</TableCell>
                    <TableCell>Accepted request from "ShadowKillerX"</TableCell>
                    <TableCell className="text-right text-muted-foreground">5 hours ago</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Unlocked Achievement</TableCell>
                    <TableCell>"Headshot Master" in CS:GO</TableCell>
                    <TableCell className="text-right text-muted-foreground">1 day ago</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
