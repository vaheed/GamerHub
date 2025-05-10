"use client";

import { Logo } from "@/components/logo";
import { SidebarNav } from "@/components/sidebar-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true} collapsible="icon">
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Header />
          <ScrollArea className="flex-1">
            <main className="p-4 sm:p-6 lg:p-8">
               {children}
            </main>
          </ScrollArea>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppSidebar() {
  const { state } = useSidebar();
  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r">
      <SidebarHeader className={cn("p-4 flex items-center", state === "collapsed" && "justify-center")}>
        <Logo size={state === "collapsed" ? 28 : 32} />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarNav />
      </SidebarContent>
      {/* <SidebarFooter className="p-2">
        User profile or quick actions can go here
      </SidebarFooter> */}
    </Sidebar>
  );
}
