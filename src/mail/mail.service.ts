import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private resend: Resend;

  constructor() {
    // SMTP configuration (for local development)
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Resend for Railway deployment (SMTP gets blocked)
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendPasswordResetEmail(email: string, code: string, fullName: string) {
    // Use Resend if API key is available (for Railway), otherwise use SMTP (for local)
    if (process.env.RESEND_API_KEY) {
      return this.sendViaResend(email, code, fullName);
    } else {
      return this.sendViaSMTP(email, code, fullName);
    }
  }

  private async sendViaResend(email: string, code: string, fullName: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Travel Nova <onboarding@resend.dev>',
        to: [email],
        subject: 'Password Reset Request - Travel Nova',
        html: this.getPasswordResetEmailTemplate(code, fullName),
      });

      if (error) {
        console.error('❌ Resend error:', error);
        throw new Error(`Email service error: ${error.message}`);
      }

      console.log('✅ Email sent successfully via Resend:', data.id);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending email via Resend:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  private async sendViaSMTP(email: string, code: string, fullName: string) {
    const mailOptions = {
      from: `"Travel Nova" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - Travel Nova',
      html: this.getPasswordResetEmailTemplate(code, fullName),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully via SMTP:', info.messageId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending email via SMTP:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  private getPasswordResetEmailTemplate(code: string, fullName: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <p>Hello ${fullName},</p>
        
        <p>We received a request to reset your password. Use this verification code:</p>
        
        <div style="background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #007bff; margin: 0;">${code}</h1>
          <p style="margin: 10px 0 0 0; color: #666;">Your verification code</p>
        </div>
        
        <p style="color: #666;">⚠️ This code expires in 10 minutes.</p>
        
        <p>If you didn't request this, please ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px;">
          Travel Nova - Explore the World<br>
          Need help? Contact <a href="mailto:support@travelnova.com">support@travelnova.com</a>
        </p>
      </div>
    `;
  }
}
