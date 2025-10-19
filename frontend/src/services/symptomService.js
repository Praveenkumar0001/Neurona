import api from './api';

export const symptomService = {
  submitSymptoms: async (responses) => {
    const response = await api.post('/symptoms/submit', { responses });
    return response.data;
  },

  getMyReports: async (page = 1, limit = 10) => {
    const response = await api.get('/symptoms/my-reports', {
      params: { page, limit }
    });
    return response.data;
  },

  getLatestReport: async () => {
    const response = await api.get('/symptoms/latest');
    return response.data.report;
  },

  getReportById: async (reportId) => {
    const response = await api.get(`/symptoms/reports/${reportId}`);
    return response.data.report;
  },

  deleteReport: async (reportId) => {
    const response = await api.delete(`/symptoms/reports/${reportId}`);
    return response.data;
  }
};