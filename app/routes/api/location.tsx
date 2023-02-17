import type { ActionFunction } from "@remix-run/node";
import { checkUserAccessToken } from "~/utils/authToken";
import { saveLocation } from "~/data/database";
import type { databaseMessage, location } from "~/types/globalTypes";

// TESTING ENDPOINT
// http://localhost:3000/api/location


// VALIDATIONS
function validateUserId(userId: string) {
    if (typeof userId !== "string" || userId.length < 2) {
        return 'userId must be at least 2 characters long';
    }
}
function validateLatitude(latitude: number) {
    if (typeof latitude !== "number") {
        return 'latitude must be a number';
    }
}
function validateLongitude(longitude: number) {
    if (typeof longitude !== "number") {
        return 'longitude must be a number';
    }
}


export function headers() {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization"
    };
}

/**
 *  Notes:  GPS Coordinates (latitude, longitude) look like this:
 *          48.276157987519774, -114.33998100991965
 */

// POST - ENDPOINT
export const action: ActionFunction = async ({ request }) => {  
    let result:databaseMessage = {success: false, message: 'Location Error', data: {}, error: 400}
    
    // Verify user is authorized.
    const authRequest = await checkUserAccessToken(request);
    if (!authRequest?.success) {
        return {success: false, message: 'Location Error', data: {}, error: 401}
    }        
    
    // Get data from form
    const form = await request.formData();
    const action = form.get("actionType");   //save, get
    
    // Make sure an action is provided or return an error.
    if (typeof action != "string") {
        return { success: false, message: "No action was provided", data: {}, error: 400 }
    }

    // Save GPS coordinate to database
    if (action == "save") {        
        const email = authRequest.data.data || "";
        const lat = form.get("latitude");
        const long = form.get("longitude");
        let acc = form.get("accuracy");
        let time = form.get("timestamp");        
        let src = form.get("source");
        
        let latitude = 0;
        if (lat && typeof lat == 'string') {
            latitude = parseFloat(lat); 
        }

        let longitude = 0; 
        if (long && typeof long == 'string') {
            longitude = parseFloat(long);
        }

        // Accuracy was added later which means previous versions of app may not be sending it, so 
        // handle that possibility.
        let accuracy = 0;
        if (acc && typeof acc == 'string') {
            accuracy = parseFloat(parseFloat(acc).toFixed(2));  // round to 2 decimals
        }

        // Source was added later which means previous versions of app may not be sending it, so 
        // handle that possibility.
        let source = "";
        if (typeof src == 'string') {
            source = src;
        } 

        let timestamp = new Date();
        if (time !== undefined && typeof time == 'string') {            
            timestamp = new Date(time);            
        }        

        // handle save action     
        result = await handleSaveAction({email, latitude, longitude, timestamp, accuracy, source});
    }

    // if (action == "get") {
    //     const userId = form.get("userId");
        
    //     // Validate email
    //     fieldErrors = { 
    //         userId: validateUserId(userId),           
    //     }

    //     // Make sure there are no validation errors before proceeding
    //     if (!Object.values(fieldErrors).some(Boolean)) {
    //         // No validation errors, so process the save request

    //         result = await getLocation(userId);                        
    //         if (result?.success) {
    //             result.success = true;
    //             result.message = "";   
                
    //             console.log("Result: ", result);
    //         }            
    //     }
    //     else {
    //         console.log("Data Validation Failed: ", fieldErrors);
    //         result.success = false;
    //         result.message = 'One or more pieces of data have have issues.';
    //         result.data = fieldErrors;            
    //     }        
    // }
    else {
        result.success = false;
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
// Save Location Path
// ---------------------------------------------------------------------------------------
async function handleSaveAction(location: location): Promise<databaseMessage> {
    let result:databaseMessage = {success: false, message: 'Authentication Error', data: {}, error: 400}

    // Validate email
    let fieldErrors = {         
        latitude: validateLatitude(location.latitude),
        longitude: validateLongitude(location.longitude)          
    }

    // Make sure there are no validation errors before proceeding
    if (!Object.values(fieldErrors).some(Boolean)) {
        // No validation errors, so process the save request

        result = await saveLocation(location);                        
        if (result?.success) {
            result.success = true;
            result.message = "";                
        }            
    }
    else {
        console.log("Data Validation Failed: ", fieldErrors);
        result.success = false;
        result.message = 'One or more pieces of data have have issues.';
        result.data = fieldErrors;            
    }   

    return result;
}