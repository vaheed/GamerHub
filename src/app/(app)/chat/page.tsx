"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage, Player, NakamaChannelMessage } from "@/types";
import { Hash, MessageSquare, Send, Users, UserCircle, Globe, AlertTriangle, Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCurrentNakamaSession, getAccountDetails, joinChatChannel, sendChatMessage, onChatMessage, logout } from "@/lib/nakama-client";
import { useToast } from "@/hooks/use-toast";

// Mock channel structure, in a real app this might come from Nakama groups or a predefined list
interface AppChannel {
  id: string; // This will be the Nakama channel_id
  name: string;
  type: "global" | "room" | "private"; // Private might map to Nakama direct message channels
  gameIcon?: string; // For room type
  avatarUrl?: string; // For private message type
}

const mockChannels: AppChannel[] = [
  { id: "global_chat", name: "🌍 Global Chat", type: "global" },
  { id: "csgo_general_room", name: "# CS:GO General", type: "room", gameIcon: "https://picsum.photos/seed/csgo/20/20" },
  { id: "dota2_pros_room", name: "# Dota 2 Pros", type: "room", gameIcon: "https://picsum.photos/seed/dota2/20/20" },
  // Private messages would be dynamically created, e.g., DM between userA_id and userB_id
  // For mock, we can have one. The channel ID for DMs is often a convention (e.g., sorted user IDs).
  { id: "dm_NinjaGamer", name: "💬 NinjaGamer", type: "private", avatarUrl: "https://picsum.photos/seed/NinjaGamer/20/20" },
];


