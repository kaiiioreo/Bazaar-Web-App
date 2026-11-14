// Turns database rows into the JSON the frontend receives.
// Field names follow the SDD data dictionary (snake_case).

export const dateOnly = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null)

// Upcoming events whose date has passed are reported as completed.
export function eventStatus(ev) {
  if (ev.status !== 'upcoming') return ev.status
  const today = new Date().toISOString().slice(0, 10)
  return dateOnly(ev.date) < today ? 'completed' : 'upcoming'
}

export function user(u) {
  return {
    user_id: u.user_id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    created_at: dateOnly(u.created_at),
  }
}

export function product(p) {
  return {
    product_id: p.product_id,
    vendor_id: p.vendor_id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    category: p.category,
    stock_status: p.stock_status,
    image: p.image ?? '',
    vendor_name: p.vendor?.business_name,
  }
}

// `reviews` is optional: pass visible reviews to include rating + review_count.
export function vendor(v, reviews) {
  const list = reviews ?? v.reviews
  const out = {
    vendor_id: v.vendor_id,
    business_name: v.business_name,
    category: v.category,
    description: v.description,
    profile_image: v.profile_image ?? '',
    contact_info: v.contact_info ?? '',
    contact_phone: v.contact_phone ?? '',
    ai_summary: v.ai_summary ?? '',
    status: v.user?.status,
  }
  if (list) {
    const visible = list.filter((r) => r.status === undefined || r.status === 'visible')
    out.review_count = visible.length
    out.rating = visible.length
      ? Math.round((visible.reduce((s, r) => s + r.rating, 0) / visible.length) * 10) / 10
      : 0
  }
  return out
}

export function event(ev) {
  return {
    event_id: ev.event_id,
    name: ev.name,
    date: dateOnly(ev.date),
    location: ev.location,
    total_slots: ev.total_slots,
    status: eventStatus(ev),
    registration_open: ev.registration_open,
  }
}

export function review(r) {
  return {
    review_id: r.review_id,
    customer_id: r.customer_id,
    vendor_id: r.vendor_id,
    customer_name: r.customer?.name,
    vendor_name: r.vendor?.business_name,
    rating: r.rating,
    comment: r.comment,
    status: r.status,
    ai_flag: r.ai_flag,
    ai_flag_reason: r.ai_flag_reason ?? '',
    created_at: dateOnly(r.created_at),
  }
}

export function application(a) {
  return {
    application_id: a.application_id,
    user_id: a.user_id,
    business_name: a.business_name,
    applicant_name: a.user?.name,
    email: a.user?.email,
    product_category: a.product_category,
    business_details: a.business_details,
    status: a.status,
    ai_flag: a.ai_flag,
    ai_flag_reason: a.ai_flag_reason ?? '',
    rejection_reason: a.rejection_reason ?? '',
    submitted_at: dateOnly(a.submitted_at),
    reviewed_at: dateOnly(a.reviewed_at),
  }
}

export function notification(n) {
  return {
    notification_id: n.notification_id,
    type: n.type,
    message: n.message,
    link: n.link ?? '',
    is_read: n.is_read,
    created_at: n.created_at,
  }
}
