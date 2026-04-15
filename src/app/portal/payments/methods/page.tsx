import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { LinkButton } from "@/components/shared/link-button";
import { ArrowLeft } from "lucide-react";
import { PaymentMethodsManager } from "./_components/payment-methods-manager";

export default async function ParentPaymentMethodsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const methods = await db.paymentMethod.findMany({
    where: { userId: session.user.id },
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
          Payment Methods
        </h1>
        <p className="text-muted-foreground mt-1">
          Save a credit card or bank account for tuition payments and auto-pay.
        </p>
      </div>
      <PaymentMethodsManager
        initialMethods={methods.map((m) => ({
          id: m.id,
          type: m.type,
          last4: m.last4,
          brand: m.brand,
          bankName: m.bankName,
          accountNickname: m.accountNickname,
          expiryMonth: m.expiryMonth,
          expiryYear: m.expiryYear,
          isDefault: m.isDefault,
        }))}
      />
    </div>
  );
}
