import { prisma } from '../lib/prisma.js'

// CreateNotification() from SDD 5.7. Notifications are in-app (bell icon).
export function notify(user_id, type, message, link = null) {
  return prisma.notification.create({ data: { user_id, type, message, link } })
}

export async function notifyMany(userIds, type, message, link = null) {
  const ids = [...new Set(userIds)]
  if (!ids.length) return
  await prisma.notification.createMany({ data: ids.map((user_id) => ({ user_id, type, message, link })) })
}

export async function notifyAdmins(type, message, link = null) {
  const admins = await prisma.user.findMany({ where: { role: 'admin', status: 'active' }, select: { user_id: true } })
  await notifyMany(admins.map((a) => a.user_id), type, message, link)
}

// Customers who favorited a vendor (SendScheduleNotification).
export async function customersFavoritingVendor(vendor_id) {
  const favs = await prisma.favorite.findMany({ where: { vendor_id }, select: { customer_id: true } })
  return favs.map((f) => f.customer_id)
}

// Customers who favorited a product or its vendor (SendRestockNotification).
export async function customersFavoritingProduct(product) {
  const favs = await prisma.favorite.findMany({
    where: { OR: [{ product_id: product.product_id }, { vendor_id: product.vendor_id }] },
    select: { customer_id: true },
  })
  return favs.map((f) => f.customer_id)
}
