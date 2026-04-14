import { auth } from "@/server/auth";
import { redirect, notFound } from "next/navigation";
import {
  getApplicationForReview,
  getReviewTimeline,
} from "@/server/actions/review.actions";
import { ReviewApplicationView } from "./_components/review-application-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewApplicationPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "PRINCIPAL" && role !== "REVIEWER" && role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  let application;
  let timeline;
  try {
    [application, timeline] = await Promise.all([
      getApplicationForReview(id),
      getReviewTimeline(id),
    ]);
  } catch {
    notFound();
  }

  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? null;

  return (
    <ReviewApplicationView
      application={JSON.parse(JSON.stringify(application))}
      timeline={JSON.parse(JSON.stringify(timeline))}
      calendlyUrl={calendlyUrl}
    />
  );
}
