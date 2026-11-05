import { useState } from 'react'

// UI shell only. Wire sendMessage to VendorAIApplicationAssistant() / GenerateVendorListing() once the AI module exists.
export default function AIAssistantPanel() {
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hi! I can help you complete your application or write a product listing. What would you like to do?' },
  ])
  const [input, setInput] = useState('')

  const sendMessage = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages((m) => [
      ...m,
      { from: 'me', text: input },
      { from: 'ai', text: 'The AI assistant is not connected yet. This reply is a placeholder.' },
    ])
    setInput('')
  }

  return (
    <div className="flex h-[28rem] max-w-2xl flex-col rounded-lg border border-stone-200">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <p key={i} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.from === 'me' ? 'ml-auto bg-stone-900 text-white' : 'bg-stone-100'}`}>
            {m.text}
          </p>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 border-t border-stone-200 p-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the assistant" className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-md bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700">Send</button>
      </form>
    </div>
  )
}
