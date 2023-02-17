import type { ActionFunction } from "@remix-run/node";
import { checkUserAccessToken } from "~/utils/authToken";
import { getUserSettings, saveUserSettings, saveUserSetting } from "~/data/database";
import type { databaseMessage } from "~/types/globalTypes";

// TESTING ENDPOINT
// http://localhost:3000/api/settings

export function headers() {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization"
    };
}


// POST - ENDPOINT
export const action: ActionFunction = async ({ request }) => {           
    let result:databaseMessage = {success: false, message: 'Settings Error', data: {}, error: 400}
        
    // Verify user is authorized.
    const authRequest = await checkUserAccessToken(request);
    if (!authRequest?.success) {
        console.log("No token");
        return {success: false, message: 'Settings Error', data: {}, error: 401}
    }          
    // const authRequest = {data: {data: "mountainsandcode@gmail.com"}}  // FOR TESTING
    
    // User is authorized...       
    const email = authRequest.data.data;

    // Get data from form
    const form = await request.formData();
    const action = form.get("actionType");   //save, get
    
    // Make sure an action is provided or return an error.
    if (typeof action != "string") {
        return { success: false, message: "No action was provided", data: {}, error: 400 }
    }
     
    if (action == "get-settings") {                
        result = await getUserSettings(email);                        
        if (result?.success) {
            result.success = true;
            result.message = "";   
        }    
    }  
    else if (action == "save-settings") {
        const settings = form.get("userSettings");   
        
        if (typeof settings === "string") {
            result = await saveUserSettings(email, settings);                        
            if (result?.success) {
                result.success = true;
                result.message = "";   
            }  
        }
        else {
            result.success = false;
            result.message = "No settings were provided";
        }
    }  
    else if (action == "save-setting") {
        const settings = form.get("userSettings");   
        
        if (typeof settings === "string") {
            result = await saveUserSetting(email, settings);                        
            if (result?.success) {
                result.success = true;
                result.message = "";   
            }  
        }
        else {
            result.success = false;
            result.message = "No setting was provided";
        }
    }  
    else {
        result.success = false;
        result.message = "No action was provided";
    }
   
    console.log("API -> Setting: Finished", result);
    
    const json = JSON.stringify(result);

    return new Response(json, {
        headers: {
            "Content-Type": "application/json",
            "Content-Length": String(Buffer.byteLength(json))
        }
    });
}

