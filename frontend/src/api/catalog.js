import api from './client'

// Public browsing for guests and customers.
// The customer pages were built with camelCase mock data, so these helpers
// convert the API's snake_case fields into that shape.

const ACCENTS = ['#b45309', '#be123c', '#d97706', '#0f766e', '#44403c', '#15803d', '#7c3aed', '#0369a1']

export const toVendor = (v) => ({
  id: v.vendor_id,
  name: v.business_name,
  category: v.category,
  description: v.description,
  image: v.profile_image,
  rating: v.rating ?? 0,
  reviewCount: v.review_count ?? 0,
  aiSummary: v.ai_summary,
  accent: ACCENTS[v.vendor_id % ACCENTS.length],
})

export const toProduct = (p) => ({
  id: p.product_id,
  vendorId: p.vendor_id,
  vendorName: p.vendor_name,
  name: p.name,
  price: p.price,
  category: p.category,
  stock: p.stock_status,
  description: p.description,
  image: p.image,
})

export const toReview = (r) => ({
  id: r.review_id,
  vendorId: r.vendor_id,
  vendorName: r.vendor_name,
  customerId: r.customer_id,
  author: r.customer_name,
  rating: r.rating,
  comment: r.comment,
  date: r.created_at,
  flagged: r.ai_flag,
})

export const toEvent = (e) => ({
  id: e.event_id,
  name: e.name,
  date: e.date,
  location: e.location,
  totalStalls: e.total_slots,
  vendors: (e.vendors ?? []).map((v) => ({ id: v.vendor_id, name: v.business_name, slot: v.slot_label })),
  vendorIds: (e.vendors ?? []).map((v) => v.vendor_id),
  slot: e.slot_label ?? null,
})

export const getCategories = () => api.get('/categories').then((r) => r.data)

export const getVendors = (params) => api.get('/vendors', { params }).then((r) => r.data.map(toVendor))

export const getVendor = (id) =>
  api.get(`/vendors/${id}`).then(({ data }) => ({
    ...toVendor(data),
    products: data.products.map(toProduct),
    reviews: data.reviews.map(toReview),
    events: data.events.map(toEvent),
  }))

export const getProducts = (params) => api.get('/products', { params }).then((r) => r.data.map(toProduct))

export const getEvents = () => api.get('/events').then((r) => r.data.map(toEvent))

// Natural-language search (AI with keyword fallback).
export const search = (query) =>
  api.post('/search', { query }).then(({ data }) => ({
    vendors: data.vendors.map(toVendor),
    products: data.products.map(toProduct),
    filters: data.filters,
  }))
