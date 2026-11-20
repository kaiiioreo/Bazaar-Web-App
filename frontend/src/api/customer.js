import api from './client'
import { toReview, toVendor } from './catalog'

export const getFavorites = () =>
  api.get('/customer/favorites').then(({ data }) => ({ ids: data.vendor_ids, vendors: data.vendors.map(toVendor) }))

export const toggleFavoriteVendor = (vendorId) =>
  api.post('/customer/favorites/toggle', { target_type: 'vendor', target_id: vendorId }).then((r) => r.data)

export const getMyReviews = () => api.get('/customer/reviews').then((r) => r.data.map(toReview))

export const createReview = (vendorId, rating, comment) =>
  api.post('/customer/reviews', { vendor_id: vendorId, rating, comment }).then((r) => toReview(r.data))

export const updateReview = (id, rating, comment) =>
  api.put(`/customer/reviews/${id}`, { rating, comment }).then((r) => toReview(r.data))

export const deleteReview = (id) => api.delete(`/customer/reviews/${id}`)
