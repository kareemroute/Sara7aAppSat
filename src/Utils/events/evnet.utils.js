import { EventEmitter } from "node:events";
import { emailSubject, sendEmail } from "../email/sendEmail.utils.js";
import { template } from "../email/generateHTML.js";

export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async (data) => {
  await sendEmail({
    to: data.to,
    subject: emailSubject.confirmEmail,
    html: template(data.otp, data.firstName),
  });
});

emailEvent.on("forgetpassword", async (data) => {
  await sendEmail({
    to: data.to,
    subject: emailSubject.resetPassword,
    html: template(data.otp, data.firstName, emailSubject.resetPassword),
  });
});
