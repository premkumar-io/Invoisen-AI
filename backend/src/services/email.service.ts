import nodemailer from 'nodemailer';
import { env, isEmailConfigured } from '../config/env.js';
import { logger } from '../utils/logger.js';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!isEmailConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    logger.info('Email skipped (SMTP not configured)', { subject: options.subject, to: options.to });
    return;
  }
  await transport.sendMail({
    from: env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export async function sendWelcomeEmail(to: string, fullName: string): Promise<void> {
  await sendMail({
    to,
    subject: 'Welcome to Invoisen',
    html: `<p>Hi ${fullName},</p><p>Welcome to Invoisen! Start creating professional invoices today.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await sendMail({
    to,
    subject: 'Reset your Invoisen password',
    html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">Reset Password</a></p>`,
  });
}
