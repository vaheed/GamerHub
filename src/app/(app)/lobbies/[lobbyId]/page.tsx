"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage, Lobby, Player } from "@/types";
import { Crown, Gamepad2, MessageSquare, Send, UserPlus, Users, Mic, MicOff, Settings2, DoorOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";

const mockLobby: Lobby = {
  id: "lobby1",
  name: "CS:GO Competitive Grind",
  playerCount: 8,
  maxPlayers: 10,
  isPublic: true,
  game: "CS:GO",
};

const mockPlayers: Player[] = [
  { id: "p1", name: "HostPlayer", avatarUrl: "https://picsum.photos/seed/host/40/40", elo: 1900, kdRatio: 1.8, wins: 150 },
  { id: "p2", name: "GamerGirl99", avatarUrl: "https://picsum.photos/seed/player2/40/40", elo: 1750, kdRatio: 1.5, wins: 120 },
  { id: "p3", name: "NoScopeKing", avatarUrl: "https://picsum.photos/seed/player3/40/40", elo: 2100, kdRatio: 2.1, wins: 200 },
  { id: "p4", name: "TacticalTurtle", avatarUrl: "https://picsum.photos/seed/player4/40/40", elo: 1600, kdRatio: 1.2, wins: 90 },
];

const initialMessages: ChatMessage[] = [
  { id: "msg1", sender: mockPlayers[1], content: "Hey everyone! Ready to win?", timestamp: new Date(Date.now() - 60000 * 5), channelId: "lobby1" },
  { id: "msg2", sender: mockPlayers[0], content: "Welcome! Let's get this bread.", timestamp: new Date(Date.now() - 60000 * 4), channelId: "lobby1" },
  { id: "msg3", sender: mockPlayers[2], content: "I'm feeling some headshots today.", timestamp: new Date(Date.now() - 60000 * 3), channelId: "lobby1" },
];

export default function LobbyPage() {
  const params = useParams();
  const lobbyId = params.lobbyId as string;

  // In a real app, fetch lobby data and players based on lobbyId
  const lobby = mockLobby; // Using mock for now
  const [players, setPlayers] = useState(mockPlayers);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const myPlayer = mockPlayers[0]; // Assume current user is the host for mock
    const message: ChatMessage = {
      id: `msg${messages.length + 1}`,
      sender: myPlayer,
      content: newMessage,
      timestamp: new Date(),
      channelId: lobbyId,
    };
    setMessages([...messages, message]);
    setNewMessage("");
  };

  if (!lobby) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Lobby not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lobby Info and Player List */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="relative">
               <Image src={`https://picsum.photos/seed/${lobby.game.replace(/\s+/g, '')}/600/200`} alt={lobby.game} width={600} height={200} className="rounded-t-lg object-cover absolute inset-0 w-full h-full opacity-20" data-ai-hint={`${lobby.game} banner`} />
              <div className="relative z-10">
                <CardTitle className="text-2xl flex items-center">
                  <Gamepad2 className="mr-3 h-7 w-7 text-primary" /> {lobby.name}
                </CardTitle>
                <CardDescription>Game: {lobby.game} | {lobby.isPublic ? "Public" : "Private"} Lobby</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Players ({lobby.playerCount}/{lobby.maxPlayers})</h3>
                <Button variant="outline" size="sm"><UserPlus className="mr-2 h-4 w-4" /> Invite</Button>
              </div>
              <ScrollArea className="h-[200px] pr-3">
                <ul className="space-y-3">
                  {players.map((player, index) => (
                    <li key={player.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={player.avatarUrl} alt={player.name} data-ai-hint="player avatar small" />
                          <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{player.name}</span>
                      </div>
                      {index === 0 && <Crown className="h-5 w-5 text-yellow-500" title="Host" />}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
             <CardFooter className="flex flex-col gap-2">
               <Button className="w-full bg-green-600 hover:bg-green-700">Start Game</Button>
               <div className="flex gap-2 w-full">
                <Button variant={isMuted ? "secondary" : "outline"} size="icon" onClick={() => setIsMuted(!isMuted)} className="flex-1">
                    {isMuted ? <MicOff className="h-5 w-5"/> : <Mic className="h-5 w-5"/>}
                </Button>
                <Button variant="outline" size="icon" className="flex-1"><Settings2 className="h-5 w-5"/></Button>
                 <Link href="/lobbies" className="flex-1">
                    <Button variant="destructive" className="w-full"><DoorOpen className="mr-2 h-5 w-5"/> Leave</Button>
                 </Link>
               </div>
            </CardFooter>
          </Card>
        </div>

        {/* Chat System */}
        <Card className="lg:col-span-2 shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <MessageSquare className="mr-3 h-6 w-6 text-primary" /> Lobby Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
            <ScrollArea className="flex-grow p-6">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-start gap-3 ${msg.sender.id === mockPlayers[0].id ? "justify-end" : ""}`}>
                    {msg.sender.id !== mockPlayers[0].id && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={msg.sender.avatarUrl} alt={msg.sender.name} data-ai-hint="chat avatar"/>
                        <AvatarFallback>{msg.sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`p-3 rounded-xl max-w-[70%] ${msg.sender.id === mockPlayers[0].id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p className="text-xs font-semibold mb-0.5">
                        {msg.sender.id === mockPlayers[0].id ? "You" : msg.sender.name}
                      </p>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                     {msg.sender.id === mockPlayers[0].id && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={msg.sender.avatarUrl} alt={msg.sender.name} data-ai-hint="chat avatar" />
                        <AvatarFallback>{msg.sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="border-t p-4 bg-card">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow"
                />
                <Button type="submit" size="icon">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
