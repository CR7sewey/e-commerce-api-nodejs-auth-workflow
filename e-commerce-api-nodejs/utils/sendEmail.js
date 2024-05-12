const nodemailer = require("nodemailer");
const nodemailerConfig = require("./nodemailerConfig");

const sendEmail = async ({ to, subject, html }) => {
  let testAccount = await nodemailer.createTestAccount();
  // create transport
  const transporter = nodemailer.createTransport(nodemailerConfig);

  return await transporter.sendMail({
    from: "FakeName <fakename@gmail.com>",
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
