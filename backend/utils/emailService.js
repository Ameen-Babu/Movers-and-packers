const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendWelcomeEmail = async ({ to, name, role }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn(`[DEV MODE] EMAIL_USER or EMAIL_PASS missing. Skipped sending welcome email to ${to}`);
        return;
    }
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
    try {
        await transporter.sendMail({
            from: `"Hydrox Movers & Packers" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Welcome to Hydrox Movers & Packers!',
            html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
              <div style="background:#1e3a5f;padding:24px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:24px;">Movers &amp; Packers</h1>
              </div>
              <div style="padding:32px;">
                <h2 style="color:#1e3a5f;">Welcome aboard, ${name}! 👋</h2>
                <p style="color:#444;line-height:1.6;">
                  Your account has been successfully created as a <strong>${roleLabel}</strong>.
                  You can now log in and start using our platform.
                </p>
                ${role === 'admin' || role === 'superadmin' ? `<p style="color:#444;line-height:1.6;">As an admin, you can browse and manage service requests once your account is approved.</p>` : ''}
                ${role === 'admin' ? `<p style="color:#e67e22;line-height:1.6;"><strong>Note:</strong> Your admin account is pending approval from an existing administrator.</p>` : ''}
                <div style="text-align:center;margin-top:28px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login"
                     style="background:#1e3a5f;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">
                    Log In Now
                  </a>
                </div>
              </div>
              <div style="background:#f5f5f5;padding:16px;text-align:center;color:#999;font-size:12px;">
                &copy; ${new Date().getFullYear()} Movers &amp; Packers. All rights reserved.
              </div>
            </div>`,
        });
    } catch (err) {
        console.error('Welcome Email Error:', err.message);
    }
};