export default function ChatPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(mockChannels[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const session = getCurrentNakamaSession();
    if (!session) {
      router.push("/");
      return;
    }
    
    async function initializeChat() {
      setIsLoading(true);
      setError(null);
      try {
        const userDetails = await getAccountDetails();
        setCurrentUser(userDetails);
        
        // Join the initial selected channel
        await joinChatChannel(selectedChannelId, mockChannels.find(c => c.id === selectedChannelId)?.type === 'global' ? 2 : 1); // 2 for Group (Global), 1 for Room

        // Set up listener for new messages
        onChatMessage((chatMsg) => {
          // Only add message if it's for the currently selected channel
          // Note: This basic check might need refinement if user switches channels rapidly
          // or if messages arrive for non-active channels (they would be missed by UI unless stored globally)
          setSelectedChannelId(currentSelectedChannelId => {
            if (chatMsg.channelId === currentSelectedChannelId) {
                 setMessages((prevMessages) => {
                    // Avoid duplicates if message was already optimistically added
                    if (prevMessages.find(m => m.id === chatMsg.id)) return prevMessages;
                    return [...prevMessages, chatMsg];
                });
            }
            return currentSelectedChannelId;
          });
        });

      } catch (err: any) {
        console.error("Failed to initialize chat:", err);
        setError(err.message || "Failed to initialize chat.");
        if (err.message.includes("Session expired") || err.message.includes("Not authenticated")) {
            await logout();
            router.push("/");
        }
      } finally {
        setIsLoading(false);
      }
    }
    initializeChat();
  }, [router]); // Only run on mount for now, channel joining logic is below

  useEffect(() => {
    // When selectedChannelId changes, join the new channel and clear old messages
    if (!currentUser || !selectedChannelId) return;

    const joinNewChannel = async () => {
      setMessages([]); // Clear messages from previous channel
      setIsLoading(true); // Show loading for channel switch
      try {
        const channelType = mockChannels.find(c => c.id === selectedChannelId)?.type;
        const nakamaChannelType = channelType === 'global' ? 2 : (channelType === 'private' ? 0 : 1); // 0 DM, 1 Room, 2 Group
        await joinChatChannel(selectedChannelId, nakamaChannelType);
        // Past messages for the channel are not automatically loaded by Nakama's joinChat.
        // You'd typically use listChannelMessages (REST API) or have server logic to send history.
        // For this example, we're only showing new messages after joining.
      } catch (err: any) {
        console.error(`Failed to join channel ${selectedChannelId}:`, err);
        setError(err.message || `Failed to join channel ${selectedChannelId}.`);
        toast({variant: "destructive", title: "Channel Error", description: `Could not join ${selectedChannelId}.`});
      } finally {
          setIsLoading(false);
      }
    };
    joinNewChannel();

  }, [selectedChannelId, currentUser, toast]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !currentUser || !selectedChannelId) return;

    try {
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
        channelId: selectedChannelId,
      };
      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage("");
      
      await sendChatMessage(selectedChannelId, newMessage);
    } catch (err: any) {
      console.error("Failed to send message:", err);
      toast({ variant: "destructive", title: "Send Failed", description: "Could not send message." });
      setMessages(prev => prev.filter(m => m.id !== `temp-${Date.now()}`)); // Crude removal, improve if ID is more stable
    }
  };

  const currentChannelDetails = mockChannels.find(c => c.id === selectedChannelId);

  if (!currentUser && !isLoading) { // If done loading but no user (e.g. session issue not caught by initial redirect)
     return (
      <div className="container mx-auto py-8 text-center text-destructive">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p className="text-xl">Error loading user data</p>
        <Button onClick={() => router.push("/")} className="mt-4">Go to Login</Button>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-8 h-[calc(100vh-10rem)]">
      <Card className="shadow-xl h-full flex flex-col">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              {isLoading && !currentChannelDetails ? <Skeleton className="h-7 w-7 rounded-full" /> : null}
              {!isLoading && currentChannelDetails?.type === 'global' && <Globe className="h-7 w-7 text-primary" />}
              {!isLoading && currentChannelDetails?.type === 'room' && (currentChannelDetails.gameIcon ? <Image src={currentChannelDetails.gameIcon} alt="game" width={28} height={28} className="rounded-sm" data-ai-hint="game icon" /> : <Hash className="h-7 w-7 text-primary" />)}
              {!isLoading && currentChannelDetails?.type === 'private' && (currentChannelDetails.avatarUrl ? <Image src={currentChannelDetails.avatarUrl} alt="user" width={28} height={28} className="rounded-full" data-ai-hint="user avatar" /> : <UserCircle className="h-7 w-7 text-primary" />)}
              
              {isLoading && !currentChannelDetails ? <Skeleton className="h-6 w-40" /> : <CardTitle className="text-2xl">{currentChannelDetails?.name || "Chat"}</CardTitle>}
            </div>
            <Select value={selectedChannelId} onValueChange={setSelectedChannelId} disabled={isLoading}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Select a channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Global & Rooms</SelectLabel>
                  {mockChannels.filter(c => c.type === 'global' || c.type === 'room').map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      <div className="flex items-center gap-2">
                        {channel.type === 'global' && <Globe className="h-4 w-4" />}
                        {channel.type === 'room' && (channel.gameIcon ? <Image src={channel.gameIcon} alt="game" width={16} height={16} className="rounded-sm" data-ai-hint="game icon small" /> : <Hash className="h-4 w-4" />)}
                        {channel.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>Private Messages</SelectLabel>
                   {mockChannels.filter(c => c.type === 'private').map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      <div className="flex items-center gap-2">
                         {channel.avatarUrl ? <Image src={channel.avatarUrl} alt="user" width={16} height={16} className="rounded-full" data-ai-hint="user avatar small" /> : <UserCircle className="h-4 w-4" />}
                        {channel.name.replace("💬 ", "")}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden p-0">
          <ScrollArea className="flex-grow p-6">
            {isLoading && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-12 w-12 animate-spin mb-4" />
                    <p>Loading messages...</p>
                </div>
            ) : error ? (
                 <div className="flex flex-col items-center justify-center h-full text-destructive">
                    <AlertTriangle className="h-12 w-12 mb-4" />
                    <p>Error loading messages: {error}</p>
                </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4" />
                <p>No messages in this channel yet.</p>
                <p>Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-start gap-3 ${msg.sender.id === currentUser?.id ? "justify-end" : ""}`}>
                    {msg.sender.id !== currentUser?.id && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={msg.sender.avatarUrl || `https://picsum.photos/seed/${msg.sender.id}/40/40`} alt={msg.sender.displayName || msg.sender.username} data-ai-hint="chat avatar small" />
                        <AvatarFallback>{(msg.sender.displayName || msg.sender.username || 'U').charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`p-3 rounded-xl max-w-[70%] ${msg.sender.id === currentUser?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <p className="text-xs font-semibold mb-0.5">
                        {msg.sender.id === currentUser?.id ? "You" : (msg.sender.displayName || msg.sender.username)}
                      </p>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                     {msg.sender.id === currentUser?.id && currentUser && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={currentUser.avatarUrl || `https://picsum.photos/seed/${currentUser.id}/40/40`} alt={currentUser.displayName || currentUser.username} data-ai-hint="chat avatar small" />
                        <AvatarFallback>{(currentUser.displayName || currentUser.username).charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="border-t p-4 bg-card">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={`Message ${currentChannelDetails?.name || "channel"}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow"
                disabled={isLoading || !currentUser}
              />
              <Button type="submit" size="icon" disabled={isLoading || !currentUser || newMessage.trim() === ""}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
