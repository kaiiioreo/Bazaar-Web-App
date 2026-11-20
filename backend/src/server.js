import 'dotenv/config'
import { app } from './app.js'
import { aiInfo } from './services/ai.js'
import { emailEnabled } from './services/email.js'

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  console.error('Missing DATABASE_URL or JWT_SECRET. Copy .env.example to .env and fill it in.')
  process.exit(1)
}

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  console.log(`Bazaar API running on http://localhost:${port}`)
  const ai = aiInfo()
  console.log(
    `AI: ${ai.enabled ? `${ai.provider} (${ai.model})` : 'fallback mode (no AI_API_KEY)'} | Email: ${emailEnabled() ? 'SMTP' : 'printed in this terminal'}`,
  )
})
