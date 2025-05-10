"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Bell, LogOut, Search, Settings, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { SidebarTrigger } from "./ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import React, { useEffect, useState } from "react";
import { getCurrentNakamaSession, getAccountDetails, logout as nakamaLogout } from "@/lib/nakama-client";
import type { Player } from "@/types";
import { useRouter } from "next/navigation";

export function Header() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const session = getCurrentNakamaSession();
    if (session) {
      getAccountDetails()
        .then(setCurrentUser)
        .catch(err => {
          console.error("Failed to fetch user for header:", err);
          // If session is invalid, clear it and potentially redirect
          if (err.message.includes("Session expired") || err.status === 401) {
            nakamaLogout().finally(() => router.push("/"));
          }
        })
        .finally(() => setIsLoadingUser(false));
    } else {
      setIsLoadingUser(false); // No session, not loading
    }
  }, [router]);

  const handleLogout = async () => {
    await nakamaLogout();
    setCurrentUser(null); // Clear user state
    router.push("/"); // Redirect to login page
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      {isMobile && <SidebarTrigger />}
      {!isMobile && <div className="w-[52px]"></div>} {/* Placeholder for sidebar trigger space */}
      
      <div className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search games, players, lobbies..."
          className="w-full rounded-lg bg-card pl-8 md:w-[280px] lg:w-[320px]"
        />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        {isLoadingUser ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={currentUser.avatarUrl || `https://picsum.photos/seed/${currentUser.id}/40/40`} alt={currentUser.displayName || currentUser.username} data-ai-hint="user avatar" />
                  <AvatarFallback>{(currentUser.displayName || currentUser.username).charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.displayName || currentUser.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {/* Nakama user object doesn't have email directly, this would be custom */}
                    ID: {currentUser.id.substring(0,10)}... 
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="#"> {/* Placeholder for settings page */}
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link href="/">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
