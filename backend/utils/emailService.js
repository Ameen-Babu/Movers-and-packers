const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendWelcomeEmail = async ({ to, name, role }) => {
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
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
            ${role === 'provider' ? `<p style="color:#444;line-height:1.6;">As a provider, you can browse and accept service requests from clients once you log in.</p>` : ''}
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
};

const sendOrderCreatedEmail = async ({ to, name, order }) => {
    const movingDate = new Date(order.movingDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
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
              We will notify you once a provider accepts your request. You can track your order anytime from your dashboard.
            </p>
          </div>
          <div style="background:#f5f5f5;padding:16px;text-align:center;color:#999;font-size:12px;">
            &copy; ${new Date().getFullYear()} Movers &amp; Packers. All rights reserved.
          </div>
        </div>`,
    });
};

const sendOrderCancelledEmail = async ({ to, name, order }) => {
    const movingDate = new Date(order.movingDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
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
};

module.exports = { sendWelcomeEmail, sendOrderCreatedEmail, sendOrderCancelledEmail };
