import type { databaseMessage } from "~/types/globalTypes";
const jwt = require('jsonwebtoken');


// ---------------------------------------------------------------------------------------
// Attempt to find and return bearer token from request headers.
// ---------------------------------------------------------------------------------------
function findBearer(request: Request): string {
    let result = "";
    request.headers.forEach(item => {      
      if (item.includes('Bearer'))
        result = item.replace('Bearer ', '');
    });
    return result;
}


// ---------------------------------------------------------------------------------------
// Check if token is valid.
// ---------------------------------------------------------------------------------------
async function validateToken(token: string) {
    let result = {success: false, data: {}, error: 0 };    
    try {        
        const token_secret = process.env.TOKEN_SECRET;     // get secret from environment variables

        const decoded = jwt.verify(token, token_secret);        
        result.success = true;
        result.data = decoded;
    }
    catch(ex: any) {
        console.error("Token is not valid: ", ex.name);
    }
    return result;
}


// ---------------------------------------------------------------------------------------
// External method used to determine if request contains a valid user auth.
// ---------------------------------------------------------------------------------------
export async function checkUserAccessToken(request: Request): Promise<databaseMessage> {
    // Check if bearer token exists on authorization header
    const token = findBearer(request);
    if (token === 'undefined') {
      //console.error("Missing token, returning bad request");
      return {success: false, message: "User not authorized", data: '', error:401}
    }

    // Check if bearer token is valid
    const validToken = await validateToken(token);    
    if (!validToken?.success) {
      //console.error("Token is invalid");
      return {success: false, message: "User not authorized", data: '', error:401}
    }

    return { success: true, message: '', data: validToken?.data, error: 200}
}