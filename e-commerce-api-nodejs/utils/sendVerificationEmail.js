const nodemailer = require("nodemailer");
const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {};

/*
const sendEmail = async ({ to, subject, html }) => {s
  let testAccount = await nodemailer.createTestAccount();
  // create transport
  const transporter = nodemailer.createTransport(nodemailerConfig);

  return await transporter.sendMail({
    from: "FakeName <fakename@gmail.com>",
    to,
    subject,
    html,
  });
};*/

module.exports = sendEmail;
