import { useState } from 'react'
import { vendorAssist } from '../../api/ai'
import Button from '../ui/Button'

// VendorAIApplicationAssistant(): chat with the AI about the application or listings.
export default function AIAssistantPanel({
  greeting = 'Hi! I can help you complete your application or write a product listing. What would you like to do?',
}) {
  const [messages, setMessages] = useState([{ from: 'ai', text: greeting }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const sendMessage = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    const next = [...messages, { from: 'me', text }]
    setMessages(next)
    setInput('')
    setSending(true)
    try {
      // Skip the greeting: the conversation must start with the vendor's message.
      const history = next.slice(1).map((m) => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text }))
      const reply = await vendorAssist(history)
      setMessages((m) => [...m, { from: 'ai', text: reply }])
    } catch (err) {
      setMessages((m) => [...m, { from: 'ai', text: `Sorry, something went wrong: ${err.message}` }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-[28rem] max-w-2xl flex-col rounded-xl border border-line bg-white">
      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.map((m, i) => (
          <p
            key={i}
            className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${m.from === 'me' ? 'ml-auto bg-brand text-white' : 'bg-cream text-ink'}`}
          >
            {m.text}
          </p>
        ))}
        {sending && <p className="max-w-[80%] rounded-2xl bg-cream px-3 py-2 text-sm text-muted">Thinking…</p>}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 border-t border-line p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the assistant"
          aria-label="Message the AI assistant"
          className="min-w-0 flex-1 rounded-full border border-line px-4 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <Button type="submit" disabled={sending || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  )
}
