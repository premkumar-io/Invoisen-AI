import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  const host = process.env.SMTP_HOST || env.SMTP_HOST;
  const user = process.env.SMTP_USER || env.SMTP_USER;
  const pass = process.env.SMTP_PASS || env.SMTP_PASS;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : env.SMTP_PORT || 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  if (transporter) return transporter;

  try {
    const testAccount = await nodemailer.createTestAccount();
    logger.info(`[Email Service] Created live test SMTP account (${testAccount.user})`);
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return transporter;
  } catch (err) {
    logger.error('Failed to create test email account', err);
    transporter = nodemailer.createTransport({ jsonTransport: true });
    return transporter;
  }
}

function getFromAddress(customFrom?: string): string {
  if (customFrom) {
    return customFrom.includes('<') ? customFrom : `Invoisen <${customFrom}>`;
  }
  const configured = env.EMAIL_FROM || process.env.SMTP_USER || 'onboarding@resend.dev';
  if (configured.includes('<')) {
    return configured;
  }
  return `Invoisen <${configured}>`;
}

async function sendMail(options: {
  from?: string;
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const fromAddress = getFromAddress(options.from);
  const resendApiKey = process.env.RESEND_API_KEY || (env as any).RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [options.to],
          subject: options.subject,
          html: options.html,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        logger.error('[Resend API Error]', data);
        throw new Error((data as any)?.message || 'Failed to send email via Resend');
      }
      logger.info(`[Email Dispatch] Email delivered to ${options.to} via Resend API (id: ${(data as any)?.id})`);
      return;
    } catch (err: any) {
      logger.error('Resend API delivery failed, falling back to SMTP/transporter:', err.message);
    }
  }

  const transport = await getTransporter();
  await transport.sendMail({
    from: fromAddress,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export async function sendWelcomeEmail(to: string, fullName: string): Promise<void> {
  const clientUrl = env.CLIENT_URL || 'https://invoisen.com';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Invoisen</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 36px 40px; text-align: left;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="left">
                          <span style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 900; font-size: 14px; letter-spacing: 2px; padding: 6px 14px; border-radius: 9999px;">INVOISEN</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 20px;">
                          <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; line-height: 1.25;">Welcome to Invoisen, ${fullName}!</h1>
                          <p style="color: #94a3b8; font-size: 14px; margin: 8px 0 0 0;">Your Next-Generation AI Invoicing & Financial Workspace</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 24px 0;">
                      We are thrilled to have you on board. Invoisen equips your business with intelligent financial workflows, real-time GST/VAT calculations, digital payment payouts, and AI-driven invoice extraction.
                    </p>

                    <!-- Key Features Card Grid -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px 20px; margin-bottom: 12px; display: block;">
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">📄 Smart Custom Invoices & Quotes</p>
                          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Create, customize, and export professional PDF invoices with automated sequential numbering.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px 20px; margin-bottom: 12px; display: block;">
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">🤖 Gemini AI Invoicing Automation</p>
                          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Auto-scan receipt uploads, extract total balances, and schedule automated payment follow-ups.</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px 20px; display: block;">
                          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">💳 Instant Digital Payout Links &amp; QR Codes</p>
                          <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Embed scannable UPI QR codes and bank payout details directly into customer invoices.</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Primary Action Button -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="padding: 12px 0 24px 0;">
                          <a href="${clientUrl}/dashboard" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                            Launch Invoisen Workspace &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0; text-align: center;">
                      Need help getting started? Check our <a href="${clientUrl}/support" style="color: #2563eb; text-decoration: underline;">Support Center</a> or reply directly to this email.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                      &copy; ${new Date().getFullYear()} Invoisen Technologies Inc. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendMail({
    to,
    subject: `Welcome to Invoisen, ${fullName}! Your Account is Ready`,
    html,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Invoisen Password</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="background-color: #0f172a; padding: 28px 36px;">
                    <span style="background-color: #2563eb; color: #ffffff; font-weight: 900; font-size: 12px; letter-spacing: 2px; padding: 4px 12px; border-radius: 9999px;">INVOISEN</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 36px;">
                    <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Reset Your Password</h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                      We received a request to reset your password for your Invoisen account. Click the button below to choose a new password. This secure link expires in 1 hour.
                    </p>
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="padding: 8px 0 24px 0;">
                          <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 9999px;">
                            Reset Password &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                      If you did not request a password reset, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendMail({
    to,
    subject: 'Reset Your Invoisen Account Password',
    html,
  });
}

export async function sendEmailOtpEmail(to: string, otp: string): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 36px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="left">
                          <span style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 900; font-size: 13px; letter-spacing: 2px; padding: 5px 14px; border-radius: 9999px;">INVOISEN</span>
                        </td>
                        <td align="right">
                          <span style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Security Code</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 36px 36px 32px 36px; text-align: center;">
                    <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">Verify Your Email Address</h2>
                    <p style="font-size: 14px; line-height: 1.5; color: #64748b; margin: 0 0 28px 0;">
                      Use the 6-digit Security OTP code below to verify your account email address on Invoisen.
                    </p>

                    <!-- OTP Highlight Box -->
                    <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 20px; padding: 24px 16px; margin-bottom: 24px;">
                      <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #2563eb; display: block; margin-left: 12px;">${otp}</span>
                    </div>

                    <!-- Security Alert Badge -->
                    <div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 14px; padding: 12px 16px; margin-bottom: 24px; text-align: left;">
                      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td width="24" valign="top" style="font-size: 14px;">🔒</td>
                          <td style="font-size: 12px; color: #92400e; font-weight: 500; line-height: 1.4;">
                            This code is valid for <strong>10 minutes</strong>. Never share this verification code with anyone for your security.
                          </td>
                        </tr>
                      </table>
                    </div>

                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                      If you did not request this verification code, please ignore this email or contact support.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 20px 36px; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                      &copy; ${new Date().getFullYear()} Invoisen Technologies Inc. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await sendMail({
    to,
    subject: `${otp} is your Invoisen email verification code`,
    html,
  });
}

export async function sendInvoiceEmail(options: {
  from?: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
  pdfBuffer?: Buffer;
  filename?: string;
}): Promise<{ sent: boolean; previewUrl?: string; reason?: string }> {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: getFromAddress(options.from || env.EMAIL_FROM || 'billing@invoisen.com'),
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.pdfBuffer
        ? [
            {
              filename: options.filename || 'invoice.pdf',
              content: options.pdfBuffer,
              contentType: 'application/pdf',
            },
          ]
        : [],
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`[Email Dispatch] Real-time email captured & viewable at: ${previewUrl}`);
    } else {
      logger.info(`[Email Dispatch] Email delivered to ${options.to} via SMTP server.`);
    }

    return { sent: true, previewUrl: previewUrl || undefined };
  } catch (err: any) {
    logger.error('Failed to deliver email via SMTP', { error: err.message, to: options.to });
    return { sent: false, reason: err.message || 'SMTP transmission error' };
  }
}
