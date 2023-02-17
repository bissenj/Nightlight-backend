/*
    This is used by front end components (ie Map) to make fetch requests to the server.  

    This is a bit confusing because this Project is technically the backend code base, but there are
    a few front end pages in this codebase like (login, map, reset pasword) and those may need to 
    dynamically retrieve data like a normal web page.

    For example, on the Map screen, no data is being loaded prior to SSR, so this utility is used
    to retrieve data after the page has loaded.
*/

import type { databaseMessage } from "../types/globalTypes";
const { DateTime } = require("luxon");


// ------------------------------------------------------------------------
//  GET MAP - USER POSITIONS - REQUEST
// ------------------------------------------------------------------------
export const fetchUserPositions = async (startDateISO: string, endDateISO: string, limit: number, accuracy: number) : Promise<databaseMessage>  => {    
    let result:databaseMessage = {success: false, message: "Error while getting user positions", data: {}, error: 400}

    if (startDateISO === null) {
        startDateISO = DateTime.now()
    }

    if (endDateISO === null) {
        endDateISO = DateTime.now()
    }
     
    try {                      
        const data = new FormData();        
        data.append("actionType", "get");
        data.append("startDate", startDateISO);
        data.append("endDate", endDateISO);
        data.append("limit", limit.toString());
        data.append("accuracy", accuracy.toString());

        const token = await localStorage.getItem("jwt");        
   
        const response = await fetch(`/api/map`, {
            method: 'POST',
            body: data,
            headers: {                
               'Authorization': `Bearer ${token}` // This is the important part, the auth header
            }  
        });        
        

        if (response.ok) {
            let result = await response.json();                                              
            return result;
        }   
        else {                        
            throw Error('An error occurred in fetchUserPositions');
        }     
       
    } 
    catch (ex: any) {
        console.error("fetchUserPositions: An error occurred: ", ex);    
        result.message = ex.message;
        return result;            
    }
};