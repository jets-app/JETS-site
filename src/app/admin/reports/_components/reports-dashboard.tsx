"use client";

interface FunnelData {
  funnel: { stage: string; count: number; pct: number }[];
  statusMap: Record<string, number>;
  total: number;
  academicYear: string;
}

interface FinancialData {
  totalCollected: number;
  totalInvoiced: number;
  outstanding: number;
  appFees: number;
  tuitionCollected: number;
  paymentCount: number;
  invoiceCount: number;
  invoiceBreakdown: { status: string; count: number; amount: number }[];
  academicYear: string;
}

interface TimelineData {
  timeline: {
    month: string;
    total: number;
    submitted: number;
    accepted: number;
    enrolled: number;
  }[];
  academicYear: string;
}

interface RecommendationData {
  total: number;
  completed: number;
  pending: number;
  expired: number;
  completionRate: number;
}

interface DonorData {
  totalDonors: number;
  totalDonations: number;
  totalRaised: number;
  recentDonations: {
    id: string;
    donor: string;
    amount: number;
    date: string;
    campaign: string | null;
  }[];
  byCampaign: { campaign: string; amount: number; count: number }[];
}

export function ReportsDashboard({
  funnel,
  financial,
  timeline,
  recommendations,
  donors,
}: {
  funnel: FunnelData;
  financial: FinancialData;
  timeline: TimelineData;
  recommendations: RecommendationData;
  donors: DonorData;
}) {
  return (
    <div className="space-y-8">
      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total Applications"
          value={funnel.total.toString()}
          sub={funnel.academicYear}
        />
        <KPICard
          label="Total Collected"
          value={formatCurrency(financial.totalCollected)}
          sub={`${financial.paymentCount} payments`}
        />
        <KPICard
          label="Outstanding"
          value={formatCurrency(financial.outstanding)}
          sub={`${financial.invoiceCount} invoices`}
          alert={financial.outstanding > 0}
        />
        <KPICard
          label="Total Raised"
          value={formatCurrency(donors.totalRaised)}
          sub={`${donors.totalDonors} donors`}
        />
      </div>

      {/* Enrollment Funnel */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold mb-1">Enrollment Funnel</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Application pipeline conversion for {funnel.academicYear}
        </p>
        <div className="space-y-3">
          {funnel.funnel.map((step) => (
            <div key={step.stage} className="flex items-center gap-4">
              <div className="w-28 text-sm font-medium text-right shrink-0">
                {step.stage}
              </div>
              <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                <div
                  className="h-full bg-primary/80 rounded-lg transition-all"
                  style={{ width: `${Math.max(step.pct, 2)}%` }}
                />
                <div className="absolute inset-0 flex items-center px-3">
                  <span className="text-xs font-medium">
                    {step.count}
                  </span>
                </div>
              </div>
              <div className="w-12 text-sm text-muted-foreground text-right">
                {step.pct}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column: Financial + Status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Breakdown */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-1">Financial Summary</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Revenue and billing overview
          </p>
          <div className="space-y-4">
            <FinancialRow
              label="Application Fees"
              value={financial.appFees}
            />
            <FinancialRow
              label="Tuition Collected"
              value={financial.tuitionCollected}
            />
            <div className="border-t pt-3">
              <FinancialRow
                label="Total Collected"
                value={financial.totalCollected}
                bold
              />
            </div>
            <FinancialRow
              label="Total Invoiced"
              value={financial.totalInvoiced}
            />
            <FinancialRow
              label="Outstanding Balance"
              value={financial.outstanding}
              alert={financial.outstanding > 0}
            />
          </div>

          {financial.invoiceBreakdown.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3">By Invoice Status</h3>
              <div className="space-y-2">
                {financial.invoiceBreakdown.map((inv) => (
                  <div
                    key={inv.status}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground capitalize">
                      {inv.status.replace(/_/g, " ").toLowerCase()} ({inv.count})
                    </span>
                    <span className="font-medium">
                      {formatCurrency(inv.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-1">
            Application Status Distribution
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Current breakdown by status
          </p>
          <div className="space-y-2">
            {Object.entries(funnel.statusMap)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${getStatusColor(status)}`}
                    />
                    <span className="text-muted-foreground">
                      {formatStatus(status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getStatusColor(status)}`}
                        style={{
                          width: `${Math.round((count / funnel.total) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      {timeline.timeline.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-1">
            Application Timeline
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Monthly application activity
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                    Month
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    Submitted
                  </th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">
                    Accepted
                  </th>
                  <th className="text-right py-2 pl-4 font-medium text-muted-foreground">
                    Enrolled
                  </th>
                </tr>
              </thead>
              <tbody>
                {timeline.timeline.map((row) => (
                  <tr key={row.month} className="border-b border-border/50">
                    <td className="py-2.5 pr-4 font-medium">{row.month}</td>
                    <td className="py-2.5 px-4 text-right">{row.total}</td>
                    <td className="py-2.5 px-4 text-right">{row.submitted}</td>
                    <td className="py-2.5 px-4 text-right text-green-600">
                      {row.accepted}
                    </td>
                    <td className="py-2.5 pl-4 text-right text-emerald-600 font-medium">
                      {row.enrolled}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Two-column: Recommendations + Donors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendations */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-1">Recommendations</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Recommendation letter tracking
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <MiniStat label="Total Requested" value={recommendations.total} />
            <MiniStat label="Completed" value={recommendations.completed} />
            <MiniStat label="Pending" value={recommendations.pending} />
            <MiniStat label="Expired" value={recommendations.expired} />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${recommendations.completionRate}%` }}
              />
            </div>
            <span className="text-sm font-medium">
              {recommendations.completionRate}% completion
            </span>
          </div>
        </div>

        {/* Donor Summary */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-1">Fundraising</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Donor and donation overview
          </p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <MiniStat label="Donors" value={donors.totalDonors} />
            <MiniStat label="Donations" value={donors.totalDonations} />
            <MiniStat
              label="Raised"
              value={formatCurrency(donors.totalRaised)}
            />
          </div>

          {donors.byCampaign.length > 0 && (
            <div className="mt-2 pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3">By Campaign</h3>
              <div className="space-y-2">
                {donors.byCampaign.map((c) => (
                  <div
                    key={c.campaign}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{c.campaign}</span>
                    <span className="font-medium">
                      {formatCurrency(c.amount)} ({c.count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {donors.recentDonations.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-semibold mb-3">Recent Donations</h3>
              <div className="space-y-2">
                {donors.recentDonations.slice(0, 5).map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{d.donor}</span>
                    <span className="font-medium">
                      {formatCurrency(d.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  sub,
  alert,
}: {
  label: string;
  value: string;
  sub?: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={`text-2xl font-bold mt-1 ${
          alert ? "text-red-600 dark:text-red-400" : ""
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      )}
    </div>
  );
}

function FinancialRow({
  label,
  value,
  bold,
  alert,
}: {
  label: string;
  value: number;
  bold?: boolean;
  alert?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-sm ${bold ? "font-semibold" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm ${bold ? "font-bold" : "font-medium"} ${
          alert ? "text-red-600 dark:text-red-400" : ""
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-400",
    SUBMITTED: "bg-blue-500",
    OFFICE_REVIEW: "bg-amber-500",
    PRINCIPAL_REVIEW: "bg-purple-500",
    INTERVIEW_SCHEDULED: "bg-indigo-500",
    INTERVIEW_COMPLETED: "bg-cyan-500",
    ACCEPTED: "bg-green-500",
    DOCUMENTS_PENDING: "bg-orange-500",
    SCHOLARSHIP_REVIEW: "bg-pink-500",
    ENROLLED: "bg-emerald-500",
    REJECTED: "bg-red-500",
    WAITLISTED: "bg-yellow-500",
    WITHDRAWN: "bg-gray-500",
  };
  return colors[status] ?? "bg-gray-400";
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
