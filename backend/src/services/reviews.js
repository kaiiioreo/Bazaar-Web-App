import { prisma } from '../lib/prisma.js'
import { summarizeReviews } from './ai.js'

// Re-generates a vendor's AI sentiment summary (SummarizeReviewSentiment).
// Called in the background after reviews change, so requests stay fast.
export async function refreshVendorSummary(vendor_id) {
  try {
    const vendor = await prisma.vendorProfile.findUnique({ where: { vendor_id } })
    if (!vendor) return
    const reviews = await prisma.review.findMany({
      where: { vendor_id, status: 'visible' },
      orderBy: { created_at: 'desc' },
    })
    const summary = await summarizeReviews(reviews, vendor.business_name)
    await prisma.vendorProfile.update({
      where: { vendor_id },
      data: { ai_summary: summary, ai_summary_updated_at: new Date() },
    })
  } catch (err) {
    console.error('[reviews] summary refresh failed:', err.message)
  }
}

export function refreshVendorSummaryLater(vendor_id) {
  setImmediate(() => refreshVendorSummary(vendor_id))
}
