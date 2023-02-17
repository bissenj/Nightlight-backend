import type { ActionFunction } from "@remix-run/node";
import { checkUserAccessToken } from "~/utils/authToken";
import { getUserPositions } from "~/data/database";
import type { databaseMessage, userPositionQueryParams } from "~/types/globalTypes";
const { DateTime } = require("luxon");


// TESTING ENDPOINT
// http://localhost:3000/api/map


export function headers() {
    return {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Authorization"
    };
}


// POST - ENDPOINT
export const action: ActionFunction = async ({ request }) => {   
    let result:databaseMessage = {success: false, message: 'Map Error', data: {}, error: 400}
    
    // Verify user is authorized.
    const authRequest = await checkUserAccessToken(request);
    if (!authRequest?.success) {
        return {success: false, message: 'Map Error', data: {}, error: 401}
    }            

    // Get data from form
    const form = await request.formData();
    const action = form.get("actionType");   //save, get
    
    // Make sure an action is provided or return an error.
    if (typeof action != "string") {
        return { success: false, message: "No action was provided", data: {}, error: 400 }
    }
     
    if (action == "get") {        

        /// START DATE        
        let formStartDate = form.get("startDate");         
        let startDate = DateTime.fromISO(formStartDate);        
        let startDateISOStr = startDate.startOf('day').toISO();        
         

        /// END DATE
        let formEndDate = form.get("endDate");                  
        let endDate = DateTime.fromISO(formEndDate);
        let endDateISOStr = endDate.endOf('day').toISO();        
                        

        // LIMIT
        let formLimit = form.get("limit");
        let limit = 1;
        if (formLimit) {
            limit = parseInt(formLimit.toString());            
        }

        // LIMIT
        let formAccuracy = form.get("accuracy");
        let accuracy = 10000;
        if (formAccuracy) {
            accuracy = parseInt(formAccuracy.toString());            
        }
              
        result = await getPositions({startDateISO: startDateISOStr, endDateISO: endDateISOStr, limit, accuracy});                   
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


// ---------------------------------------------------------------------------------------
// Get Users Positions
// ---------------------------------------------------------------------------------------
async function getPositions(params: userPositionQueryParams): Promise<databaseMessage> {
    let result:databaseMessage = {success: false, message: 'Authentication Error', data: {}, error: 400}

    result = await getUserPositions(params);                        
    if (result?.success) {
        result.success = true;
        result.message = "";   
    }  

    return result;
}