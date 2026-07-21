import api from './axios';

export const getDepartments = () => api.get('/departments').then((r) => r.data);
export const createDepartment = (payload) => api.post('/departments', payload).then((r) => r.data);
export const updateDepartment = (id, payload) => api.patch(`/departments/${id}`, payload).then((r) => r.data);
export const deleteDepartment = (id) => api.delete(`/departments/${id}`).then((r) => r.data);
