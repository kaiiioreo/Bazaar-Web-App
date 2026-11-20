import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import catalogRoutes from './routes/catalog.js'
import customerRoutes from './routes/customer.js'
import vendorRoutes from './routes/vendor.js'
import adminRoutes from './routes/admin.js'
import aiRoutes from './routes/ai.js'
import notificationRoutes from './routes/notifications.js'

export const app = express()

app.use(cors({ origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',') }))
app.use(express.json({ limit: '5mb' })) // product photos are sent as small data URLs

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api', catalogRoutes) // /api/vendors, /api/products, /api/events, /api/search, /api/categories
app.use('/api/customer', customerRoutes)
app.use('/api/vendor', vendorRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/notifications', notificationRoutes)

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))

// One error handler for the whole API. Routes just `throw new HttpError(...)`.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Upload is too large.' })
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body.' })
  if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' }) // Prisma: record missing
  if (err.code === 'P2002') return res.status(409).json({ error: 'That already exists.' }) // unique constraint
  const status = err.status || 500
  if (status >= 500) console.error(err)
  res.status(status).json({ error: status >= 500 ? 'Something went wrong on the server.' : err.message })
})
