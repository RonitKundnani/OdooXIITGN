const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to other services
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
    }
  });
};

// Send welcome email to new employee
async function sendWelcomeEmail(employeeData) {
  try {
    const { email, first_name, last_name, employee_id, password, company_name } = employeeData;

    const transporter = createTransporter();

    const mailOptions = {
      from: `"${company_name || 'WorkZen HR'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Welcome to ${company_name || 'WorkZen'} - Your Account Details`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #F2BED1 0%, #FDCEDF 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #F9F5F6;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .credentials-box {
              background: white;
              border-left: 4px solid #F2BED1;
              padding: 20px;
              margin: 20px 0;
              border-radius: 5px;
            }
            .credential-item {
              margin: 10px 0;
              padding: 10px;
              background: #F8E8EE;
              border-radius: 5px;
            }
            .credential-label {
              font-weight: bold;
              color: #666;
              font-size: 12px;
              text-transform: uppercase;
            }
            .credential-value {
              font-size: 16px;
              color: #1F2937;
              font-weight: 600;
              margin-top: 5px;
            }
            .button {
              display: inline-block;
              background: #F2BED1;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background: #FFF3CD;
              border-left: 4px solid #FFC107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to ${company_name || 'WorkZen'}! 🎉</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${first_name} ${last_name},</h2>
            
            <p>We're excited to have you join our team! Your employee account has been successfully created.</p>
            
            <div class="credentials-box">
              <h3 style="margin-top: 0; color: #F2BED1;">Your Login Credentials</h3>
              
              <div class="credential-item">
                <div class="credential-label">Employee ID</div>
                <div class="credential-value">${employee_id}</div>
              </div>
              
              <div class="credential-item">
                <div class="credential-label">Email</div>
                <div class="credential-value">${email}</div>
              </div>
              
              <div class="credential-item">
                <div class="credential-label">Temporary Password</div>
                <div class="credential-value">${password}</div>
              </div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important Security Notice:</strong><br>
              Please change your password immediately after your first login for security purposes.
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">
                Login to Your Account
              </a>
            </div>
            
            <h3>What's Next?</h3>
            <ul>
              <li>Login using your credentials above</li>
              <li>Complete your profile information</li>
              <li>Review company policies and guidelines</li>
              <li>Set up your preferences</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact the HR department.</p>
            
            <p>Best regards,<br>
            <strong>${company_name || 'WorkZen'} HR Team</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} ${company_name || 'WorkZen'}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

// Send password reset email
async function sendPasswordResetEmail(email, resetToken, first_name) {
  try {
    const transporter = createTransporter();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"WorkZen HR" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Hello ${first_name},</h2>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #F2BED1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>WorkZen HR Team</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
}

// Test email configuration
async function testEmailConfig() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  testEmailConfig
};
