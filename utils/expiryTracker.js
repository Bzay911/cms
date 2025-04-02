const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Worker = require('../models/worker');
const Admin = require('../models/Admin');
const { format } = require('date-fns');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const checkExpiringDocuments = async () => {
  try {
    const currentDate = new Date();
    const nextWeekDate = new Date();
    nextWeekDate.setDate(currentDate.getDate() + 30);

    // Find documents that are already expired or will expire in the next 7 days
    const workersWithExpiringDocuments = await Worker.find({
      documents: {
        $elemMatch: {
          expiryDate: { $lte: nextWeekDate },
        },
      },
    });

    // Fetch admin details to send notifications
    const admin = await Admin.findOne({ role: 'System Administrator' });
    const adminEmail = admin ? admin.email : process.env.ADMIN_EMAIL;

    // Prepare email notifications
    workersWithExpiringDocuments.forEach((worker) => {
      worker.documents.forEach((document) => {
        if (document.expiryDate <= nextWeekDate) {
          const isExpired = document.expiryDate < currentDate;
          const expiryStatus = isExpired ? 'expired' : 'expiring soon';

          // Email options
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: [worker.email, adminEmail].filter(Boolean).join(", "),
            subject: `Document Expiry Alert for ${worker.name}`,
            text: `
              Dear ${worker.name},
              
              The document "${document.type}" with document number "${document.documentNumber}" is ${expiryStatus}.
              
              Expiry Date: ${format(document.expiryDate, 'yyyy-MM-dd')}
              
              Please take necessary actions.

              Regards,
              Worker Management System
            `,
          };

          // Send email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error(`Error sending email to ${worker.name}:`, error);
            } else {
              console.log(`Email sent successfully to ${worker.name}:`, info.response);
            }
          });
        }
      });
    });
  } catch (error) {
    console.error('Error checking document expirations:', error);
  }
};


module.exports = { checkExpiringDocuments };
