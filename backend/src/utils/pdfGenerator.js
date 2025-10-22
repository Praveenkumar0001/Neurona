// src/utils/pdfGenerator.js (ESM)
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// project root: .../src/utils -> go up two levels
const ROOT_DIR = path.resolve(__dirname, '../../');
const REPORTS_DIR = path.join(ROOT_DIR, 'uploads', 'reports');

function ensureUploadDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  return REPORTS_DIR;
}

/**
 * Generate PDF report for symptom assessment
 * @param {object} report - SymptomReport mongoose doc or plain object
 * @param {object} patientInfo - User mongoose doc or plain object
 * @returns {Promise<{filePath: string, fileName: string, success: boolean}>}
 */
export const generateReportPDF = async (report, patientInfo) => {
  return new Promise((resolve, reject) => {
    try {
      ensureUploadDir();

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const fileName = `report-${report._id}-${Date.now()}.pdf`;
      const filePath = path.join(REPORTS_DIR, fileName);

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc
        .fontSize(28)
        .fillColor('#2563eb')
        .text('Neurona', { align: 'center' })
        .fontSize(14)
        .fillColor('#6b7280')
        .text('Mental Health Assessment Report', { align: 'center' })
        .moveDown(0.5);

      // Divider
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb').moveDown(2);

      // Report meta
      doc
        .fontSize(10)
        .fillColor('#6b7280')
        .text(
          `Report ID: ${report._id.toString().slice(-8).toUpperCase()}`,
          50,
          doc.y,
          { align: 'left' }
        )
        .text(
          `Date: ${new Date(report.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
          { align: 'right' }
        )
        .moveDown(2);

      // Patient Information
      doc
        .fontSize(16)
        .fillColor('#1f2937')
        .text('Patient Information', { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor('#374151')
        .text(`Name: ${patientInfo?.profile?.name ?? 'N/A'}`)
        .text(`Age: ${patientInfo?.profile?.age ?? 'N/A'}`)
        .text(`Gender: ${patientInfo?.profile?.gender ?? 'N/A'}`)
        .moveDown(2);

      // Assessment Summary
      doc
        .fontSize(16)
        .fillColor('#1f2937')
        .text('Assessment Summary', { underline: true })
        .moveDown(0.5);

      const severityColors = {
        mild: '#10b981',
        moderate: '#f59e0b',
        severe: '#ef4444',
      };
      const severityColor = severityColors[report.analysis.severity] ?? '#374151';

      // Score box
      const boxTop = doc.y;
      doc.rect(50, boxTop, 495, 100).fillAndStroke('#f9fafb', '#e5e7eb').fill();
      const boxY = boxTop + 10;

      doc
        .fontSize(14)
        .fillColor('#1f2937')
        .text(`Overall Score: ${report.analysis.overallScore}/30`, 60, boxY);

      doc
        .fontSize(12)
        .fillColor(severityColor)
        .text(`Severity: ${report.analysis.severity.toUpperCase()}`, 60, boxY + 25);

      doc
        .fontSize(12)
        .fillColor('#1f2937')
        .text(
          `Recommendation: Consult a ${report.analysis.recommendation.toUpperCase()}`,
          60,
          boxY + 45
        );

      doc.moveDown(4);

      // Detailed Assessment
      doc
        .fontSize(16)
        .fillColor('#1f2937')
        .text('Detailed Assessment', { underline: true })
        .moveDown(0.5);

      doc.fontSize(12).fillColor('#374151');

      const responses = report.responses || {};

      doc
        .text(`Mood: ${responses.mood ?? 'N/A'}`)
        .text(`Energy Level: ${responses.energy ?? 'N/A'}/5`)
        .text(`Sleep Quality: ${responses.sleep ?? 'N/A'}`)
        .text(`Anxiety Level: ${responses.anxiety ?? 'N/A'}/5`)
        .text(`Appetite: ${responses.appetite ?? 'N/A'}`)
        .text(`Concentration: ${responses.concentration ?? 'N/A'}`)
        .text(`Social Withdrawal: ${responses.socialWithdrawal ?? 'N/A'}`)
        .text(`Symptom Duration: ${responses.duration ?? 'N/A'}`)
        .text(`Previous Treatment: ${responses.previousTreatment ? 'Yes' : 'No'}`)
        .moveDown(2);

      // Physical Symptoms
      if (Array.isArray(responses.physicalSymptoms) && responses.physicalSymptoms.length) {
        doc.text('Physical Symptoms:');
        responses.physicalSymptoms.forEach((symptom) => {
          doc.text(`  • ${symptom}`, { indent: 20 });
        });
        doc.moveDown(1);
      }

      // Additional Notes
      if (responses.additionalNotes) {
        doc.text('Additional Notes:').text(responses.additionalNotes, { indent: 20 }).moveDown(2);
      }

      // New page: Professional Analysis
      doc.addPage();

      doc
        .fontSize(16)
        .fillColor('#1f2937')
        .text('Professional Analysis', { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(12)
        .fillColor('#374151')
        .text(report.analysis.summary, { align: 'justify', lineGap: 5 })
        .moveDown(2);

      // Recommended Actions
      doc
        .fontSize(16)
        .fillColor('#1f2937')
        .text('Recommended Actions', { underline: true })
        .moveDown(0.5);

      doc.fontSize(12).fillColor('#374151');
      (report.analysis.suggestedActions || []).forEach((action, i) => {
        doc.text(`${i + 1}. ${action}`, { indent: 20, lineGap: 3 });
      });

      doc.moveDown(2);

      // Important Information Box
      const infoTop = doc.y;
      doc.rect(50, infoTop, 495, 80).fillAndStroke('#fef3c7', '#f59e0b').fill();

      doc
        .fontSize(12)
        .fillColor('#92400e')
        .text('⚠️ Important Information', 60, infoTop + 10, { underline: true })
        .fontSize(10)
        .text(
          'This assessment is not a substitute for professional medical advice, diagnosis, or treatment.',
          60,
          infoTop + 30,
          { width: 475 }
        )
        .text(
          'Always seek the advice of qualified health providers with any questions regarding your mental health.',
          60,
          infoTop + 50,
          { width: 475 }
        );

      doc.moveDown(4);

      // Emergency
      doc
        .fontSize(11)
        .fillColor('#ef4444')
        .text('🆘 Emergency Helpline: 9152987821 (iCALL - 8 AM to 10 PM, All days)', {
          align: 'center',
        })
        .moveDown(1);

      // Footer
      doc
        .moveDown(2)
        .fontSize(9)
        .fillColor('#9ca3af')
        .text(
          'This report is confidential and intended for healthcare professionals and the patient only.',
          { align: 'center', lineGap: 2 }
        )
        .text(`Generated by Neurona Mental Health Platform on ${new Date().toLocaleString()}`, {
          align: 'center',
        })
        .text(`© ${new Date().getFullYear()} Neurona. All rights reserved.`, { align: 'center' });

      // Finalize
      doc.end();

      stream.on('finish', () => {
        logger.info('PDF generated successfully', { fileName, reportId: report._id });
        resolve({ filePath, fileName, success: true });
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
 * @param {string} filePath
 * @returns {boolean}
 */
export const deletePDF = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
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
