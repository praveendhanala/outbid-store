"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type ContactState = {
  success: boolean;
  message: string;
};

export async function sendContactMessage(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  // Honeypot field. Real users won't see this.
  const website = String(formData.get("website") || "").trim();

  if (website) {
    // Silently accept spam submissions.
    return {
      success: true,
      message: "Message sent.",
    };
  }

  if (!name || !email || !message) {
    return {
      success: false,
      message: "Fill in every field.",
    };
  }

  if (!email.includes("@") || email.length > 254) {
    return {
      success: false,
      message: "Enter a valid email.",
    };
  }

  if (name.length > 100 || message.length > 5000) {
    return {
      success: false,
      message: "Your message is too long.",
    };
  }

  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) {
    console.error("Missing contact email configuration.");

    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }

  const { error } = await resend.emails.send({
    from: "Outbid Contact <hello@outbid.store>",
    to: [process.env.CONTACT_EMAIL],
    replyTo: email,
    subject: `Contact form: ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message,
    ].join("\n"),
  });

  if (error) {
    console.error("Contact form error:", error);

    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }

  return {
    success: true,
    message: "Message sent. We'll get back to you soon.",
  };
}
