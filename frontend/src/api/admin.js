import api from './client'

export const getStats = () => api.get('/admin/stats').then((r) => r.data)

export const getApplications = () => api.get('/admin/applications').then((r) => r.data)
export const approveApplication = (id) => api.post(`/admin/applications/${id}/approve`).then((r) => r.data)
export const rejectApplication = (id, reason) =>
  api.post(`/admin/applications/${id}/reject`, { reason }).then((r) => r.data)

export const getVendors = () => api.get('/admin/vendors').then((r) => r.data)

export const getUsers = () => api.get('/admin/users').then((r) => r.data)
export const setUserStatus = (id, status) => api.patch(`/admin/users/${id}/status`, { status }).then((r) => r.data)
export const sendPasswordReset = (id) => api.post(`/admin/users/${id}/reset-password`).then((r) => r.data)

export const getEvents = () => api.get('/admin/events').then((r) => r.data)
export const createEvent = (body) => api.post('/admin/events', body).then((r) => r.data)
export const updateEvent = (id, body) => api.put(`/admin/events/${id}`, body).then((r) => r.data)
export const setRegistration = (id, open) =>
  api.patch(`/admin/events/${id}/registration`, { open }).then((r) => r.data)
export const cancelEvent = (id) => api.post(`/admin/events/${id}/cancel`).then((r) => r.data)

export const getEventSlots = (eventId) => api.get(`/admin/events/${eventId}/slots`).then((r) => r.data)
export const assignSlot = (slotId, vendorId) =>
  api.put(`/admin/slots/${slotId}/assign`, { vendor_id: vendorId }).then((r) => r.data)
export const unassignSlot = (slotId) => api.delete(`/admin/slots/${slotId}/assign`)

export const getReviews = () => api.get('/admin/reviews').then((r) => r.data)
export const updateReview = (id, changes) => api.patch(`/admin/reviews/${id}`, changes).then((r) => r.data)
