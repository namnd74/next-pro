import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, category, message } = body;

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json(
        { error: 'Nội dung góp ý phải có ít nhất 5 ký tự.' },
        { status: 400 }
      );
    }

    const recipient = process.env.FEEDBACK_RECIPIENT || 'contact@dev-pro.online';
    const smtpHost = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // If SMTP credentials are provided, send a real email via Hostinger
    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const senderDisplay = email && email.trim() ? email.trim() : 'Ẩn danh';
      const subject = `[dev-pro] Góp ý mới: ${category || 'Góp ý chung'} (từ ${senderDisplay})`;

      const htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="border-bottom: 2px solid #6366f1; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #1e1b4b; margin: 0; font-size: 20px;">Hòm thư góp ý — dev-pro</h2>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Nhận thư từ form góp ý website dev-pro.online</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 120px; font-weight: 600;">Chủ đề:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${category || 'Góp ý chung'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Người gửi:</td>
              <td style="padding: 8px 0; color: #0f172a;">${senderDisplay}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Thời gian:</td>
              <td style="padding: 8px 0; color: #64748b;">${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</td>
            </tr>
          </table>

          <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
            <p style="color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 8px;">Nội dung góp ý:</p>
            <p style="color: #1e293b; font-size: 15px; line-height: 1.6; white-space: pre-wrap; margin: 0;">${message.trim()}</p>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 12px; font-size: 12px; color: #94a3b8; text-align: center;">
            Thư này được gửi tự động từ hệ thống phản hồi của dev-pro.online
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"dev-pro Feedback" <${smtpUser}>`,
        to: recipient,
        replyTo: email && email.includes('@') ? email : undefined,
        subject,
        html: htmlContent,
      });

      console.log(`[FEEDBACK_SENT] Email sent via Hostinger SMTP to ${recipient}`);
    } else {
      // Fallback: log to server console when credentials not yet set in .env.local
      console.warn(
        '[FEEDBACK_DEV_MODE] SMTP credentials (SMTP_USER, SMTP_PASS) not found in .env.local. Logged to console:'
      );
      console.log({
        to: recipient,
        sender: email || 'Ẩn danh',
        category,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Góp ý của bạn đã được tiếp nhận thành công!',
    });
  } catch (error) {
    console.error('[FEEDBACK_ERROR]', error);
    return NextResponse.json(
      {
        error:
          'Không thể gửi email lúc này. Vui lòng thử lại hoặc gửi trực tiếp tới contact@dev-pro.online.',
      },
      { status: 500 }
    );
  }
}
