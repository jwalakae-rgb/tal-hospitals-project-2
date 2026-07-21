import api from './axios';

export const createAppointment = (payload) => api.post('/appointments', payload).then((r) => r.data);
export const getMyAppointments = (params) => api.get('/appointments/me', { params }).then((r) => r.data);
export const getAllAppointments = (params) => api.get('/appointments', { params }).then((r) => r.data);
export const getAppointment = (id) => api.get(`/appointments/${id}`).then((r) => r.data);
export const updateAppointmentStatus = (id, payload) =>
  api.patch(`/appointments/${id}/status`, payload).then((r) => r.data);
export const rescheduleAppointment = (id, payload) =>
  api.patch(`/appointments/${id}/reschedule`, payload).then((r) => r.data);
export const cancelAppointment = (id, cancellationReason) =>
  api.delete(`/appointments/${id}`, { data: { cancellationReason } }).then((r) => r.data);
