// In-app notifications for any logged-in user (SRS 3.1.3.6).
import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { HttpError, toId } from '../lib/http.js'
import * as out from '../lib/serialize.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res) => {
  const list = await prisma.notification.findMany({
    where: { user_id: req.user.user_id },
    orderBy: { created_at: 'desc' },
    take: 50,
  })
  res.json({ unread: list.filter((n) => !n.is_read).length, items: list.map(out.notification) })
})

router.post('/read-all', async (req, res) => {
  await prisma.notification.updateMany({ where: { user_id: req.user.user_id, is_read: false }, data: { is_read: true } })
  res.status(204).end()
})

router.post('/:id/read', async (req, res) => {
  const notification_id = toId(req.params.id)
  const { count } = await prisma.notification.updateMany({
    where: { notification_id, user_id: req.user.user_id },
    data: { is_read: true },
  })
  if (!count) throw new HttpError(404, 'Notification not found')
  res.status(204).end()
})

export default router
