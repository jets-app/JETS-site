import { getDocumentByToken } from "@/server/actions/document.actions";
import { DocumentSigningView } from "./signing-view";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function DocumentSigningPage({ params }: PageProps) {
  const { token } = await params;

  const result = await getDocumentByToken(token);

  if ("error" in result && result.error) {
    return <DocumentErrorPage error={result.error} />;
  }

  return (
    <DocumentSigningView
      document={JSON.parse(JSON.stringify(result.data))}
    />
  );
}

function DocumentErrorPage({
  error,
}: {
  error: "not_found" | "already_signed" | "expired" | "voided";
}) {
  const config = {
    not_found: {
      title: "Document Not Found",
      message:
        "This document link is invalid. Please check your email for the correct link, or contact the JETS School office.",
      icon: "?",
    },
    already_signed: {
      title: "Already Signed",
      message:
        "This document has already been signed. No further action is needed. Thank you!",
      icon: "\u2713",
    },
    expired: {
      title: "Document Expired",
      message:
        "This document link has expired. Please contact the JETS School office to request a new signing link.",
      icon: "\u23F0",
    },
    voided: {
      title: "Document Voided",
      message:
        "This document has been voided by the school administration. If you believe this is an error, please contact the JETS School office.",
      icon: "\u2715",
    },
  };

  const { title, message, icon } = config[error];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-3xl mx-auto">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            JETS School &middot; (818) 831-3000 &middot; info@jetsschool.org
          </p>
        </div>
      </div>
    </div>
  );
}
