import nodemailer from 'nodemailer'

// Sends email through SMTP when configured. Without SMTP settings the message is
// printed in the backend terminal, which is enough for local testing and demos.
let transporter = null
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
}

export const emailEnabled = () => Boolean(transporter)

export async function sendEmail({ to, subject, text }) {
  if (!transporter) {
    console.log(`\n[email preview] To: ${to}\nSubject: ${subject}\n${text}\n`)
    return
  }
  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER, to, subject, text })
  } catch (err) {
    console.error('[email] failed to send:', err.message)
  }
}

export function sendPasswordResetEmail(user, link) {
  return sendEmail({
    to: user.email,
    subject: 'Reset your Bazaar password',
    text: `Hi ${user.name},\n\nUse this link to set a new password. It expires in 1 hour.\n\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
  })
}
