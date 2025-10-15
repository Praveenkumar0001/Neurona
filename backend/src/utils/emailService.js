const nodemailer = require('nodemailer');
const createTransporter = require('../config/email.config');
const config = require('../config/config');
const logger = require('./logger');

// Create email transporter
let transporter;

const initializeTransporter = () => {
  try {
    transporter = createTransporter();
    logger.info('Email transporter initialized');
  } catch (error) {
    logger.error('Failed to initialize email transporter', { error: error.message });
  }
};

// Initialize on module load
initializeTransporter();

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!transporter) {
      initializeTransporter();
    }
    
    const mailOptions = {
      from: `Neurona <${config.email.from}>`,
      to,
      subject,
      html,
      text: text || undefined
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { to, subject, messageId: info.messageId });
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    logger.error('Failed to send email', { to, subject, error: error.message });
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Booking confirmation email
const sendBookingConfirmation = async (booking, doctor, patient) => {
  const subject = 'Booking Confirmed - Neurona';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .info-item { margin: 10px 0; }
        .label { font-weight: bold; color: #1f2937; }
        .value { color: #4b5563; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎉 Booking Confirmed!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your mental health consultation is scheduled</p>
        </div>
        
        <div class="content">
          <p>Dear ${patient.profile.name},</p>
          <p>Your consultation appointment has been successfully confirmed with <strong>Dr. ${doctor.name}</strong>.</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #1f2937;">📅 Appointment Details</h3>
            <div class="info-item">
              <span class="label">Doctor:</span> 
              <span class="value">Dr. ${doctor.name}</span>
            </div>
            <div class="info-item">
              <span class="label">Specialty:</span> 
              <span class="value">${doctor.specialty.charAt(0).toUpperCase() + doctor.specialty.slice(1)}</span>
            </div>
            <div class="info-item">
              <span class="label">Date:</span> 
              <span class="value">${new Date(booking.bookingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="info-item">
              <span class="label">Time:</span> 
              <span class="value">${booking.bookingTime}</span>
            </div>
            <div class="info-item">
              <span class="label">Consultation Fee:</span> 
              <span class="value">₹${booking.amount}</span>
            </div>
            <div class="info-item">
              <span class="label">Booking ID:</span> 
              <span class="value">#${booking._id.toString().slice(-8).toUpperCase()}</span>
            </div>
          </div>
          
          <div class="warning">
            <strong>⏰ Important:</strong> Please arrive 10 minutes early for your appointment. 
            If you need to reschedule, please do so at least 24 hours in advance.
          </div>
          
          <div style="text-align: center;">
            <a href="${config.frontendUrl}/bookings/${booking._id}" class="button">View Booking Details</a>
          </div>
          
          <p style="margin-top: 30px;">If you have any questions, feel free to contact us at support@neurona.com</p>
          
          <p>Best regards,<br><strong>Team Neurona</strong></p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Neurona. All rights reserved.</p>
          <p style="font-size: 12px; color: #9ca3af;">
            This is an automated email. Please do not reply directly to this message.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({ to: patient.email, subject, html });
};

// Doctor booking notification
const sendDoctorBookingNotification = async (booking, doctor, patient) => {
  const subject = 'New Appointment Booking - Neurona';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
        .info-item { margin: 10px 0; }
        .label { font-weight: bold; color: #1f2937; }
        .value { color: #4b5563; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">📋 New Appointment</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You have a new patient booking</p>
        </div>
        
        <div class="content">
          <p>Dear Dr. ${doctor.name},</p>
          <p>You have received a new appointment booking.</p>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #1f2937;">Patient Details</h3>
            <div class="info-item">
              <span class="label">Patient Name:</span> 
              <span class="value">${patient.profile.name}</span>
            </div>
            <div class="info-item">
              <span class="label">Date:</span> 
              <span class="value">${new Date(booking.bookingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="info-item">
              <span class="label">Time:</span> 
              <span class="value">${booking.bookingTime}</span>
            </div>
            <div class="info-item">
              <span class="label">Booking ID:</span> 
              <span class="value">#${booking._id.toString().slice(-8).toUpperCase()}</span>
            </div>
          </div>
          
          <p>The patient's symptom report has been shared with you and is accessible through your dashboard.</p>
          
          <div style="text-align: center;">
            <a href="${config.frontendUrl}/doctor/bookings/${booking._id}" class="button">View Patient Report</a>
          </div>
          
          <p style="margin-top: 30px;">Best regards,<br><strong>Team Neurona</strong></p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Neurona. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({ to: doctor.userId.email, subject, html });
};

// Password reset email
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;
  const subject = 'Password Reset Request - Neurona';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🔒 Password Reset</h1>
        </div>
        
        <div class="content">
          <p>Hi ${user.profile.name},</p>
          <p>We received a request to reset your password for your Neurona account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="background: white; padding: 10px; border-radius: 4px; word-break: break-all;">${resetUrl}</p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This link will expire in 1 hour for security reasons.
            If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </div>
          
          <p>Best regards,<br><strong>Team Neurona</strong></p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Neurona. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({ to: user.email, subject, html });
};

// Welcome email
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Neurona - Your Mental Health Journey Begins';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .feature { background: white; padding: 15px; border-radius: 6px; margin: 10px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">Welcome to Neurona! 🎉</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Your mental health matters</p>
        </div>
        
        <div class="content">
          <p>Dear ${user.profile.name},</p>
          <p>Welcome to Neurona! We're thrilled to have you join our community dedicated to mental health and wellbeing.</p>
          
          <h3 style="color: #1f2937;">What you can do with Neurona:</h3>
          
          <div class="feature">
            <strong>🤖 AI Symptom Assessment</strong><br>
            Get instant mental health assessment using our advanced AI
          </div>
          
          <div class="feature">
            <strong>👨‍⚕️ Expert Consultations</strong><br>
            Book appointments with verified psychiatrists and therapists
          </div>
          
          <div class="feature">
            <strong>📊 Track Your Progress</strong><br>
            Monitor your mental health journey with detailed reports
          </div>
          
          <div class="feature">
            <strong>🔒 100% Confidential</strong><br>
            Your privacy and data security are our top priorities
          </div>
          
          <div style="text-align: center;">
            <a href="${config.frontendUrl}/dashboard" class="button">Get Started</a>
          </div>
          
          <p style="margin-top: 30px;">If you have any questions, our support team is here to help at support@neurona.com</p>
          
          <p>Best regards,<br><strong>Team Neurona</strong></p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Neurona. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({ to: user.email, subject, html });
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendDoctorBookingNotification,
  sendPasswordResetEmail,
  sendWelcomeEmail
};