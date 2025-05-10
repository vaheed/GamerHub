"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Gamepad2,
  MessageSquare,
  Trophy,
  Bot,
  Settings,
  LogOut,
  Users,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import React from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
  subItems?: NavItem[];
}

export function SidebarNav() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
    { href: "/lobbies", label: "Lobbies", icon: <Gamepad2 /> },
    { href: "/chat", label: "Chat", icon: <MessageSquare /> },
    { href: "/leaderboards", label: "Leaderboards", icon: <Trophy /> },
    { href: "/match-summary", label: "AI Match Summary", icon: <Bot /> },
    { 
      href: "#", 
      label: "Community", 
      icon: <Users />,
      subItems: [
        { href: "/community/friends", label: "Friends", icon: <Users /> },
        { href: "/community/groups", label: "Groups", icon: <Users /> },
      ]
    },
  ];

   const bottomNavItems: NavItem[] = [
    { href: "/settings", label: "Settings", icon: <Settings /> },
    { href: "/", label: "Logout", icon: <LogOut /> },
  ];


  const renderNavItem = (item: NavItem, index: number) => {
    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
    const [isSubmenuOpen, setIsSubmenuOpen] = React.useState(isActive);

    if (item.subItems) {
      return (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton
            onClick={() => setIsSubmenuOpen(!isSubmenuOpen)}
            isActive={isActive}
            aria-expanded={isSubmenuOpen}
            tooltip={{ children: item.label, side: 'right', align: 'center' }}
          >
            {item.icon}
            <span>{item.label}</span>
          </SidebarMenuButton>
          {isSubmenuOpen && (
            <SidebarMenuSub>
              {item.subItems.map((subItem, subIndex) => (
                <SidebarMenuSubItem key={subIndex}>
                  <Link href={subItem.href} passHref legacyBehavior>
                    <SidebarMenuSubButton
                      isActive={pathname === subItem.href}
                      onClick={() => {
                        if (open) setOpen(false); // Close mobile sidebar on click
                      }}
                    >
                      {subItem.icon}
                      <span>{subItem.label}</span>
                    </SidebarMenuSubButton>
                  </Link>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={index}>
        <Link href={item.href} passHref legacyBehavior>
          <SidebarMenuButton
            isActive={isActive}
            tooltip={{ children: item.label, side: 'right', align: 'center' }}
             onClick={() => {
                if (open) setOpen(false); // Close mobile sidebar on click
              }}
          >
            {item.icon}
            <span>{item.label}</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    );
  };


  return (
    <>
      <SidebarMenu className="flex-grow">
        {navItems.map(renderNavItem)}
      </SidebarMenu>
      <SidebarMenu className="mt-auto">
         {bottomNavItems.map(renderNavItem)}
      </SidebarMenu>
    </>
  );
}
