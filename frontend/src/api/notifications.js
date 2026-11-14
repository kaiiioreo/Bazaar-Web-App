import api from './client'

export const getNotifications = () => api.get('/notifications').then((r) => r.data)
export const markRead = (id) => api.post(`/notifications/${id}/read`)
export const markAllRead = () => api.post('/notifications/read-all')
