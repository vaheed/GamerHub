"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { MatchSummary, Player } from "@/types";
import { Activity, ChevronRight, Clock, ShieldCheck, Swords, TrendingUp, Trophy, Zap, Edit3, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getAccountDetails, listRecentMatches, updateAccountDetails, getCurrentNakamaSession, logout } from "@/lib/nakama-client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";


export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [player, setPlayer] = useState<Player | null>(null);
  const [recentMatches, setRecentMatches] = useState<MatchSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Partial<Player> | null>(null);
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    const session = getCurrentNakamaSession();
    if (!session) {
      router.push("/"); // Redirect to login if no session
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const accountDetails = await getAccountDetails();
        setPlayer(accountDetails);
        setEditingPlayer(accountDetails); // Initialize editing form

        if (accountDetails?.id) {
          const matches = await listRecentMatches(accountDetails.id);
          setRecentMatches(matches);
        }
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Failed to load data.");
        if (err.message.includes("Session expired")) {
            await logout(); // Attempt to clear bad session
            router.push("/");
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const handleEditProfile = () => {
    if (player) {
      setEditingPlayer({ 
        displayName: player.displayName, 
        avatarUrl: player.avatarUrl,
        elo: player.elo,
        kdRatio: player.kdRatio,
        wins: player.wins
      });
      setIsEditModalOpen(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    setIsSaving(true);
    try {
      await updateAccountDetails(editingPlayer as Player); // Assuming editingPlayer has all required fields or BE handles partial
      const updatedPlayer = await getAccountDetails(); // Re-fetch to get latest
      setPlayer(updatedPlayer);
      setEditingPlayer(updatedPlayer);
      setIsEditModalOpen(false);
      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      toast({ variant: "destructive", title: "Update Failed", description: err.message || "Could not save profile." });
    } finally {
      setIsSaving(false);
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-0">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-1 shadow-lg">
            <CardHeader className="items-center text-center">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full mb-4" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="bg-card/50">
                    <CardHeader><Skeleton className="h-5 w-1/3 mb-1" /><Skeleton className="h-3 w-1/4" /></CardHeader>
                    <CardContent><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-3 w-3/4" /></CardContent>
                    <CardFooter><Skeleton className="h-8 w-24" /></CardFooter>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center text-destructive">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p className="text-xl">Error loading dashboard</p>
        <p>{error}</p>
        <Button onClick={() => router.push("/")} className="mt-4">Go to Login</Button>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="container mx-auto py-8 text-center text-muted-foreground">
        Player data not found.
        <Button onClick={() => router.push("/")} className="mt-4">Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Profile Section */}
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-4 border-primary">
              <AvatarImage src={player.avatarUrl || `https://picsum.photos/seed/${player.id}/100/100`} alt={player.displayName || player.username} data-ai-hint="gaming avatar" />
              <AvatarFallback>{(player.displayName || player.username).charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{player.displayName || player.username}</CardTitle>
            <CardDescription>Level 42 - Elite Sniper (Nakama User)</CardDescription> {/* Static for now */}
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">CS:GO Main</Badge>
              <Badge variant="outline">Dota 2 Fan</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">ELO Rating</span>
              <span className="font-semibold text-lg text-primary">{player.elo}</span>
            </div>
            <Progress value={(player.elo / 3000) * 100} aria-label={`${player.elo} ELO`} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-muted-foreground">Wins</p>
                  <p className="font-semibold">{player.wins}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Swords className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-muted-foreground">K/D Ratio</p>
                  <p className="font-semibold">{player.kdRatio.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                 <ShieldCheck className="h-5 w-5 text-green-500" />
                 <div>
                  <p className="text-muted-foreground">Win Rate</p>
                  <p className="font-semibold">62%</p> {/* Static for now */}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                 <Zap className="h-5 w-5 text-blue-500" />
                 <div>
                  <p className="text-muted-foreground">Avg. Score</p>
                  <p className="font-semibold">2,450</p> {/* Static for now */}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button className="w-full" onClick={handleEditProfile}><Edit3 className="mr-2 h-4 w-4" /> Edit Profile</Button>
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
              <CardDescription>Your latest game performances (data from Nakama).</CardDescription>
            </CardHeader>
            <CardContent>
              {recentMatches.length > 0 ? (
                <div className="space-y-6">
                  {recentMatches.map((match) => (
                    <Card key={match.id} className="bg-card/50 hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{match.game}</CardTitle>
                            <CardDescription className="text-xs">
                              {new Date(match.date).toLocaleDateString()} - {match.result === "Win" ? 
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
                  {/* Static activity for now, would be fetched from Nakama event stream or audit log */}
                  <TableRow>
                    <TableCell>Joined Lobby</TableCell>
                    <TableCell>"CS:GO Competitive Matchmaking"</TableCell>
                    <TableCell className="text-right text-muted-foreground">2 hours ago</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveProfile}>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="displayName" className="text-right">Display Name</Label>
                <Input id="displayName" value={editingPlayer?.displayName || ""} onChange={(e) => setEditingPlayer({...editingPlayer, displayName: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="avatarUrl" className="text-right">Avatar URL</Label>
                <Input id="avatarUrl" value={editingPlayer?.avatarUrl || ""} onChange={(e) => setEditingPlayer({...editingPlayer, avatarUrl: e.target.value })} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="elo" className="text-right">ELO</Label>
                <Input id="elo" type="number" value={editingPlayer?.elo || 0} onChange={(e) => setEditingPlayer({...editingPlayer, elo: parseInt(e.target.value) })} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="kdRatio" className="text-right">K/D Ratio</Label>
                <Input id="kdRatio" type="number" step="0.01" value={editingPlayer?.kdRatio || 0} onChange={(e) => setEditingPlayer({...editingPlayer, kdRatio: parseFloat(e.target.value) })} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="wins" className="text-right">Wins</Label>
                <Input id="wins" type="number" value={editingPlayer?.wins || 0} onChange={(e) => setEditingPlayer({...editingPlayer, wins: parseInt(e.target.value) })} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
