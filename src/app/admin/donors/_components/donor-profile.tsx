"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { DonationForm } from "./donation-form";
import { ReceiptGenerator } from "./receipt-generator";
import { deleteDonor } from "@/server/actions/donor.actions";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  FileText,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  TrendingUp,
  Receipt,
} from "lucide-react";
import type { Donor, Donation, DonorReceipt } from "@prisma/client";

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
  return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatFrequency(freq: string): string {
  const map: Record<string, string> = {
    ONE_TIME: "One-Time",
    MONTHLY: "Monthly",
    QUARTERLY: "Quarterly",
    ANNUALLY: "Annually",
  };
  return map[freq] ?? freq;
}

type DonorWithAll = Donor & {
  donations: Donation[];
  receipts: DonorReceipt[];
  lifetimeTotal: number;
  thisYearTotal: number;
};

interface DonorProfileProps {
  donor: DonorWithAll;
}

export function DonorProfile({ donor }: DonorProfileProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showReceiptGen, setShowReceiptGen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const donorAddress = [donor.address, donor.city, donor.state, donor.zipCode]
    .filter(Boolean)
    .join(", ");

  async function handleDelete() {
    startTransition(async () => {
      await deleteDonor(donor.id);
      router.push("/admin/donors");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <LinkButton href="/admin/donors" variant="ghost" size="sm">
        <ArrowLeft className="size-4 mr-1" />
        Back to Donors
      </LinkButton>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {donor.firstName} {donor.lastName}
          </h1>
          {donor.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {donor.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditing(!editing);
              setShowDonationForm(false);
              setShowReceiptGen(false);
            }}
          >
            <Pencil className="size-4 mr-1" />
            Edit
          </Button>
          {!confirming ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="size-4 mr-1" />
              Delete
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Deleting..." : "Confirm"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="size-10 rounded-lg flex items-center justify-center shrink-0 bg-green-500/10 text-green-600">
              <DollarSign className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lifetime Total</p>
              <p className="text-lg font-bold">
                {formatCurrency(donor.lifetimeTotal)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="size-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-600">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">This Year</p>
              <p className="text-lg font-bold">
                {formatCurrency(donor.thisYearTotal)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="size-10 rounded-lg flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-600">
              <Receipt className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Donations</p>
              <p className="text-lg font-bold">{donor.donations.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Form */}
      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Donor</CardTitle>
          </CardHeader>
          <CardContent>
            <DonorForm donor={donor} onClose={() => setEditing(false)} />
          </CardContent>
        </Card>
      )}

      {/* Contact Info & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {donor.email ? (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="size-4 text-muted-foreground shrink-0" />
                <a
                  href={`mailto:${donor.email}`}
                  className="text-primary hover:underline"
                >
                  {donor.email}
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                No email on file
              </div>
            )}
            {donor.phone ? (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground shrink-0" />
                {donor.phone}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                No phone on file
              </div>
            )}
            {donorAddress ? (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground shrink-0" />
                {donorAddress}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                No address on file
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {donor.notes ? (
              <p className="text-sm whitespace-pre-wrap">{donor.notes}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No notes.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Donation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Donation History</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setShowDonationForm(!showDonationForm);
                  setShowReceiptGen(false);
                  setEditing(false);
                }}
              >
                <Plus className="size-4 mr-1" />
                Record Donation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReceiptGen(!showReceiptGen);
                  setShowDonationForm(false);
                  setEditing(false);
                }}
              >
                <FileText className="size-4 mr-1" />
                Generate Receipt
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {showDonationForm && (
            <div className="rounded-lg border p-4">
              <DonationForm
                donorId={donor.id}
                onClose={() => setShowDonationForm(false)}
              />
            </div>
          )}

          {showReceiptGen && (
            <div className="rounded-lg border p-4">
              <ReceiptGenerator
                donorId={donor.id}
                donorName={`${donor.firstName} ${donor.lastName}`}
                donorAddress={donorAddress}
                lifetimeTotal={donor.lifetimeTotal}
                thisYearTotal={donor.thisYearTotal}
                onClose={() => setShowReceiptGen(false)}
              />
            </div>
          )}

          {donor.donations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No donations recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donor.donations.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{formatDate(d.donatedAt)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(d.amount)}
                    </TableCell>
                    <TableCell>{formatMethod(d.method)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          d.frequency === "ONE_TIME" ? "outline" : "secondary"
                        }
                      >
                        {formatFrequency(d.frequency)}
                      </Badge>
                    </TableCell>
                    <TableCell>{d.campaign ?? "-"}</TableCell>
                    <TableCell>{d.purpose ?? "-"}</TableCell>
                    <TableCell>
                      {d.receiptSent ? (
                        <Badge variant="default">Sent</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Receipts */}
      {donor.receipts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Emailed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donor.receipts.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{formatDate(r.createdAt)}</TableCell>
                    <TableCell className="capitalize">{r.type}</TableCell>
                    <TableCell>{r.year ?? "-"}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(r.amount)}
                    </TableCell>
                    <TableCell>
                      {r.emailSent ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Send Thank You (placeholder) */}
      <Card>
        <CardContent className="py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Thank You Email</p>
            <p className="text-xs text-muted-foreground">
              Send a personalized thank-you email to this donor.
            </p>
          </div>
          <Button variant="outline" size="sm" disabled>
            <Mail className="size-4 mr-1" />
            Send Thank You (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
