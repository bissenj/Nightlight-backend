import type { ActionFunction } from "@remix-run/node";
import { checkUserAccessToken } from "~/utils/authToken";
import { getUsers } from "~/data/database";
import type { databaseMessage } from "~/types/globalTypes";

// TESTING ENDPOINT
// http://localhost:3000/api/users


export function headers() {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization"
    };
}


// POST - ENDPOINT
export const action: ActionFunction = async ({ request }) => {   
    let result:databaseMessage = {success: false, message: 'Users Error', data: {}, error: 400}
    
    // Verify user is authorized.
    const authRequest = await checkUserAccessToken(request);
    if (!authRequest?.success) {
        return {success: false, message: 'Users Error', data: {}, error: 401}
    }        
    // User is authorized...       
    const email = authRequest.data.data;

    // Get action from form
    const form = await request.formData();
    const action = form.get("actionType");   
    
    // Make sure an action is provided or return an error.
    if (typeof action != "string") {
        return { success: false, message: "No action was provided", data: {}, error: 400 }
    }
     
    if (action == "get") {                
        result = await getUsers(email);                        
        if (result?.success) {
            result.success = true;
            result.message = "";   
        }    
    }    
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