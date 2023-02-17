/*
    API route for authentication actions such as logins, Reset Password, and Create Account.
*/

import type { ActionFunction } from "@remix-run/node";
import { loginUser, checkIfUserExists, createAccount } from "~/data/database";
import { sendPasswordResetEmail } from "~/domain/nightlightEmails";
import type { databaseMessage } from "~/types/globalTypes";

// TESTING ENDPOINT
// http://localhost:3000/api/login


// VALIDATIONS
function validateName(name: FormDataEntryValue | null) {
    if (typeof name !== "string" || name.length < 2) {
        return 'Name must be at least 2 characters long';
    }
}

function validateUsername(username: FormDataEntryValue | null) {
    if (typeof username !== "string" || username.length < 3) {
        return 'Username must be at least 3 characters long';
    }
}

function validateEmail(email: FormDataEntryValue | null) {
    if (typeof email !== "string" || email.length < 6) {
        return 'Email must be at least 6 characters long';
    }
}

function validatePassword(password: FormDataEntryValue | null) {
    if (typeof password !== "string" || password.length < 6 || password.length > 12) {
        return 'Passwords must be at least 6 characters and not more than 12 characters.';
    }
}

export function headers() {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization"
    };
}


// ENDPOINT
export const action: ActionFunction = async ({ request }) => {   
    let result:databaseMessage = {success: false, message: 'Authentication Error', data: {}, error: 400}
    
    // Figure out what request is trying to do.
    const form = await request.formData();
    const action = form.get("loginType");
    
    // Make sure an action is provided or return an error.
    // if (typeof action != "string") {
    //     return { success: false, message: "No action was provided", data: {}, error: 400 }
    // }
    
    if (action == "reset") {                            // Reset Password
        const email = form.get("email");
        if (typeof email == 'string') {            
            result = await handleResetAction(email);
        }        
    }
    else if (action == "login") {                       // Login
        const email = form.get("email");
        const password = form.get("password");
        if (typeof email == 'string' && typeof password == 'string') {
            result = await handleLoginAction(email, password);
        }
    }
    else if (action == "register") {                    // Create Account
        const name = form.get("name");
        const email = form.get("email");
        const password = form.get("password");
        if (typeof email == 'string' && typeof password == 'string' && typeof name == 'string') {                
            handleCreateAccountAction(email, password, name);
        }
    }
    else {        
        result.message = "No action was provided";
    }
       
    
    const json = JSON.stringify(result);
    return new Response(json, {
        headers: {
            "Content-Type": "application/json",
            "Content-Length": String(Buffer.byteLength(json))
        }
    });
}


// ---------------------------------------------------------------------------------------
// Password Reset Path
// ---------------------------------------------------------------------------------------
async function handleResetAction(email: string): Promise<databaseMessage> {
    let result:databaseMessage = {success: false, message: 'Authentication Error', data: {}, error: 400}
    
    // Validate form fields
    let fieldErrors = {
        email: validateEmail(email),            
    }

    // Make sure there are no validation errors before proceeding
    if (!Object.values(fieldErrors).some(Boolean)) {

        // No validation errors, so process the password reset request                      
        result = await checkIfUserExists(email);                                   
        if (result?.success) {  
            const token = result?.data?.id || "";

            const emailResult = await sendPasswordResetEmail(email, token);            
            if (emailResult) {
                result.success = true;
                result.message = "Password reset email sent";
            }
            else {
                result.success = false;
                result.message = "Unable to send email.  Email service may be down.";
            }
        }            
    }
    else {    
        // Validation failed.

        result.success =  false;
        result.message = 'One or more fields have have issues that need to be corrected.'; 
        result.data = fieldErrors;     
    }

    return result;
}


// ---------------------------------------------------------------------------------------
// Login Path
// ---------------------------------------------------------------------------------------
async function handleLoginAction(email: string, password: string): Promise<databaseMessage>  {
    let result:databaseMessage = {success: false, message: 'Authentication Error', data: {}, error: 400}
       
    // Validate form fields
    let fieldErrors = {
        username: validateUsername(email),
        password: validatePassword(password)
    }

    // Make sure there are no validation errors before proceeding
    if (!Object.values(fieldErrors).some(Boolean)) {
        result = await loginUser(email, password);
    }
    else {
        console.log("Field Validation Failed: ", fieldErrors);
        result.success = false;
        result.message = 'One or more fields have have issues that need to be corrected.';
        result.data = fieldErrors;
    } 

    return result;
}


// ---------------------------------------------------------------------------------------
// Create Account Path
// ---------------------------------------------------------------------------------------
async function handleCreateAccountAction(email: string, password: string, name:string): Promise<databaseMessage>  {
    let result:databaseMessage = {success: false, message: 'Authentication Error', data: {}, error: 400}

    // Validate form fields
    let fieldErrors = {
        name: validateName(name),
        email: validateUsername(email),
        password: validatePassword(password)
    }

    // Make sure there are no validation errors before proceeding
    if (!Object.values(fieldErrors).some(Boolean)) {
        result = await createAccount(name, email, password);
    }
    else {
        console.log("Field Validation Failed: ", fieldErrors);
        result.success = false;
        result.message = 'One or more fields have have issues that need to be corrected.';
        result.data = fieldErrors;
    } 

    return result;
}