import api from './client'

// messages: [{ role: 'user' | 'assistant', content: string }]
export const chat = (messages) => api.post('/ai/chat', { messages }).then((r) => r.data.reply)
export const vendorAssist = (messages) => api.post('/ai/vendor-assist', { messages }).then((r) => r.data.reply)
export const generateListing = (notes) => api.post('/ai/generate-listing', { notes }).then((r) => r.data)
