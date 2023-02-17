// UTILITY Class to send an email.
// Sends an email through gmail.

// OLD DESIGN
// In DEV it goes through mailtrip.io
// In PROD uses gmail
// https://edigleyssonsilva.medium.com/how-to-send-emails-securely-using-gmail-and-nodejs-eef757525324

import type { mailMessage } from "../types/globalTypes"

const dotenv = require('dotenv');
dotenv.config();

const nodemailer = require('nodemailer');

async function sendEmail(message:mailMessage) {
    const env = process.env.NODE_ENV || 'development';    
    
    // if (env === "production") {
        console.log("Sending email through Gmail");
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });
    // }
    // else {
    //     // Use mailtrap.io for Dev
    //     console.log("Sending email through MailTrap.io");
    //     transporter = nodemailer.createTransport({
    //         host: "smtp.mailtrap.io",
    //         port: 2525,
    //         auth: {
    //             user: process.env.MAIL_TRAP_USER,
    //             pass: process.env.MAIL_TRAP_PASSWORD
    //         }
    //     });
    // }

    // message = {
    //     from: fromAddress,
    //     to: "to-example@email.com",
    //     subject: "Subject",
    //     html: "<h1>Hello SMTP Email</h1>"
    // }

    try {
        await transporter.sendMail(message);
        return true;
    }
    catch(ex) {
        return false;
    }
}

export { sendEmail }








