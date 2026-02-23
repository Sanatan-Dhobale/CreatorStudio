const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send notification to creator
const sendCreatorNotification = async (creatorEmail, creatorName, inquiry) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"CreatorHub" <${process.env.EMAIL_USER}>`,
    to: creatorEmail,
    subject: `🎉 New Brand Inquiry from ${inquiry.brandName}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #6C63FF, #4ECDC4); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">New Brand Inquiry! 🎯</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${creatorName}</strong>,</p>
          <p style="color: #555;">You have a new brand collaboration inquiry. Here are the details:</p>
          
          <div style="background: #F8F9FF; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">BRAND NAME</td><td style="padding: 8px 0; font-weight: 600; color: #333;">${inquiry.brandName}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">CONTACT</td><td style="padding: 8px 0; font-weight: 600; color: #333;">${inquiry.contactPerson}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">EMAIL</td><td style="padding: 8px 0; font-weight: 600; color: #333;">${inquiry.email}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">BUDGET</td><td style="padding: 8px 0; font-weight: 600; color: #6C63FF;">${inquiry.budgetRange}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">CAMPAIGN TYPE</td><td style="padding: 8px 0; font-weight: 600; color: #333;">${inquiry.campaignType.join(', ')}</td></tr>
              <tr><td style="padding: 8px 0; color: #888; font-size: 13px;">TIMELINE</td><td style="padding: 8px 0; font-weight: 600; color: #333;">${inquiry.timeline}</td></tr>
            </table>
          </div>
          
          <div style="background: #FFF9EC; border-left: 3px solid #FFB800; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <p style="margin: 0; color: #555; font-size: 14px;"><strong>Message:</strong> ${inquiry.message}</p>
          </div>
          
          <a href="${process.env.APP_URL}/dashboard/inquiries" style="display: inline-block; background: #6C63FF; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">View in Dashboard →</a>
        </div>
        <div style="background: #F8F9FF; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          CreatorHub — Your Professional Creator Toolkit
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Auto-reply to brand
const sendBrandAutoReply = async (brandEmail, brandName, creatorName) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${creatorName} via CreatorHub" <${process.env.EMAIL_USER}>`,
    to: brandEmail,
    subject: `Thanks for reaching out, ${brandName}! 🙌`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Thank you for your inquiry! 🎉</h1>
        </div>
        <div style="padding: 32px;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${brandName}</strong>,</p>
          <p style="color: #555; line-height: 1.6;">
            Thank you for reaching out to <strong>${creatorName}</strong> for a potential collaboration. 
            Your inquiry has been received and is currently being reviewed.
          </p>
          <p style="color: #555; line-height: 1.6;">
            You can expect a response within <strong>48–72 hours</strong>. 
            In the meantime, feel free to explore our content and media kit.
          </p>
          <div style="background: #F0F4FF; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px; color: #666;">
            ✅ Inquiry received<br>
            ⏳ Under review<br>
            📬 Response within 48–72 hours
          </div>
        </div>
        <div style="background: #F8F9FF; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          Powered by CreatorHub — Professional Creator Platform
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendCreatorNotification, sendBrandAutoReply };
