const Doctor = require('../models/Doctor');

class DoctorService {
  async getAllDoctors(filters = {}) {
    return await Doctor.find(filters).select('-password');
  }

  async getDoctorById(id) {
    return await Doctor.findById(id);
  }

  async createDoctor(doctorData) {
    const doctor = new Doctor(doctorData);
    await doctor.save();
    logger.info('Doctor created in service', { doctorId: doctor._id });
    return doctor;
  }

  async updateDoctor(id, updateData) {
    return await Doctor.findByIdAndUpdate(id, updateData, { new: true });
  }

  async searchDoctors(query) {
    return await Doctor.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { specialization: { $regex: query, $options: 'i' } },
      ],
    });
  }
}

module.exports = new DoctorService();