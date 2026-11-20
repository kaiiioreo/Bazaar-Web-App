// npm run email:check            -> checks the Gmail/SMTP login
// npm run email:check you@x.com  -> also sends a test email to that address
import 'dotenv/config'
import { emailSender, sendEmail, verifyEmail } from '../src/services/email.js'

try {
  console.log(`Checking SMTP login for ${emailSender() || '(no SMTP_USER)'}...`)
  await verifyEmail()
  console.log('OK: logged in to the mail server.')
  const to = process.argv[2]
  if (to) {
    const sent = await sendEmail({
      to,
      subject: 'Bazaar test email',
      text: 'This is a test email from the Bazaar backend. If you can read this, password reset emails will work.',
    })
    console.log(sent ? `OK: test email sent to ${to}. Check the inbox (and Spam).` : 'FAILED: see the error above.')
  }
} catch (err) {
  console.error('FAILED:', err.message)
  if (/Invalid login|BadCredentials|535/i.test(err.message)) {
    console.error(
      'Tip: use a Gmail App Password (16 letters), not the normal Gmail password, and turn on 2-Step Verification.',
    )
  }
  process.exitCode = 1
}
