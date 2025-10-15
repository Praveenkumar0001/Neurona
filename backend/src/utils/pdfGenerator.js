const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// Ensure upload directory exists
const ensureUploadDir = () => {
  const dir = path.join(__dirname, '../../uploads/reports');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

/**
 * Generate PDF report for symptom assessment
 */
const generateReportPDF = async (report, patientInfo) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      const fileName = `report-${report._id}-${Date.now()}.pdf`;
      const uploadDir = ensureUploadDir();
      const filePath = path.join(uploadDir, fileName);
      
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Add header with logo/branding
      doc.fontSize(28)
         .fillColor('#2563eb')
         .text('Neurona', { align: 'center' })
         .fontSize(14)
         .fillColor('#6b7280')
         .text('Mental Health Assessment Report', { align: 'center' })
         .moveDown(0.5);
      
      // Add horizontal line
      doc.moveTo(50, doc.y)
         .lineTo(545, doc.y)
         .stroke('#e5e7eb')
         .moveDown(2);
      
      // Report date and ID
      doc.fontSize(10)
      // Report date and ID
      doc.fontSize(10)
         .fillColor('#6b7280')
         .text(`Report ID: ${report._id.toString().slice(-8).toUpperCase()}`, 50, doc.y, { align: 'left' })
         .text(`Date: ${new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'right' })
         .moveDown(2);
      
      // Patient Information Section
      doc.fontSize(16)
         .fillColor('#1f2937')
         .text('Patient Information', { underline: true })
         .moveDown(0.5);
      
      doc.fontSize(12)
         .fillColor('#374151')
         .text(`Name: ${patientInfo.profile.name}`)
         .text(`Age: ${patientInfo.profile.age || 'N/A'}`)
         .text(`Gender: ${patientInfo.profile.gender || 'N/A'}`)
         .moveDown(2);
      
      // Assessment Summary Section
      doc.fontSize(16)
         .fillColor('#1f2937')
         .text('Assessment Summary', { underline: true })
         .moveDown(0.5);
      
      // Score box with color coding
      const severityColors = {
        'mild': '#10b981',
        'moderate': '#f59e0b',
        'severe': '#ef4444'
      };
      
      const severityColor = severityColors[report.analysis.severity];
      
      doc.rect(50, doc.y, 495, 100)
         .fillAndStroke('#f9fafb', '#e5e7eb')
         .fill();
      
      const boxY = doc.y - 90;
      
      doc.fontSize(14)
         .fillColor('#1f2937')
         .text(`Overall Score: ${report.analysis.overallScore}/30`, 60, boxY + 10);
      
      doc.fontSize(12)
         .fillColor(severityColor)
         .text(`Severity: ${report.analysis.severity.toUpperCase()}`, 60, boxY + 35);
      
      doc.fontSize(12)
         .fillColor('#1f2937')
         .text(`Recommendation: Consult a ${report.analysis.recommendation.toUpperCase()}`, 60, boxY + 55);
      
      doc.moveDown(3);
      
      // Detailed Assessment Section
      doc.fontSize(16)
         .fillColor('#1f2937')
         .text('Detailed Assessment', { underline: true })
         .moveDown(0.5);
      
      doc.fontSize(12)
         .fillColor('#374151');
      
      const responses = report.responses;
      
      doc.text(`Mood: ${responses.mood || 'N/A'}`)
         .text(`Energy Level: ${responses.energy || 'N/A'}/5`)
         .text(`Sleep Quality: ${responses.sleep || 'N/A'}`)
         .text(`Anxiety Level: ${responses.anxiety || 'N/A'}/5`)
         .text(`Appetite: ${responses.appetite || 'N/A'}`)
         .text(`Concentration: ${responses.concentration || 'N/A'}`)
         .text(`Social Withdrawal: ${responses.socialWithdrawal || 'N/A'}`)
         .text(`Symptom Duration: ${responses.duration || 'N/A'}`)
         .text(`Previous Treatment: ${responses.previousTreatment ? 'Yes' : 'No'}`)
         .moveDown(2);
      
      // Physical Symptoms
      if (responses.physicalSymptoms && responses.physicalSymptoms.length > 0) {
        doc.text('Physical Symptoms:', { continued: false });
        responses.physicalSymptoms.forEach(symptom => {
          doc.text(`  • ${symptom}`, { indent: 20 });
        });
        doc.moveDown(1);
      }
      
      // Additional Notes
      if (responses.additionalNotes) {
        doc.text('Additional Notes:', { continued: false })
           .text(responses.additionalNotes, { indent: 20 })
           .moveDown(2);
      }
      
      // Professional Analysis Section
      doc.addPage();
      
      doc.fontSize(16)
         .fillColor('#1f2937')
         .text('Professional Analysis', { underline: true })
         .moveDown(0.5);
      
      doc.fontSize(12)
         .fillColor('#374151')
         .text(report.analysis.summary, { align: 'justify', lineGap: 5 })
         .moveDown(2);
      
      // Recommended Actions Section
      doc.fontSize(16)
         .fillColor('#1f2937')
         .text('Recommended Actions', { underline: true })
         .moveDown(0.5);
      
      doc.fontSize(12)
         .fillColor('#374151');
      
      report.analysis.suggestedActions.forEach((action, index) => {
        doc.text(`${index + 1}. ${action}`, { indent: 20, lineGap: 3 });
      });
      
      doc.moveDown(2);
      
      // Important Information Box
      doc.rect(50, doc.y, 495, 80)
         .fillAndStroke('#fef3c7', '#f59e0b')
         .fill();
      
      const infoBoxY = doc.y - 70;
      
      doc.fontSize(12)
         .fillColor('#92400e')
         .text('⚠️ Important Information', 60, infoBoxY + 10, { underline: true })
         .fontSize(10)
         .text('This assessment is not a substitute for professional medical advice, diagnosis, or treatment.', 60, infoBoxY + 30, { width: 475 })
         .text('Always seek the advice of qualified health providers with any questions regarding your mental health.', 60, infoBoxY + 50, { width: 475 });
      
      doc.moveDown(3);
      
      // Emergency Helpline
      doc.fontSize(11)
         .fillColor('#ef4444')
         .text('🆘 Emergency Helpline: 9152987821 (iCALL - 8 AM to 10 PM, All days)', { align: 'center' })
         .moveDown(1);
      
      // Footer
      doc.moveDown(2)
         .fontSize(9)
         .fillColor('#9ca3af')
         .text('This report is confidential and intended for healthcare professionals and the patient only.', { align: 'center', lineGap: 2 })
         .text(`Generated by Neurona Mental Health Platform on ${new Date().toLocaleString()}`, { align: 'center' })
         .text('© 2024 Neurona. All rights reserved.', { align: 'center' });
      
      // Finalize PDF
      doc.end();
      
      stream.on('finish', () => {
        logger.info('PDF generated successfully', { fileName, reportId: report._id });
        resolve({ 
          filePath, 
          fileName,
          success: true 
        });
      });
      
      stream.on('error', (error) => {
        logger.error('PDF generation failed', { error: error.message });
        reject(error);
      });
      
    } catch (error) {
      logger.error('PDF generation error', { error: error.message });
      reject(error);
    }
  });
};

/**
 * Delete PDF file
 */
const deletePDF = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info('PDF deleted successfully', { filePath });
      return true;
    }
    return false;
  } catch (error) {
    logger.error('PDF deletion failed', { error: error.message, filePath });
    return false;
  }
};

module.exports = {
  generateReportPDF,
  deletePDF
};