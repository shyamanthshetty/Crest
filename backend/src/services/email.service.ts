import nodemailer, { type Transporter } from "nodemailer";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured = false;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
      this.isConfigured = true;
      console.log(`[EmailService] Configured SMTP via ${host}:${port}`);
    } else {
      this.isConfigured = false;
      console.log("[EmailService] No SMTP credentials provided. Running in development/simulated mode.");
    }
  }

  /**
   * Sends a generic email or logs it if SMTP is not configured
   */
  async sendMail({ to, subject, html, text }: SendMailOptions): Promise<{ success: boolean; previewUrl?: string }> {
    const from = process.env.EMAIL_FROM || '"Crest" <noreply@crest.app>';

    if (this.isConfigured && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from,
          to,
          subject,
          text,
          html,
        });
        console.log(`[EmailService] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
        return { success: true };
      } catch (error) {
        console.error(`[EmailService] Failed to send email to ${to}:`, error);
        throw error;
      }
    }

    // Development / Simulated transport
    console.log("\n=======================================================");
    console.log(`📨 [DEV EMAIL SIMULATION]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${text}`);
    console.log("=======================================================\n");

    return { success: true };
  }

  /**
   * Generates and sends a branded password reset email with magic reset link
   */
  async sendPasswordResetEmail(email: string, rawToken: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(rawToken)}`;

    const subject = "Reset your Crest password";

    const textContent = `
Hello,

We received a request to reset your password for your Crest account.

Click the link below (or paste it into your browser) to choose a new password:
${resetLink}

This link is valid for 1 hour.

If you did not request a password reset, you can safely ignore this email. Your password will not change.

Best regards,
The Crest Team
`.trim();

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Crest password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F8FAFC;
      padding: 40px 20px;
    }
    .card {
      max-width: 520px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #E2E8F0;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 30px;
    }
    .logo-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background-color: #4F46E5;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-weight: bold;
      font-size: 20px;
      text-align: center;
      line-height: 44px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 700;
      color: #0F172A;
      margin: 0;
    }
    .headline {
      font-size: 20px;
      font-weight: 700;
      color: #0F172A;
      margin: 0 0 16px 0;
      letter-spacing: -0.02em;
    }
    .paragraph {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 24px 0;
    }
    .btn-container {
      margin: 32px 0;
      text-align: center;
    }
    .btn {
      display: inline-block;
      background-color: #4F46E5;
      color: #FFFFFF !important;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }
    .subtext {
      font-size: 13px;
      line-height: 1.6;
      color: #64748B;
      margin: 0 0 16px 0;
    }
    .token-box {
      background-color: #F1F5F9;
      border-radius: 8px;
      padding: 12px;
      font-family: Courier, monospace;
      font-size: 12px;
      color: #334155;
      word-break: break-all;
      margin-bottom: 24px;
    }
    .divider {
      border-top: 1px solid #E2E8F0;
      margin: 32px 0 24px 0;
    }
    .footer {
      font-size: 12px;
      color: #94A3B8;
      text-align: center;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo-container">
        <div class="logo-badge">C</div>
        <div>
          <h2 class="brand-title">Crest</h2>
        </div>
      </div>

      <h1 class="headline">Password Reset Request</h1>
      
      <p class="paragraph">
        Hello,<br><br>
        We received a request to reset the password for your Crest account associated with <strong>${email}</strong>.
      </p>

      <p class="paragraph">
        Click the button below to choose a new password. This link is secure and will expire in <strong>1 hour</strong>.
      </p>

      <div class="btn-container">
        <a href="${resetLink}" class="btn" target="_blank">Reset Password</a>
      </div>

      <p class="subtext">
        If the button above does not work, copy and paste this link into your browser:
      </p>

      <div class="token-box">
        <a href="${resetLink}" style="color: #4F46E5; text-decoration: none;">${resetLink}</a>
      </div>

      <div class="divider"></div>

      <p class="subtext" style="margin-bottom: 0;">
        <strong>Didn't request this?</strong> If you didn't ask to reset your password, you can safely ignore this email. No changes will be made to your account.
      </p>

      <div class="footer">
        &copy; ${new Date().getFullYear()} Crest. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
`.trim();

    await this.sendMail({
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
    });
  }
}

export const emailService = new EmailService();
