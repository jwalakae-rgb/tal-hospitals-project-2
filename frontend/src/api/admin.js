import api from './axios';

export const getOverview = () => api.get('/admin/analytics/overview').then((r) => r.data);
export const getDepartmentPerformance = () =>
  api.get('/admin/analytics/department-performance').then((r) => r.data);
export const getDoctorUtilization = () => api.get('/admin/analytics/doctor-utilization').then((r) => r.data);
export const getPatientDemographics = () => api.get('/admin/analytics/patient-demographics').then((r) => r.data);
export const getAllUsers = (params) => api.get('/admin/users', { params }).then((r) => r.data);
export const setUserActiveStatus = (id, isActive) =>
  api.patch(`/admin/users/${id}/status`, { isActive }).then((r) => r.data);
