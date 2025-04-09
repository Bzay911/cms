const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: 'utsavkhatri7@gmail.com',
    pass: 'fulrmlwndomjwtkl',
  },
});

const sendExpiryNotification = (worker, document, emailRecipients) => {
  const mailOptions = {
    from: 'utsavkhatri7@gmail.com',
    to: emailRecipients.join(", "),
    subject: "Document Expiry Alert",
    text: `Dear Manager/System Administrator,

The document "${document.type}" of worker "${worker.name}" (Employee ID: ${worker.employeeId}) is expiring on ${new Date(document.expiryDate).toDateString()}.

Please take the necessary actions.

Regards,
Worker Management System`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error("Error sending email:", error);
    }
    console.log("Email sent:", info.response);
  });
};

module.exports = { sendExpiryNotification };
