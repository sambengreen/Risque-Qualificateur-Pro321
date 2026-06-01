// Resend integration for sending transactional emails
import { Resend } from "resend";

export async function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY non configuree. Ajoutez votre cle API Resend dans les secrets.");
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  return {
    client: new Resend(apiKey),
    fromEmail,
  };
}
