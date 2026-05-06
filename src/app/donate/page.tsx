import { db } from "@/server/db";
import { DonateClient } from "./_components/donate-client";

export const metadata = {
  title: "Donate — JETS School",
  description:
    "Support JETS School with a tax-deductible donation. JETS Synagogue is a 501(c)(3) nonprofit (EIN 68-0500418).",
};

export default async function DonatePage() {
  // Pull a few public-safe school details so the page works whether the
  // school updates them or not.
  const settings = await db.systemSettings.findUnique({
    where: { id: "settings" },
    select: {
      schoolName: true,
      schoolLegalName: true,
      schoolEin: true,
      schoolAddress: true,
      schoolPhone: true,
      schoolEmail: true,
    },
  });

  return (
    <DonateClient
      school={{
        name: settings?.schoolName ?? "JETS School",
        legalName: settings?.schoolLegalName ?? "JETS Synagogue",
        ein: settings?.schoolEin ?? "68-0500418",
        address: settings?.schoolAddress ?? "Granada Hills, Los Angeles, CA",
        phone: settings?.schoolPhone ?? "(818) 831-3000",
        email: settings?.schoolEmail ?? "info@jetsschool.org",
      }}
      stripePublishableKey={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""}
    />
  );
}
