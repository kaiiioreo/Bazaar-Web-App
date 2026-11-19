// Checks your AI settings in .env:  npm run ai:check
// Lists the Gemini models your key can use, then sends one test request.
import 'dotenv/config'
import { aiInfo, testAI } from '../src/services/ai.js'

const info = aiInfo()
console.log(`Provider: ${info.provider} | Model: ${info.model}`)
if (!info.enabled) {
  console.log('No AI_API_KEY in backend/.env, so the app uses its built-in fallbacks.')
  process.exit(0)
}

if (info.provider === 'gemini') {
  const base = process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'
  try {
    const res = await fetch(`${base}/models?pageSize=200`, { headers: { 'x-goog-api-key': process.env.AI_API_KEY } })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || res.statusText)
    const names = (data.models || [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent') && /flash/i.test(m.name))
      .map((m) => m.name.replace('models/', ''))
    console.log(`\nFlash models your key can use:\n  ${names.join('\n  ') || '(none found)'}`)
  } catch (err) {
    console.log(`\nCould not list models: ${err.message}`)
  }
}

console.log('\nSending a test request...')
const result = await testAI()
if (result.ok) {
  console.log(`OK: "${result.text}"`)
} else {
  console.log(`FAILED: ${result.error}`)
  console.log('Tips: check the key, or set AI_MODEL in .env to one of the models listed above.')
  process.exitCode = 1
}
