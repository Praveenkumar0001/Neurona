const SymptomReport = require('../models/SymptomReport');

class ReportService {
  async createReport(reportData) {
    const report = new SymptomReport(reportData);
    await report.save();
    logger.info('Report created in service', { reportId: report._id });
    return report;
  }

  async getReportById(id) {
    return await SymptomReport.findById(id);
  }

  async getReportsByPatient(patientId) {
    return await SymptomReport.find({ patientId });
  }

  async updateReport(id, updateData) {
    return await SymptomReport.findByIdAndUpdate(id, updateData, { new: true });
  }
}

module.exports = new ReportService();