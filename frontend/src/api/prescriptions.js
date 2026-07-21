import api from './axios';

export const createPrescription = (payload) => api.post('/prescriptions', payload).then((r) => r.data);
export const getMyPrescriptions = () => api.get('/prescriptions/me').then((r) => r.data);
export const getPrescription = (id) => api.get(`/prescriptions/${id}`).then((r) => r.data);
export const updatePrescription = (id, payload) => api.patch(`/prescriptions/${id}`, payload).then((r) => r.data);
