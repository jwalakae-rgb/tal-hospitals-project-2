import api from './axios';

export const getDepartments = () => api.get('/departments').then((r) => r.data);
export const createDepartment = (payload) => api.post('/departments', payload).then((r) => r.data);

export const getDoctors = (params) => api.get('/doctors', { params }).then((r) => r.data);
export const getDoctor = (id) => api.get(`/doctors/${id}`).then((r) => r.data);
export const createDoctor = (payload) => api.post('/doctors', payload).then((r) => r.data);
export const updateDoctor = (id, payload) => api.patch(`/doctors/${id}`, payload).then((r) => r.data);
export const updateAvailability = (id, availability) =>
  api.patch(`/doctors/${id}/availability`, { availability }).then((r) => r.data);
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`).then((r) => r.data);
