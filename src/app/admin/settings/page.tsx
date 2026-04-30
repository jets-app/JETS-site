import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { LinkButton } from "@/components/shared/link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileBarChart,
  CreditCard,
  Mail,
  MessageSquare,
  ArrowRight,
  Users,
} from "lucide-react";
import { getSettings } from "@/server/actions/settings.actions";
import { SchoolInfoCard } from "./_components/school-info-card";

type SettingCard = {
  title: string;
  description: string;
  href: string | null;
  icon: React.ComponentType<{ className?: string }>;
  status: "ready" | "active" | "coming-soon";
};

const INTEGRATION_CARDS: SettingCard[] = [
  {
    title: "QuickBooks Integration",
    description:
      "Connect QuickBooks Online to auto-sync invoices, payments, and customers.",
    href: "/admin/settings/quickbooks",
    icon: FileBarChart,
    status: "ready",
  },
  {
    title: "Stripe",
    description:
      "Live — accepting application fees, tuition autopay, and refunds. Keys managed via environment variables.",
    href: null,
    icon: CreditCard,
    status: "active",
  },
  {
    title: "Email (Resend)",
    description:
      "Live — sending from info@jetsschool.org. Domain verified, templates managed in code.",
    href: null,
    icon: Mail,
    status: "active",
  },
  {
    title: "SMS (Twilio)",
    description:
      "Live — A2P 10DLC registered. Sending parent and staff notifications.",
    href: null,
    icon: MessageSquare,
    status: "active",
  },
  {
    title: "Staff Accounts",
    description:
      "Add admins, principals, secretaries, or reviewers. They get an email link to set their own password.",
    href: "/admin/settings/staff",
    icon: Users,
    status: "ready",
  },
  {
    title: "Database Backups",
    description:
      "Daily off-platform backups to AWS S3 (auto-deleted after 30 days). Run an extra backup on demand.",
    href: "/admin/settings/backups",
    icon: FileBarChart,
    status: "ready",
  },
];

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const settings = await getSettings();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure school defaults, academic year, and integrations.
        </p>
      </div>

      {/* Editable school info */}
      <SchoolInfoCard
        settings={{
          currentAcademicYear: settings.currentAcademicYear,
          openSchoolYears: settings.openSchoolYears ?? [settings.currentAcademicYear],
          applicationFeeAmount: settings.applicationFeeAmount,
          applicationsOpen: settings.applicationsOpen,
          schoolName: settings.schoolName,
          schoolLegalName: settings.schoolLegalName,
          schoolEin: settings.schoolEin,
          schoolAddress: settings.schoolAddress,
          schoolPhone: settings.schoolPhone,
          schoolEmail: settings.schoolEmail,
          calendlyUrl: settings.calendlyUrl,
        }}
      />

      {/* Integration cards */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Integrations & Other</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {INTEGRATION_CARDS.map((setting) => {
            const Icon = setting.icon;
            return (
              <Card key={setting.title} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <CardTitle>{setting.title}</CardTitle>
                      </div>
                    </div>
                    {setting.status === "coming-soon" ? (
                      <Badge variant="outline">Coming soon</Badge>
                    ) : setting.status === "active" ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Available</Badge>
                    )}
                  </div>
                  <CardDescription className="pt-2">
                    {setting.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-2">
                  {setting.href ? (
                    <LinkButton href={setting.href} variant="outline" size="sm">
                      Configure
                      <ArrowRight className="size-3.5" />
                    </LinkButton>
                  ) : setting.status === "active" ? (
                    <span className="text-xs text-muted-foreground">
                      Managed via environment variables
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Configuration UI pending
                    </span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
