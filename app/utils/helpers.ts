/*
    This contains one-off utility methods for the code base.  
*/


// Remove the email suffix at end for super-basic security purposes.
export function sanitizeEmail(email: string) {
    //console.log("sanitizeEmail: ", email);

    let result = "Eagle";
    if (email.includes('bis')) result = "FishBlue";
    if (email.includes('hea')) result = "UpSki";
    if (email.includes('lau')) result = "SnowCat";
    if (email.includes('kat')) result = "Dolphin";
    return result;    
}