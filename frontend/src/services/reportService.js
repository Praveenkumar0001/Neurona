import api from './api';

export const reportService = {
  downloadReportPDF: async (reportId) => {
    const response = await api.get(`/reports/${reportId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  regenerateReportPDF: async (reportId) => {
    const response = await api.post(`/reports/${reportId}/regenerate`);
    return response.data;
  },

  shareReportWithDoctor: async (reportId, doctorId) => {
    const response = await api.post(`/reports/${reportId}/share`, { doctorId });
    return response.data;
  },

  getSharedReports: async (page = 1, limit = 10) => {
    const response = await api.get('/reports/shared', {
      params: { page, limit }
    });
    return response.data;
  }
};