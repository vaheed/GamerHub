"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Lobby } from "@/types";
import { Filter, Gamepad2, Lock, PlusCircle, Search, Unlock, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const mockLobbies: Lobby[] = [
  { id: "lobby1", name: "CS:GO Competitive Grind", playerCount: 8, maxPlayers: 10, isPublic: true, game: "CS:GO" },
  { id: "lobby2", name: "Dota 2 Casual Fun", playerCount: 3, maxPlayers: 5, isPublic: true, game: "Dota 2" },
  { id: "lobby3", name: "LoL Aram Madness (Private)", playerCount: 7, maxPlayers: 10, isPublic: false, game: "League of Legends" },
  { id: "lobby4", name: "Valorant Rank Push", playerCount: 4, maxPlayers: 5, isPublic: true, game: "Valorant" },
];

const gameOptions = [
  { id: "csgo", name: "CS:GO", imageUrl: "https://picsum.photos/seed/csgo/40/40" },
  { id: "dota2", name: "Dota 2", imageUrl: "https://picsum.photos/seed/dota2/40/40" },
  { id: "lol", name: "League of Legends", imageUrl: "https://picsum.photos/seed/lol/40/40" },
  { id: "valorant", name: "Valorant", imageUrl: "https://picsum.photos/seed/valorant/40/40" },
];


export default function LobbiesPage() {
  const [lobbies, setLobbies] = React.useState(mockLobbies);
  const [isCreateLobbyDialogOpen, setCreateLobbyDialogOpen] = React.useState(false);
  const [newLobbyName, setNewLobbyName] = React.useState("");
  const [newLobbyGame, setNewLobbyGame] = React.useState(gameOptions[0].id);
  const [isNewLobbyPublic, setIsNewLobbyPublic] = React.useState(true);
  const [maxPlayers, setMaxPlayers] = React.useState(10);

  const handleCreateLobby = (e: React.FormEvent) => {
    e.preventDefault();
    const newLobby: Lobby = {
      id: `lobby${lobbies.length + 1}`,
      name: newLobbyName,
      playerCount: 1, // Creator is the first player
      maxPlayers: maxPlayers,
      isPublic: isNewLobbyPublic,
      game: gameOptions.find(g => g.id === newLobbyGame)?.name || "Unknown Game",
    };
    setLobbies([newLobby, ...lobbies]);
    setNewLobbyName("");
    setCreateLobbyDialogOpen(false);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Gamepad2 className="mr-3 h-7 w-7 text-primary" />
                Game Lobbies
              </CardTitle>
              <CardDescription>Find or create lobbies to play with others.</CardDescription>
            </div>
            <Dialog open={isCreateLobbyDialogOpen} onOpenChange={setCreateLobbyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <PlusCircle className="mr-2 h-5 w-5" /> Create Lobby
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <form onSubmit={handleCreateLobby}>
                  <DialogHeader>
                    <DialogTitle>Create New Lobby</DialogTitle>
                    <DialogDescription>
                      Set up your game lobby and invite friends or wait for players to join.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="space-y-2">
                      <Label htmlFor="lobbyName">Lobby Name</Label>
                      <Input 
                        id="lobbyName" 
                        placeholder="E.g., Friday Night Ops" 
                        value={newLobbyName}
                        onChange={(e) => setNewLobbyName(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="game">Game</Label>
                      <Select value={newLobbyGame} onValueChange={setNewLobbyGame}>
                        <SelectTrigger id="game">
                          <SelectValue placeholder="Select a game" />
                        </SelectTrigger>
                        <SelectContent>
                          {gameOptions.map(game => (
                            <SelectItem key={game.id} value={game.id}>
                              <div className="flex items-center gap-2">
                                <Image src={game.imageUrl} alt={game.name} width={20} height={20} className="rounded-sm" data-ai-hint={`${game.name} icon`} />
                                {game.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="maxPlayers">Max Players</Label>
                      <Input 
                        id="maxPlayers" 
                        type="number"
                        min="2"
                        max="20"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                        required 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="isPublic" className="flex flex-col space-y-1">
                        <span>Public Lobby</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                          Public lobbies are visible to everyone.
                        </span>
                      </Label>
                      <Switch 
                        id="isPublic" 
                        checked={isNewLobbyPublic}
                        onCheckedChange={setIsNewLobbyPublic}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setCreateLobbyDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Create Lobby</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search lobbies..." className="pl-8 w-full" />
            </div>
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by game" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                {gameOptions.map(game => (
                    <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {lobbies.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lobby Name</TableHead>
                    <TableHead>Game</TableHead>
                    <TableHead className="text-center">Players</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lobbies.map((lobby) => (
                    <TableRow key={lobby.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{lobby.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Image 
                            src={gameOptions.find(g => g.name === lobby.game)?.imageUrl || "https://picsum.photos/seed/defaultgame/40/40"} 
                            alt={lobby.game} 
                            width={24} 
                            height={24} 
                            className="rounded-sm"
                            data-ai-hint={`${lobby.game} icon small`} 
                          />
                          {lobby.game}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" /> 
                          {lobby.playerCount}/{lobby.maxPlayers}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {lobby.isPublic ? (
                          <span className="flex items-center justify-center gap-1 text-green-500">
                            <Unlock className="h-4 w-4" /> Public
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1 text-orange-500">
                            <Lock className="h-4 w-4" /> Private
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/lobbies/${lobby.id}`} passHref>
                          <Button variant="outline" size="sm">Join</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Gamepad2 className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No Lobbies Found</p>
              <p>Why not create one and start the fun?</p>
            </div>
          )}
        </CardContent>
        {lobbies.length > 0 && (
          <CardFooter className="flex justify-center">
            <Button variant="outline">Load More Lobbies</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
