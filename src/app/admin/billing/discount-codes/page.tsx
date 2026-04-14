import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { LinkButton } from "@/components/shared/link-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tag, ArrowLeft } from "lucide-react";
import { CreateDiscountCodeForm } from "./_components/create-code-form";
import { ToggleCodeButton } from "./_components/toggle-code-button";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default async function DiscountCodesPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "PRINCIPAL")) {
    redirect("/dashboard");
  }

  const codes = await db.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <LinkButton href="/admin/billing" variant="ghost" size="icon-sm">
          <ArrowLeft className="h-4 w-4" />
        </LinkButton>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Discount Codes
          </h1>
          <p className="text-muted-foreground">
            Manage application fee discount codes.
          </p>
        </div>
      </div>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="h-4 w-4" />
            Create New Discount Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CreateDiscountCodeForm />
        </CardContent>
      </Card>

      {/* Codes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Discount Codes</CardTitle>
          <CardDescription>{codes.length} total codes</CardDescription>
        </CardHeader>
        <CardContent>
          {codes.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No discount codes created yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => {
                  const isExpired = code.expiresAt && code.expiresAt < new Date();
                  const isMaxed = code.maxUses !== null && code.usedCount >= code.maxUses;

                  return (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-medium">{code.code}</TableCell>
                      <TableCell>
                        {code.amountOff
                          ? formatCents(code.amountOff)
                          : `${code.percentOff}%`}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {code.description ?? "--"}
                      </TableCell>
                      <TableCell>
                        {code.usedCount}
                        {code.maxUses !== null ? ` / ${code.maxUses}` : ""}
                      </TableCell>
                      <TableCell>
                        {code.expiresAt
                          ? new Date(code.expiresAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        {!code.isActive ? (
                          <Badge
                            variant="outline"
                            className="border-transparent bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          >
                            Inactive
                          </Badge>
                        ) : isExpired ? (
                          <Badge
                            variant="outline"
                            className="border-transparent bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          >
                            Expired
                          </Badge>
                        ) : isMaxed ? (
                          <Badge
                            variant="outline"
                            className="border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          >
                            Maxed Out
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-transparent bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          >
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <ToggleCodeButton codeId={code.id} isActive={code.isActive} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
