import { useState } from 'react'
import Icon from './Icon.jsx'
import { chat } from '../../api/ai'

const suggestions = ['When is the next bazaar?', 'Who sells coffee?']

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)

  // ChatbotRespond(): sends the conversation to the backend AI module.
  async function sendMessage(value = input) {
    const text = value.trim()
    if (!text || sending) return

    const next = [...messages, { from: 'you', text }]
    setMessages(next)
    setInput('')
    setSending(true)
    try {
      const reply = await chat(next.map((m) => ({ role: m.from === 'you' ? 'user' : 'assistant', content: m.text })))
      setMessages((current) => [...current, { from: 'bazaar', text: reply }])
    } catch (err) {
      setMessages((current) => [...current, { from: 'bazaar', text: `Sorry, I couldn't answer that right now. ${err.message}` }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chat-widget">
      {isOpen && (
        <section className="chat-panel" aria-label="Bazaar chat assistant">
          <div className="chat-heading">
            <span className="chat-avatar"><Icon name="sparkles" size={19} /></span>
            <div>
              <strong>Ask Bazaar</strong>
              <span>Here to help you find the good stuff</span>
            </div>
            <button type="button" className="chat-close" aria-label="Close chat" onClick={() => setIsOpen(false)}>
              <Icon name="close" size={19} />
            </button>
          </div>
          <div className="chat-messages" aria-live="polite">
            <div className="chat-bubble chat-bubble-bot">
              Hello! Ask me about finding products and vendors, or checking a bazaar schedule.
            </div>
            {messages.map((message, index) => (
              <div className={`chat-bubble chat-bubble-${message.from}`} key={`${message.from}-${index}`}>
                {message.text}
              </div>
            ))}
            {sending && <div className="chat-bubble chat-bubble-bazaar">Typing…</div>}
            {messages.length === 0 && (
              <div className="chat-suggestions">
                {suggestions.map((suggestion) => (
                  <button type="button" key={suggestion} onClick={() => sendMessage(suggestion)}>
                    {suggestion} <Icon name="arrow-up-right" size={13} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <form
            className="chat-form"
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage()
            }}
          >
            <label className="sr-only" htmlFor="chat-message">Ask Bazaar a question</label>
            <input
              id="chat-message"
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask us anything..."
              value={input}
            />
            <button type="submit" aria-label="Send message" disabled={!input.trim() || sending}>
              <Icon name="send" size={17} />
            </button>
          </form>
          <p className="chat-note">AI answers may be wrong. Check the schedule for exact details.</p>
        </section>
      )}
      <button
        className={`chat-launcher${isOpen ? ' is-active' : ''}`}
        type="button"
        aria-label={isOpen ? 'Close Bazaar assistant' : 'Chat with Bazaar'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Icon name={isOpen ? 'close' : 'message'} size={22} />
        {!isOpen && <span>Ask Bazaar</span>}
      </button>
    </div>
  )
}
