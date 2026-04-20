import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "JETS School <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL SKIPPED - No API key] To: ${to} | Subject: ${subject}`);
    return { success: false, error: "No Resend API key configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: html ?? `<pre style="font-family: sans-serif; white-space: pre-wrap;">${text ?? ""}</pre>`,
    });

    if (error) {
      console.error("[EMAIL ERROR]", error);
      return { success: false, error: error.message };
    }

    console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject} | ID: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[EMAIL EXCEPTION]", err);
    return { success: false, error: String(err) };
  }
}
