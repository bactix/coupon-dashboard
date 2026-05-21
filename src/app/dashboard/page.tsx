"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const chartData = [
  { month: "Jan", redeemed: 186, issued: 240 },
  { month: "Feb", redeemed: 305, issued: 380 },
  { month: "Mar", redeemed: 237, issued: 290 },
  { month: "Apr", redeemed: 273, issued: 320 },
  { month: "May", redeemed: 209, issued: 260 },
  { month: "Jun", redeemed: 314, issued: 400 },
];

const chartConfig = {
  redeemed: { label: "Redeemed", color: "hsl(var(--chart-1))" },
  issued: { label: "Issued", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const recentCoupons = [
  { code: "SAVE20", discount: "20%", status: "active", used: 142, expires: "2026-06-30" },
  { code: "SUMMER10", discount: "10%", status: "active", used: 89, expires: "2026-08-31" },
  { code: "FLASH50", discount: "50%", status: "expired", used: 500, expires: "2026-04-01" },
  { code: "WELCOME15", discount: "15%", status: "active", used: 23, expires: "2026-12-31" },
  { code: "HOLIDAY25", discount: "25%", status: "inactive", used: 0, expires: "2026-12-25" },
];

export default function DashboardPage() {
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Coupons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,284</div>
              <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Coupons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">843</div>
              <p className="text-xs text-muted-foreground mt-1">+5% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Redeemed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">9,621</div>
              <p className="text-xs text-muted-foreground mt-1">+18% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$24,530</div>
              <p className="text-xs text-muted-foreground mt-1">+9% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Coupon Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="issued" fill="var(--color-issued)" radius={4} />
                  <Bar dataKey="redeemed" fill="var(--color-redeemed)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCoupons.map((coupon) => (
                    <TableRow key={coupon.code}>
                      <TableCell className="font-mono font-medium">
                        {coupon.code}
                      </TableCell>
                      <TableCell>{coupon.discount}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            coupon.status === "active"
                              ? "default"
                              : coupon.status === "expired"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {coupon.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{coupon.used}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
}
