"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LinkButton } from "@/components/shared/link-button";
import { DonorForm } from "./donor-form";
import { exportDonorsToCSV } from "@/server/actions/donor.actions";
import {
  Plus,
  Download,
  Search,
  Users,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Heart,
} from "lucide-react";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMethod(method: string | null): string {
  if (!method) return "-";
  return method
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface DonorWithStats {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  tags: string[];
  lifetimeTotal: number;
  donationCount: number;
  lastDonation: Date | null;
}

interface RecentDonation {
  id: string;
  amount: number;
  donatedAt: Date;
  method: string | null;
  campaign: string | null;
  donor: { firstName: string; lastName: string };
}

interface CampaignData {
  campaign: string;
  total: number;
  count: number;
}

interface TopDonor {
  id: string;
  firstName: string;
  lastName: string;
  lifetimeTotal: number;
  donationCount: number;
}

interface DonorDashboardProps {
  donors: DonorWithStats[];
  total: number;
  stats: {
    totalDonors: number;
    totalRaised: number;
    raisedThisYear: number;
    activeRecurring: number;
    recentDonations: RecentDonation[];
  };
  topDonors: TopDonor[];
  campaigns: CampaignData[];
  search: string;
}

export function DonorDashboard({
  donors,
  total,
  stats,
  topDonors,
  campaigns,
  search: initialSearch,
}: DonorDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    startTransition(() => {
      router.push(`/admin/donors?${params.toString()}`);
    });
  }

  async function handleExport() {
    try {
      const csv = await exportDonorsToCSV();
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donors-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently handle
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Donor Management
          </h1>
          <p className="text-muted-foreground">
            Track donations, manage donors, and generate tax receipts.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="size-4 mr-1.5" />
            Add Donor
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="size-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Donors",
            value: stats.totalDonors.toString(),
            icon: Users,
            color: "text-primary bg-primary/10",
          },
          {
            label: "Total Raised (Lifetime)",
            value: formatCurrency(stats.totalRaised),
            icon: DollarSign,
            color: "text-green-600 bg-green-500/10",
          },
          {
            label: "Raised This Year",
            value: formatCurrency(stats.raisedThisYear),
            icon: TrendingUp,
            color: "text-blue-600 bg-blue-500/10",
          },
          {
            label: "Active Recurring",
            value: stats.activeRecurring.toString(),
            icon: RefreshCw,
            color: "text-purple-600 bg-purple-500/10",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 py-4">
              <div
                className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}
              >
                <stat.icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold truncate">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Donor Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Donor</CardTitle>
          </CardHeader>
          <CardContent>
            <DonorForm onClose={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      {/* Top Donors & Recent Donations side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Donors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="size-4" />
              Top Donors
            </CardTitle>
            <CardDescription>By lifetime giving</CardDescription>
          </CardHeader>
          <CardContent>
            {topDonors.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No donations recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {topDonors.slice(0, 5).map((d, i) => (
                  <LinkButton
                    key={d.id}
                    href={`/admin/donors/${d.id}`}
                    variant="ghost"
                    className="w-full h-auto justify-start px-2 py-1.5"
                  >
                    <span className="text-sm font-medium text-muted-foreground w-5">
                      {i + 1}.
                    </span>
                    <span className="flex-1 text-left text-sm font-medium">
                      {d.firstName} {d.lastName}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(d.lifetimeTotal)}
                    </span>
                  </LinkButton>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="size-4" />
              Recent Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentDonations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No donations recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentDonations.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {d.donor.firstName} {d.donor.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(d.donatedAt)}
                        {d.campaign ? ` \u00b7 ${d.campaign}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">{formatCurrency(d.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatMethod(d.method)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaigns */}
      {campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead className="text-right">Donations</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.campaign}>
                    <TableCell className="font-medium">{c.campaign}</TableCell>
                    <TableCell className="text-right">{c.count}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(c.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Search & Donor List */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search donors by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isPending}>
            Search
          </Button>
        </form>

        {/* Donor Table */}
        {donors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto size-12 text-muted-foreground mb-3" />
              <p className="text-lg font-medium">No donors found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {initialSearch
                  ? "Try adjusting your search."
                  : "Add your first donor to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Donors ({total})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Lifetime Total</TableHead>
                    <TableHead className="text-right">Donations</TableHead>
                    <TableHead>Last Donation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donors.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <LinkButton
                          href={`/admin/donors/${d.id}`}
                          variant="link"
                          size="sm"
                          className="px-0"
                        >
                          {d.firstName} {d.lastName}
                        </LinkButton>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {d.email ?? "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {d.tags.slice(0, 3).map((t) => (
                            <Badge key={t} variant="outline" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                          {d.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{d.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(d.lifetimeTotal)}
                      </TableCell>
                      <TableCell className="text-right">
                        {d.donationCount}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {d.lastDonation
                          ? formatDate(d.lastDonation)
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
