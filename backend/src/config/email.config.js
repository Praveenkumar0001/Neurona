const nodemailer = require('nodemailer');
const config = require('./config');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

module.exports = createTransporter;