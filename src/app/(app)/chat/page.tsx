"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ChatMessage, Player } from "@/types";
import { Hash, MessageSquare, Send, Users, UserCircle, Globe } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

const mockUser: Player = {
  id: "currentUser", name: "Me", avatarUrl: "https://picsum.photos/seed/currentUser/40/40", elo: 1800, kdRatio: 1.6, wins: 100
};

const mockChannels = [
  { id: "global", name: "🌍 Global Chat", type: "global" },
  { id: "csgo-general", name: "# CS:GO General", type: "room", gameIcon: "https://picsum.photos/seed/csgo/20/20" },
  { id: "dota2-pros", name: "# Dota 2 Pros", type: "room", gameIcon: "https://picsum.photos/seed/dota2/20/20" },
  { id: "pm-NinjaGamer", name: "💬 NinjaGamer", type: "private", avatarUrl: "https://picsum.photos/seed/NinjaGamer/20/20" },
  { id: "pm-EpicPlayer", name: "💬 EpicPlayer", type: "private", avatarUrl: "https://picsum.photos/seed/EpicPlayer/20/20" },
];

const mockMessages: { [channelId: string]: ChatMessage[] } = {
  "global": [
    { id: "g1", sender: { id: "user1", name: "AdminBot", avatarUrl: "https://picsum.photos/seed/admin/40/40" }, content: "Welcome to Global Chat! Be respectful.", timestamp: new Date(Date.now() - 3600000), channelId: "global" },
    { id: "g2", sender: { id: "user2", name: "SpeedyGonzales", avatarUrl: "https://picsum.photos/seed/speedy/40/40" }, content: "Anyone up for a CS:GO match?", timestamp: new Date(Date.now() - 1800000), channelId: "global" },
  ],
  "csgo-general": [
    { id: "cs1", sender: { id: "user3", name: "AWPMaster", avatarUrl: "https://picsum.photos/seed/awp/40/40" }, content: "Just hit a sick no-scope on Mirage!", timestamp: new Date(Date.now() - 600000), channelId: "csgo-general" },
  ],
   "pm-NinjaGamer": [
    { id: "pm1", sender: { id: "NinjaGamer", name: "NinjaGamer", avatarUrl: "https://picsum.photos/seed/NinjaGamer/40/40" }, content: "Hey, good game yesterday!", timestamp: new Date(Date.now() - 600000), channelId: "pm-NinjaGamer" },
     { id: "pm2", sender: mockUser, content: "Thanks! You too.", timestamp: new Date(Date.now() - 540000), channelId: "pm-NinjaGamer" },
  ]
};

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState<string>(mockChannels[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages[mockChannels[0].id] || []);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(mockMessages[selectedChannel] || []);
  }, [selectedChannel]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const message: ChatMessage = {
      id: `msg${(mockMessages[selectedChannel]?.length || 0) + 1}`,
      sender: mockUser,
      content: newMessage,
      timestamp: new Date(),
      channelId: selectedChannel,
    };
    
    const updatedChannelMessages = [...(mockMessages[selectedChannel] || []), message];
    mockMessages[selectedChannel] = updatedChannelMessages; // Persist for mock
    setMessages(updatedChannelMessages);
    setNewMessage("");
  };

  const currentChannel = mockChannels.find(c => c.id === selectedChannel);

  return (
    <div className="container mx-auto py-8 h-[calc(100vh-10rem)]"> {/* Adjust height as needed */}
      <Card className="shadow-xl h-full flex flex-col">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              {currentChannel?.type === 'global' && <Globe className="h-7 w-7 text-primary" />}
              {currentChannel?.type === 'room' && (currentChannel.gameIcon ? <Image src={currentChannel.gameIcon} alt="game" width={28} height={28} className="rounded-sm" data-ai-hint="game icon" /> : <Hash className="h-7 w-7 text-primary" />)}
              {currentChannel?.type === 'private' && (currentChannel.avatarUrl ? <Image src={currentChannel.avatarUrl} alt="user" width={28} height={28} className="rounded-full" data-ai-hint="user avatar" /> : <UserCircle className="h-7 w-7 text-primary" />)}
              <CardTitle className="text-2xl">{currentChannel?.name || "Chat"}</CardTitle>
            </div>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
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
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-3 ${msg.sender.id === mockUser.id ? "justify-end" : ""}`}>
                  {msg.sender.id !== mockUser.id && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={msg.sender.avatarUrl} alt={msg.sender.name} data-ai-hint="chat avatar small" />
                      <AvatarFallback>{msg.sender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`p-3 rounded-xl max-w-[70%] ${msg.sender.id === mockUser.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className="text-xs font-semibold mb-0.5">
                      {msg.sender.id === mockUser.id ? "You" : msg.sender.name}
                    </p>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                   {msg.sender.id === mockUser.id && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={msg.sender.avatarUrl} alt={msg.sender.name} data-ai-hint="chat avatar small" />
                      <AvatarFallback>{msg.sender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4" />
                <p>No messages in this channel yet.</p>
                <p>Start the conversation!</p>
              </div>
            )}
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="border-t p-4 bg-card">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={`Message ${currentChannel?.name || "channel"}...`}
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
  );
}
