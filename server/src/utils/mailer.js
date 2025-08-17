import nodemailer from "nodemailer";

export function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

export async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  return t.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html
  });
}
