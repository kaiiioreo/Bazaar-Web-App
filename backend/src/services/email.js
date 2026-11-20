import nodemailer from 'nodemailer'

// Sends email through SMTP (for example Gmail) when it is set up in .env. Without SMTP settings,
// or if sending fails, the message is printed in the backend terminal so the reset link is never lost.
let transporter = null
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  const port = Number(process.env.SMTP_PORT || 465)
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    // Gmail App Passwords are shown with spaces ("abcd efgh ijkl mnop"); remove them just in case.
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS.replace(/\s+/g, '') },
  })
}

export const emailEnabled = () => Boolean(transporter)
export const emailSender = () => process.env.SMTP_USER || ''
const fromAddress = () => process.env.EMAIL_FROM || `Bazaar <${process.env.SMTP_USER}>`

function printPreview({ to, subject, text }) {
  console.log(`\n[email preview] To: ${to}\nSubject: ${subject}\n${text}\n`)
}

// Returns true if the email was sent, false if it was only printed in the terminal.
export async function sendEmail({ to, subject, text, html }) {
  if (!transporter) {
    printPreview({ to, subject, text })
    return false
  }
  try {
    await transporter.sendMail({ from: fromAddress(), to, subject, text, html })
    console.log(`[email] sent "${subject}" to ${to}`)
    return true
  } catch (err) {
    console.error('[email] failed to send:', err.message)
    printPreview({ to, subject, text })
    return false
  }
}

// Checks that the SMTP login works (used by `npm run email:check`).
export async function verifyEmail() {
  if (!transporter) throw new Error('SMTP is not set up. Fill in SMTP_HOST, SMTP_USER and SMTP_PASS in backend/.env.')
  await transporter.verify()
}

const escape = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

export function sendPasswordResetEmail(user, link) {
  const name = escape(user.name)
  return sendEmail({
    to: user.email,
    subject: 'Reset your Bazaar password',
    text:
      `Hi ${user.name},\n\nWe received a request to reset your Bazaar password. ` +
      `Use this link to set a new one. It expires in 1 hour.\n\n${link}\n\n` +
      'If you did not ask for this, you can ignore this email. Your password will not change.\n\n- The Bazaar team',
    html: `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f7f3ec;font-family:Arial,Helvetica,sans-serif;color:#2b2622">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e6ded2;border-radius:12px">
      <tr><td style="padding:28px 28px 8px;font-size:22px;font-weight:bold;color:#1f3b2d">Bazaar</td></tr>
      <tr><td style="padding:8px 28px;font-size:15px;line-height:1.6">
        <p style="margin:0 0 12px">Hi ${name},</p>
        <p style="margin:0 0 20px">We received a request to reset your Bazaar password. Click the button to set a new one. The link expires in 1 hour.</p>
        <p style="margin:0 0 20px"><a href="${escape(link)}" style="display:inline-block;background:#1f3b2d;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold">Reset password</a></p>
        <p style="margin:0 0 8px;font-size:13px;color:#6b625a">If the button doesn't work, copy this link into your browser:</p>
        <p style="margin:0 0 20px;font-size:13px;word-break:break-all"><a href="${escape(link)}" style="color:#1f3b2d">${escape(link)}</a></p>
        <p style="margin:0 0 24px;font-size:13px;color:#6b625a">If you didn't ask for this, you can ignore this email. Your password won't change.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`,
  })
}
