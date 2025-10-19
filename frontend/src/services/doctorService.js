import api from './api';

export const doctorService = {
  getAllDoctors: async (page = 1, limit = 10, filters = {}) => {
    const params = {
      page,
      limit,
      ...filters
    };
    const response = await api.get('/doctors', { params });
    return response.data;
  },

  getDoctorById: async (doctorId) => {
    const response = await api.get(`/doctors/${doctorId}`);
    return response.data.doctor;
  },

  getDoctorAvailability: async (doctorId) => {
    const response = await api.get(`/doctors/${doctorId}/availability`);
    return response.data;
  },

  createDoctorProfile: async (profileData) => {
    const response = await api.post('/doctors', profileData);
    return response.data;
  },

  updateDoctorProfile: async (doctorId, profileData) => {
    const response = await api.put(`/doctors/${doctorId}`, profileData);
    return response.data;
  },

  updateAvailability: async (doctorId, availability) => {
    const response = await api.put(`/doctors/${doctorId}/availability`, { availability });
    return response.data;
  },

  getDoctorStats: async (doctorId) => {
    const response = await api.get(`/doctors/${doctorId}/stats`);
    return response.data.stats;
  },

  toggleDoctorStatus: async (doctorId) => {
    const response = await api.put(`/doctors/${doctorId}/toggle-status`);
    return response.data;
  }
};