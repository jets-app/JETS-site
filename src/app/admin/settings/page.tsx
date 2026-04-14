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
  Building2,
  FileBarChart,
  CreditCard,
  Mail,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

type SettingCard = {
  title: string;
  description: string;
  href: string | null;
  icon: React.ComponentType<{ className?: string }>;
  status: "ready" | "coming-soon";
};

const SETTINGS: SettingCard[] = [
  {
    title: "School Info",
    description:
      "Academic year, school name, address, and basic organization details.",
    href: null,
    icon: Building2,
    status: "coming-soon",
  },
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
      "Accept online payments for application fees, tuition, and donations.",
    href: null,
    icon: CreditCard,
    status: "coming-soon",
  },
  {
    title: "Email",
    description:
      "SMTP / transactional email provider configuration and templates.",
    href: null,
    icon: Mail,
    status: "coming-soon",
  },
  {
    title: "SMS / Twilio",
    description: "Send text notifications to parents and staff.",
    href: null,
    icon: MessageSquare,
    status: "coming-soon",
  },
];

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure integrations and school-wide defaults.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {SETTINGS.map((setting) => {
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
  );
}
