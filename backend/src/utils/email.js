const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create a transporter
  // Using ethereal for dev/testing, but can be replaced with real SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.ethereal.email",
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || "ethereal.user",
      pass: process.env.EMAIL_PASS || "ethereal.pass"
    }
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Tour App Admin <admin@tourapp.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