const sendOrderCreatedEmail = async ({ to, name, order }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    const movingDate = new Date(order.movingDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
    try {
        await transporter.sendMail({
            from: `"Hydrox Movers & Packers" <${process.env.EMAIL_USER}>`,
            to,
            subject: '📦 Your Service Request Has Been Placed!',
            html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
              <div style="background:#1e3a5f;padding:24px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:24px;">Movers &amp; Packers</h1>
              </div>
              <div style="padding:32px;">
                <h2 style="color:#1e3a5f;">Order Confirmed, ${name}! 🚚</h2>
                <p style="color:#444;line-height:1.6;">Your service request has been successfully placed. Here are the details:</p>
                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                  <tr style="background:#f0f4f8;">
                    <td style="padding:10px 14px;font-weight:bold;color:#333;width:40%;">Order ID</td>
                    <td style="padding:10px 14px;color:#555;">${order._id}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 14px;font-weight:bold;color:#333;">Service Type</td>
                    <td style="padding:10px 14px;color:#555;">${order.serviceType}</td>
                  </tr>
                  <tr style="background:#f0f4f8;">
                    <td style="padding:10px 14px;font-weight:bold;color:#333;">Pickup</td>
                    <td style="padding:10px 14px;color:#555;">${order.pickupLocation}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 14px;font-weight:bold;color:#333;">Drop-off</td>
                    <td style="padding:10px 14px;color:#555;">${order.dropoffLocation}</td>
                  </tr>
                  <tr style="background:#f0f4f8;">
                    <td style="padding:10px 14px;font-weight:bold;color:#333;">Moving Date</td>
                    <td style="padding:10px 14px;color:#555;">${movingDate}</td>
                  </tr>
                  ${order.estimatedPrice ? `
                  <tr>
                    <td style="padding:10px 14px;font-weight:bold;color:#333;">Estimated Price</td>
                    <td style="padding:10px 14px;color:#555;">₹${order.estimatedPrice}</td>
                  </tr>` : ''}
                </table>
                <p style="color:#444;margin-top:20px;line-height:1.6;">
                  We will notify you once an admin is assigned to your request. You can track your order anytime from your dashboard.
                </p>
              </div>
              <div style="background:#f5f5f5;padding:16px;text-align:center;color:#999;font-size:12px;">
                &copy; ${new Date().getFullYear()} Movers &amp; Packers. All rights reserved.
              </div>
            </div>`,
        });
    } catch (err) {
        console.error('Order Created Email Error:', err.message);
    }
};

const sendOrderCancelledEmail = async ({ to, name, order }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    const movingDate = new Date(order.movingDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
    try {
        await transporter.sendMail({
            from: `"Hydrox Movers & Packers" <${process.env.EMAIL_USER}>`,
            to,
            subject: '❌ Your Service Request Has Been Cancelled',
            html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
              <div style="background:#c0392b;padding:24px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:24px;">Movers &amp; Packers</h1>
              </div>
              <div style="padding:32px;">
                <h2 style="color:#c0392b;">Request Cancelled</h2>
                <p style="color:#444;line-height:1.6;">Hi <strong>${name}</strong>, your service request has been cancelled. Here's a summary:</p>
                <table style="width:100%;border-collapse:collapse;margin-top:16px;">
                  <tr style="background:#fdf0ef;">
                    <td style="padding:10px 14px;font-weight:bold;color:#333;width:40%;">Order ID</td>
                    <td style="padding:10px 14px;color:#555;">${order._id}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 14px;font-weight:bold;color:#333;">Service Type</td>
                    <td style="padding:10px 14px;color:#555;">${order.serviceType}</td>
                  </tr>
                  <tr style="background:#fdf0ef;">
                    <td style="padding:10px 14px;font-weight:bold;color:#333;">Pickup</td>
                    <td style="padding:10px 14px;color:#555;">${order.pickupLocation}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 14px;font-weight:bold;color:#333;">Drop-off</td>
                    <td style="padding:10px 14px;color:#555;">${order.dropoffLocation}</td>
                  </tr>
                  <tr style="background:#fdf0ef;">
                    <td style="padding:10px 14px;font-weight:bold;color:#333;">Moving Date</td>
                    <td style="padding:10px 14px;color:#555;">${movingDate}</td>
                  </tr>
                </table>
                <p style="color:#444;margin-top:20px;line-height:1.6;">
                  If you cancelled by mistake or would like to place a new request, you can do so anytime from your dashboard.
                </p>
              </div>
              <div style="background:#f5f5f5;padding:16px;text-align:center;color:#999;font-size:12px;">
                &copy; ${new Date().getFullYear()} Movers &amp; Packers. All rights reserved.
              </div>
            </div>`,
        });
    } catch (err) {
        console.error('Order Cancelled Email Error:', err.message);
    }
};

const sendOTPEmail = async ({ to, name, otp }) => {
    const year = new Date().getFullYear();
    const textFallback = `Hello ${name},\n\nYour Hydrox Movers & Packers verification code is: ${otp}\n\nThis code is valid for 10 minutes. Do not share this code with anyone.`;
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#0D0F10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0D0F10;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:540px;background-color:#1B1E1F;border:1px solid #2B2F31;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td style="background-color:#141617;padding:28px 32px;text-align:center;border-bottom:1px solid #2B2F31;">
              <span style="font-size:22px;font-weight:800;letter-spacing:0.5px;color:#FFFFFF;text-transform:uppercase;">
                HYDROX <span style="color:#00B14F;">MOVERS</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <h1 style="font-size:20px;font-weight:700;color:#FFFFFF;margin:0 0 14px 0;">
                Verify Your Email Address
              </h1>
              <p style="font-size:14px;line-height:1.6;color:#B8B8B8;margin:0 0 24px 0;">
                Hello <strong style="color:#FFFFFF;">${name}</strong>, welcome to Hydrox Movers &amp; Packers. Please use the 6-digit verification code below to complete your registration:
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:28px 0;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background-color:#141617;border:1px solid #00B14F;border-radius:12px;padding:18px 36px;text-align:center;">
                      <span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:800;letter-spacing:10px;color:#00B14F;margin-left:10px;">
                        ${otp}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="font-size:13px;color:#8A8A8A;line-height:1.5;text-align:center;margin:0 0 24px 0;">
                ⏱ This code is valid for <strong>10 minutes</strong> and can only be used once.
              </p>
              <p style="font-size:12px;line-height:1.5;color:#8A8A8A;text-align:center;margin:24px 0 0 0;">
                If you did not request this code, please ignore this email. Never share your OTP with anyone.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#141617;padding:20px 32px;text-align:center;border-top:1px solid #2B2F31;font-size:11px;color:#64748B;">
              &copy; ${year} Hydrox Movers &amp; Packers. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn(`[DEV MODE] EMAIL_USER or EMAIL_PASS not configured in backend/.env. Verification OTP for ${to}: ${otp}`);
        return;
    }

    try {
        await transporter.sendMail({
            from: `"Hydrox Movers & Packers" <${process.env.EMAIL_USER}>`,
            to,
            subject: `${otp} is your Hydrox Movers verification code`,
            text: textFallback,
            html: htmlTemplate
        });
    } catch (err) {
        console.error('Nodemailer Error:', err.message);
        if (err.code === 'EAUTH' || err.command === 'API' || process.env.NODE_ENV !== 'production') {
            console.warn(`[DEV FALLBACK] SMTP Authentication Failed (${err.message}). Verification OTP for ${to}: ${otp}`);
            return;
        }
        throw err;
    }
};

module.exports = { sendWelcomeEmail, sendOrderCreatedEmail, sendOrderCancelledEmail, sendOTPEmail };

