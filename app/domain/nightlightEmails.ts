/* 
    Business Logic for sending emails for the NightLight System
*/

import { sendEmail } from "../utils/emails"
import type { mailMessage } from "../types/globalTypes"

// SETUP
const fromAddress = "nightlight.passwords@gmail.com";

// Password Reset
export async function sendPasswordResetEmail(to:string, token:string) {
    
    console.log("sendPasswordResetEmail: Start");
    let subject = "Password Reset Link for Nightlight";    
    let message:mailMessage = {
            from: fromAddress,
            to,
            subject,
            html: `<h1>Reset Password: </h1><p><a href='${process.env.APP_URL}/passwordReset?token=${token}'>Password Reset Page</a>`
    }

    const result = await sendEmail(message);

    console.log("sendPasswordResetEmail: Finished > ", result);

    return result;
}
