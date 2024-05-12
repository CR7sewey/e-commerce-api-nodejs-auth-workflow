const nodemailer = require("nodemailer");
const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({
  name,
  email,
  verificationToken,
  origin,
}) => {
  // First -> in the html we will send an url for veryfing email. For this, from
  //the frontend, we want the user to click the link (link in the frontend that consumes verify-email) and be redirected to some
  //url to verify the email, which is our route verify-email
  const verifyEmailURL = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;
  const emailMessage = `<p>Hi there, ${name}. Please click in the link bellow to activate have access to your account. <br /> <a href=${verifyEmailURL}> Verify Email</a> `;

  await sendEmail({
    to: email,
    subject: "Account Verification",
    html: emailMessage,
  });
};

module.exports = sendVerificationEmail;
