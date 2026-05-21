"use client";

import * as React from "react";
import { NavLinks } from "@/components/nav-links";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  BuildingIcon,
  UsersIcon,
  TagIcon,
  TicketIcon,
} from "lucide-react";
import Link from "next/link";

const user = {
  name: "Admin",
  email: "admin@coupons.com",
  avatar: "",
};

const navItems = [
  { title: "Overview", url: "/dashboard", icon: <LayoutDashboardIcon /> },
  { title: "Businesses", url: "/dashboard/businesses", icon: <BuildingIcon /> },
  { title: "Users", url: "/dashboard/users", icon: <UsersIcon /> },
  { title: "Coupons", url: "/dashboard/coupons", icon: <TicketIcon /> },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TagIcon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Coupon Dashboard</span>
                <span className="text-xs text-muted-foreground">Management</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavLinks label="Menu" items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
