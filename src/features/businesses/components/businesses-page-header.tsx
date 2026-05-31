"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PlusIcon } from "lucide-react";

interface BusinessesPageHeaderProps {
  onAddClick: () => void;
  businessCount?: number;
}

export const BusinessesPageHeader = memo(function BusinessesPageHeader({
  onAddClick,
  businessCount = 0,
}: BusinessesPageHeaderProps) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Businesses</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Businesses</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage registered businesses in Lebanon
              <span className={`ml-2 font-medium ${businessCount > 0 ? "text-foreground" : "hidden"}`}>
                ({businessCount})
              </span>
            </p>
          </div>
          <Button onClick={onAddClick} size="lg">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Business
          </Button>
        </div>
      </div>
    </>
  );
});
