import api from './api';

export const reviewService = {
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  getDoctorReviews: async (doctorId, page = 1, limit = 10) => {
    const response = await api.get(`/reviews/doctor/${doctorId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  getMyReviews: async () => {
    const response = await api.get('/reviews/my-reviews');
    return response.data.reviews;
  },

  updateReview: async (reviewId, updateData) => {
    const response = await api.put(`/reviews/${reviewId}`, updateData);
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  markReviewHelpful: async (reviewId) => {
    const response = await api.put(`/reviews/${reviewId}/helpful`);
    return response.data;
  }
};