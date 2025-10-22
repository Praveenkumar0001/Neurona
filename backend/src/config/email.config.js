// src/config/email.config.js
import nodemailer from 'nodemailer';
import config from './config.js';

export default function createTransporter() {
  const {
    host,
    port = 587,
    secure = false,
    user,
    pass,
    service // optional, e.g. "gmail"
  } = config.email || {};

  const base = service
    ? { service, auth: { user, pass } }
    : {
        host,
        port: Number(port),
        secure: Boolean(secure),
        auth: user && pass ? { user, pass } : undefined
      };

  return nodemailer.createTransport({
    ...base,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // optional: allow self-signed certs if you set this in config
    ...(config.email?.tlsRejectUnauthorized === false
      ? { tls: { rejectUnauthorized: false } }
      : {})
  });
}

// export default createTransporter;