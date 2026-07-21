import api from './axios';

export const getMyPatientProfile = () => api.get('/patients/me').then((r) => r.data);
export const updateMyPatientProfile = (payload) => api.patch('/patients/me', payload).then((r) => r.data);
export const getMyReports = () => api.get('/patients/me/reports').then((r) => r.data);
export const uploadReport = (formData) =>
  api
    .post('/patients/me/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data);

export const getPatients = (params) => api.get('/patients', { params }).then((r) => r.data);
export const getPatient = (id) => api.get(`/patients/${id}`).then((r) => r.data);
