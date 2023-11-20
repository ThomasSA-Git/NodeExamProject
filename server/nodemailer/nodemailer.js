import nodemailer from "nodemailer";


export async function sendFakeEmail(userEmail, subject, message) {
    // Create a test account using ehereal
    const testAccount = await nodemailer.createTestAccount();
  
    // Create a transporter object
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  
    // Setup email data
    const mailOptions = {
      from: 'my_service_mail_for_mandatoryII@gmail.com',
      to: userEmail,
      subject: subject,
      text: message
    };
  
    // Send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);
  
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  };

  export const contactMailSubject = "Message sent."
  //export const contactMailMessage = "Your message has been submitted."

  export function contactMailMessage(message){
    return `You have submitted the follow message: ${message}`;
  }

  export const registerMailSubject = "Registration"
  export function registerMailMessage(username){
    return `You have succesfully been registered with the username: ${username}`;
  };

  export const passwordResetSubject = "Password reset";
  export function passwordResetMessage(username, token){
    return `You have requested to reset your password for ${username}. Use this token ${token} for reset on webpage. The token expires after 30 minutes.`
  }