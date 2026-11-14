import api from './client'

// Vendor dashboard. Uses the SDD field names directly (snake_case).
export const getApplication = () => api.get('/vendor/application').then((r) => r.data)
export const submitApplication = (body) => api.post('/vendor/application', body).then((r) => r.data)

export const getProfile = () => api.get('/vendor/profile').then((r) => r.data)
export const updateProfile = (body) => api.put('/vendor/profile', body).then((r) => r.data)

export const getProducts = () => api.get('/vendor/products').then((r) => r.data)
export const createProduct = (body) => api.post('/vendor/products', body).then((r) => r.data)
export const updateProduct = (id, body) => api.put(`/vendor/products/${id}`, body).then((r) => r.data)
export const updateStock = (id, stock_status) =>
  api.patch(`/vendor/products/${id}/stock`, { stock_status }).then((r) => r.data)
export const deleteProduct = (id) => api.delete(`/vendor/products/${id}`)

export const getEvents = () => api.get('/vendor/events').then((r) => r.data)
export const preRegister = (eventId) => api.post(`/vendor/events/${eventId}/preregister`).then((r) => r.data)
export const withdraw = (eventId) => api.delete(`/vendor/events/${eventId}/preregister`)
