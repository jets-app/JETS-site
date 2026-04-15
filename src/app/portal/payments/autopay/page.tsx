import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { LinkButton } from "@/components/shared/link-button";
import { ArrowLeft } from "lucide-react";
import { AutoPayManager } from "./_components/autopay-manager";

export default async function AutoPayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  let settings = await db.autoPaySettings.findUnique({ where: { userId } });
  if (!settings) {
    settings = await db.autoPaySettings.create({
      data: { userId, enabled: true },
    });
  }
  const methods = await db.paymentMethod.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <LinkButton href="/portal/payments" variant="ghost" size="sm">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Payments
        </LinkButton>
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Auto-Pay
        </h1>
        <p className="text-muted-foreground mt-1">
          Tuition is automatically paid on the due date from your selected
          payment method.
        </p>
      </div>
      <AutoPayManager
        enabled={settings.enabled}
        currentMethodId={settings.paymentMethodId}
        methods={methods.map((m) => ({
          id: m.id,
          type: m.type,
          last4: m.last4,
          brand: m.brand,
          bankName: m.bankName,
          isDefault: m.isDefault,
        }))}
      />
    </div>
  );
}
