// src/lib/email.ts

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface SendQuoteEmailParams {
  to: string;
  quoteNumber: string;
  customerName: string;
  pdfBuffer: Buffer;
  companyName?: string;
}

export async function sendQuoteEmail({
  to,
  quoteNumber,
  customerName,
  pdfBuffer,
  companyName = 'Your Company',
}: SendQuoteEmailParams) {
  const result = await transporter.sendMail({
    from: `"${companyName} Quotes" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your Kitchen Quote - ${quoteNumber}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Your Kitchen Quote</h1>
        </div>
        <div style="background: #f9fafb; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Dear ${customerName},
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Please find attached your kitchen quote <strong>${quoteNumber}</strong>.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            If you have any questions about this quote, please don't hesitate to contact us.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 14px;">
            This quote is valid for 30 days from the date of issue.
          </p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Quote-${quoteNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  return result;
}

// Verify SMTP connection on startup
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return false;
  }
}
