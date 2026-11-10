import { useState } from 'react'
import Icon from './Icon.jsx'

const suggestions = ['Find a vendor', 'Check bazaar dates']

function getReply(message) {
  const text = message.toLowerCase()

  if (text.includes('weekend') || text.includes('event') || text.includes('market')) {
    return 'You can find bazaar dates, locations, and attending vendors in the schedule section. This preview does not have live event data yet.'
  }
  if (text.includes('product') || text.includes('search') || text.includes('gift') || text.includes('present')) {
    return 'Try searching for a product or vendor using everyday words. Product search will be connected when the marketplace data is available.'
  }
  if (text.includes('vendor') || text.includes('stall') || text.includes('maker')) {
    return 'Browse the vendor listings to see who is participating. Vendors can create an account to get started.'
  }
  if (text.includes('favorite') || text.includes('save') || text.includes('review')) {
    return 'Saving favorites and leaving vendor reviews are customer account features. You can create a customer account to use them.'
  }
  return 'I can help with finding products and vendors or checking the bazaar schedule. What are you looking for?'
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])

  function sendMessage(value = input) {
    const text = value.trim()
    if (!text) return

    setMessages((current) => [
      ...current,
      { from: 'you', text },
      { from: 'bazaar', text: getReply(text) },
    ])
    setInput('')
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
            <button type="submit" aria-label="Send message" disabled={!input.trim()}>
              <Icon name="send" size={17} />
            </button>
          </form>
          <p className="chat-note">Demo preview — chat service is not connected</p>
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
