"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage, Lobby, Player, NakamaChannelMessage } from "@/types";
import { Crown, Gamepad2, MessageSquare, Send, UserPlus, Users, Mic, MicOff, Settings2, DoorOpen, AlertTriangle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { getLobbyDetails as fetchNakamaLobbyDetails, joinChatChannel, sendChatMessage, onChatMessage, getCurrentNakamaSession, getAccountDetails, logout } from "@/lib/nakama-client";
import { useToast } from "@/hooks/use-toast";


export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const lobbyId = params.lobbyId as string;

  const [lobby, setLobby] = useState<(Lobby & { players: Player[] }) | null>(null);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = getCurrentNakamaSession();
    if (!session || !lobbyId) {
      router.push("/");
      return;
    }

    async function loadLobbyData() {
      setIsLoading(true);
      setError(null);
      try {
        const [lobbyDetails, userDetails] = await Promise.all([
          fetchNakamaLobbyDetails(lobbyId),
          getAccountDetails()
        ]);
        setLobby(lobbyDetails);
        setCurrentUser(userDetails);

        // Join chat channel for this lobby
        // Channel ID could be the lobbyId itself or a dedicated chat channel ID associated with the lobby
        const chatChannelId = `lobby_${lobbyId}`; // Example convention
        await joinChatChannel(chatChannelId, 1 /* ROOM type */);
        
        // Set up listener for new messages
        onChatMessage((chatMsg) => {
          if (chatMsg.channelId === chatChannelId) {
            setMessages((prevMessages) => [...prevMessages, chatMsg]);
          }
        });

      } catch (err: any) {
        console.error("Failed to load lobby data:", err);
        setError(err.message || "Failed to load lobby.");
        if (err.message.includes("Session expired") || err.message.includes("Not authenticated")) {
            await logout();
            router.push("/");
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadLobbyData();
  }, [lobbyId, router]);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !currentUser || !lobby) return;

    const chatChannelId = `lobby_${lobbyId}`;
    try {
      // The sendChatMessage in nakama-client will handle creating the NakamaChannelMessage
      // For optimistic update, we can add it to local state immediately
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        sender: { 
            id: currentUser.id, 
            username: currentUser.username, 
            displayName: currentUser.displayName,
            avatarUrl: currentUser.avatarUrl
        },
        content: newMessage,
        timestamp: new Date(),
        channelId: chatChannelId,
      };
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage("");
      
      await sendChatMessage(chatChannelId, newMessage);
      // If the server sends back the message via the onChatMessage listener,
      // we might get duplicates or need to reconcile temp messages.
      // For simplicity, Nakama's socket.writeChatMessage usually also broadcasts
      // back to the sender if they are subscribed.
    } catch (err: any) {
      console.error("Failed to send message:", err);
      toast({ variant: "destructive", title: "Send Failed", description: "Could not send message." });
      // Remove optimistic message on failure if desired
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }
  };


  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader><Skeleton className="h-8 w-3/4 mb-1" /><Skeleton className="h-4 w-1/2" /></CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-1/3 mb-4" />
                <div className="h-[200px] space-y-3 pr-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              </CardContent>
              <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
            </Card>
          </div>
          <Card className="lg:col-span-2 shadow-lg flex flex-col">
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
              <div className="flex-grow p-6 space-y-4"><Skeleton className="h-40 w-full" /></div>
              <div className="border-t p-4 bg-card"><Skeleton className="h-10 w-full" /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !lobby || !currentUser) {
    return (
      <div className="container mx-auto py-8 text-center text-destructive">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p className="text-xl">Error loading lobby</p>
        <p>{error || "Lobby or user data not found."}</p>
         <Button onClick={() => router.push("/lobbies")} className="mt-4">Back to Lobbies</Button>
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
                  {lobby.players.map((player) => (
                    <li key={player.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={player.avatarUrl || `https://picsum.photos/seed/${player.id}/40/40`} alt={player.displayName || player.username} data-ai-hint="player avatar small" />
                          <AvatarFallback>{(player.displayName || player.username).charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{player.displayName || player.username}</span>
                      </div>
                      {player.id === lobby.hostId && <Crown className="h-5 w-5 text-yellow-500" title="Host" />}
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
        <Card className="lg:col-span-2 shadow-lg flex flex-col h-[calc(100vh-12rem)]"> {/* Adjusted height */}
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <MessageSquare className="mr-3 h-6 w-6 text-primary" /> Lobby Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
            <ScrollArea className="flex-grow p-6">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-start gap-3 ${msg.sender.id === currentUser.id ? "justify-end" : ""}`}>
                    {msg.sender.id !== currentUser.id && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={msg.sender.avatarUrl || `https://picsum.photos/seed/${msg.sender.id}/40/40`} alt={msg.sender.displayName || msg.sender.username} data-ai-hint="chat avatar"/>
                        <AvatarFallback>{(msg.sender.displayName || msg.sender.username).charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`p-3 rounded-xl max-w-[70%] ${msg.sender.id === currentUser.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p className="text-xs font-semibold mb-0.5">
                        {msg.sender.id === currentUser.id ? "You" : (msg.sender.displayName || msg.sender.username)}
                      </p>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                     {msg.sender.id === currentUser.id && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={currentUser.avatarUrl || `https://picsum.photos/seed/${currentUser.id}/40/40`} alt={currentUser.displayName || currentUser.username} data-ai-hint="chat avatar" />
                        <AvatarFallback>{(currentUser.displayName || currentUser.username).charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
               {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-4" />
                    <p>No messages yet. Say hello!</p>
                </div>
                )}
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

