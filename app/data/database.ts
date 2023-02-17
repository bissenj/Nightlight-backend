/* eslint-disable no-empty */
// import type { User, AuditTrail } from "@prisma/client";

import type { databaseMessage, location, userPositionQueryParams } from "../types/globalTypes";
import { db } from "~/data/db.server";

// import { Decimal } from "@prisma/client/runtime";

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const { DateTime } = require("luxon");


// ---------------------------------------------------------------------------------------
// LOGIN USER
// ---------------------------------------------------------------------------------------
export async function loginUser(email:string, password: string): Promise<databaseMessage> {
    console.log("Database: LoginUser(): START");

    let result:databaseMessage = {success: false, message: "Error while Authenticating User", data: {}, error: 0}

    // Find user
    const user = await db.user.findFirst({
        where: {
            email: email
        }
    });

    if (user) {        
        // Use bcrypt to verify password
        const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isCorrectPassword) {
            result.success = false;
            result.message = "Incorrect email or password"
            console.log("User is not authenticated");
        }
        else {
            // If we got here the email and password matched so we're good.
            console.log("User is authenticated");

            // Set up the expiry time:  30 DAYS
            const expiresIn = 60 * 60 * 24 * 30;

            // Create a jwt token 
            const accessToken = jwt.sign(
                { data: email }, 
                'The123Blue4956Fox09123Runs49201Wild', 
                { expiresIn: expiresIn }
            );
            
            console.log("JWT Access Token: ", accessToken);

            result.success = true;
            result.message = "";
            result.data = {email: email, jwt: accessToken, daysToExpire: expiresIn};
        }
    }    
    else {
        result.success = false;
        result.message = "Incorrect username or password";
    }
    console.log("Database->Login: Result -", result);
    return result;
}


// ---------------------------------------------------------------------------------------
// CHECK IF USER EXISTS
// ---------------------------------------------------------------------------------------
export async function checkIfUserExists(email:string): Promise<databaseMessage> {
    console.log("Database: requestPasswordReset(): START");

    let result:databaseMessage = {success: false, message: "Error while requesting password reset", data: {}, error: 0}

    // Find user
    const user = await db.user.findFirst({
        where: {
            email: email
        }
    });

    if (user) {    
        console.log(`User found with email ${email}`);    
        result = { success: true, message: "", data: {id: user.id}, error: 0 };
    }    
    else {
        console.log("No user found with the email provided.");
        result.success = false;        
    }
    return result;
}


// ---------------------------------------------------------------------------------------
// CREATE ACCOUNT
// ---------------------------------------------------------------------------------------
export async function createAccount(name: string, email:string, password: string): Promise<databaseMessage> {
    let result:databaseMessage = {success: false, message: "Error while creating account", data: {}, error: 400}

    try {
        const emailTaken = await checkIfUserExists(email);

        if (emailTaken?.success) {
            throw Error('Email is already being used');            
        }
        else {        
            // encrypt the password
            const passwordHash = await bcrypt.hash(password, 10);

            // create the user object
            const user = {name: name, email, username: email,passwordHash};
            
            // add user to database
            result.data = await db.user.create({data: user});

            result.message = "";

            result.success = true;
        }
    }
    catch(ex: any) {
        result.success = false;
        result.message = ex.message;
    }

    return result;
}


// ---------------------------------------------------------------------------------------
// RESET PASSWORD
// ---------------------------------------------------------------------------------------
export async function resetPassword( hash:string, password: string ): Promise<databaseMessage> {

    let result:databaseMessage = {success: false, message: "Error while updating password", 
                                  data: {}, error: 400}
    
    try {
        // encrypt the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Update users password
        await db.user.update({
            where: {
                id: hash
            },
            data: {
                passwordHash: passwordHash
            }
        });

        result.message = "";
        result.success = true;
    }
    catch(ex: any) {
        console.log("resetPassword: - Exception caught", ex.message);
        result.success = false;
        result.message = ex.message;
    }

    return result;
}


// ---------------------------------------------------------------------------------------
// SAVE LOCATION
// ---------------------------------------------------------------------------------------
//export async function saveLocation(email: string, latitude: number, longitude: number, timestamp: Date, accuracy: number = 0, source: string = ""): Promise<databaseMessage> {

export async function saveLocation(location: location): Promise<databaseMessage> {
    let result:databaseMessage = {success: false, message: "Error while saving location", data: {}, error: 400}

    //let {email, latitude: number, longitude: number, timestamp: Date, accuracy: number = 0, source: string = ""} = location;


    //console.log("Save Location: ", email, latitude, longitude, timestamp, accuracy, source);
    try {

        const user = await db.user.findFirst({
            where: {
                email: location.email
            }
        });
        if (!user) {
            throw Error("Unable to find User");
        }
        
        const position = {
                            userId: user.id, 
                            latitude: location.latitude, 
                            longitude: location.longitude, 
                            timestamp: location.timestamp, 
                            accuracy: location.accuracy, 
                            source: location.source
                        }
        
        result.data = await db.coordinate.create({data: position})
        
        result.message = "";
        result.success = true;
        result.error = 200;
        
    }
    catch(ex: any) {
        result.success = false;
        result.message = ex.message;
    }

    return result;
}


// ---------------------------------------------------------------------------------------
// GET LOCATION
// ---------------------------------------------------------------------------------------
// export async function getLocation(userId: string): Promise<databaseMessage> {
//     let result:databaseMessage = {success: false, message: "Error while saving location", data: {}, error: 400}

//     console.log("Get Location: ", userId);
//     try {

//         const location = await db.coordinate.findMany({
//             take: 10, 
//             orderBy: {
//                 timestamp: 'desc'
//             }
//         });

//         console.log("Locations: ", location);
               
//         result.data = location;
//         result.message = "";
//         result.success = true;
//         result.error = 200;        
//     }
//     catch(ex) {
//         result.success = false;
//         result.message = ex.message;
//     }

//     return result;
// }



// ---------------------------------------------------------------------------------------
// GET USERS
// ---------------------------------------------------------------------------------------
export async function getUsers(email: string): Promise<databaseMessage> {
    let result:databaseMessage = {success: false, message: "Error while getting users", data: {}, error: 400}

    //console.log("getUsers: ", email);
    try {

        // IMPROVE:
        //  This date is dependent on the server date which is not the same
        // as the client date.  Think about passing in a day to retrieve.

        let today = new Date();
        today.setHours(today.getHours()-18);    // Hack for now.
        //today.setHours(0,0,0,0);              // This rolls over at 6:00pm MST.  UGGH.
        //console.log(today);

        const users = await db.user.findMany({
            where: {
                NOT: [
                    // {email: email},
                    {email: { startsWith: 'test' }},
                    {isDeleted: true }
                ]                
            },                         
            include: {
                coordinates: {
                    where: {
                        timestamp: { gte: today },
                    },
                    // take: 20,
                    // skip: 1,
                    orderBy: {
                        timestamp: 'desc'
                    },
                },            
                settings: {                    
                },                
            },
        });

        if (users) { 
            const filteredResults = users.map( (user) => {
                const settings = (user.settings !== null) ? JSON.parse(user.settings.data) : {};
                const currentUser = (user.email === email) ? true : false;

                return { coordinates: user.coordinates, email: user.email, name: user.name, settings, currentUser }
            });           

            // filter out certain fields            
            // const filteredResults = await Promise.all(
            //         users.map( async(user) => {
            //             const settings = (user.settings !== null) ? JSON.parse(user.settings.data) : {};
            //             const currentUser = (user.email === email) ? true : false;

            //             // TEST THIS
            //             if (!user.coordinates || user.coordinates.length === 0) {
            //                 const lastPosition = await getLastPosition(email);
            //                 console.log("Last Position: ", lastPosition);
            //             }

            //             return { coordinates: user.coordinates, email: user.email, name: user.name, settings, currentUser }
            //         }));

                // Make sure each user has at least one coordinate.
                // if (user.coordinates.length === 0) {
                //     const currentPosition = await db.coordinate.findFirst({ 
                //         orderBy: {
                //             timestamp: 'desc'
                //         },                           
                //     });
                //     if (currentPosition !== null) {
                //         user.coordinates.push(currentPosition);
                //     }
                // }
                
            //});

            console.log("Users & Positions: ", filteredResults);
               
            result.data = filteredResults;
            result.message = "";
            result.success = true;
            result.error = 200;        
        }
        else {
            console.log("No users and positions retrieved");
            throw ("No users and positions");
        }
    }
    catch(ex: any) {
        result.success = false;
        result.message = ex.message;
    }

    return result;
}


// ---------------------------------------------------------------------------------------
// GET LAST POSITION
// ---------------------------------------------------------------------------------------
export async function getLastPosition(email: string): Promise<databaseMessage> {
    let result:databaseMessage = {success: false, message: "Error while getting last position", data: {}, error: 400}
    
    console.log("Get Last Position: ", email);
    try {
        const user = await db.user.findFirst({
            where: {
                email: email               
            },                         
            include: {
                coordinates: {                    
                    take: 1,                    
                    orderBy: {
                        timestamp: 'desc'
                    },
                },             
            },
        });

        if (user) {           
            // only return coordinate
            const lastPosition = { coordinate: user.coordinates[0] || null };
                           
            result.data = lastPosition;
            result.message = "";
            result.success = true;
            result.error = 200;        
        }
        else {
            console.log("No user position retrieved");
            throw ("No user positions");
        }
    }
    catch(ex: any) {
        result.success = false;
        result.message = ex.message;
    }
    return result;
}



// ---------------------------------------------------------------------------------------
// GET USER SETTINGS
// ---------------------------------------------------------------------------------------
export async function getUserSettings(email: string): Promise<databaseMessage> {
    let result:databaseMessage = {success: false, message: "Error while getting user settings", data: {}, error: 400}

    console.log("getUserSettings: ", email);
    try {

        // For convenience, get settings through the user object via email.
        const userAndSettings = await db.user.findUnique({
            where: {                
                email: email,            
            },                             
            include: {
                settings: {                    
                },
            },
        });

        // Check if user has any settings and return them.  
        // They may not have any yet, in which case, return a blank object.
        if (userAndSettings && userAndSettings.settings && userAndSettings.settings.data) {
            
            // DON"T PRINT THIS SINCE PASSWORD WILL BE INCLUDED
            //console.log("UserAndSettings: ", userAndSettings);
            
            const settings = userAndSettings.settings; //{ userAndSettings.settings.data, email: email};

            //console.log("getUserSettings: ", settings);
            result.data = settings.data;
            result.message = "";
            result.success = true;
            result.error = 200;
        }
        else {
            console.log("getUserSettings: User does not have any settings saved");   

            result.data = "{}"; // Need to be a string since that is how its stored in database and it will be parsed later on.
            result.message = "User does not have any settings saved";
            result.success = true;
            result.error = 200;
        }

    }
    catch(ex: any) {
        result.success = false;
        result.message = ex.message;
    }

    return result;
}


// ---------------------------------------------------------------------------------------
// SAVE USER SETTINGS
// ---------------------------------------------------------------------------------------
export async function saveUserSettings(email: string, newSettings: string): Promise<databaseMessage> {
    let result:databaseMessage = {success: false, message: "Error while saving user settings", data: {}, error: 400}

    console.log("saveUserSettings: ", email, newSettings);
    try {
        // For convenience, get settings through the user object via email.
        const updateUserSettings = await db.user.update({
            where: {                
                email: email,            
            },                 
            data: {
                settings: {                    
                    upsert: {
                        create: {
                            data: newSettings,
                        },
                        update: {
                            data: newSettings,
                        }
                    }
                },
            },
        });
                
        if (updateUserSettings) {    
            console.log("saveUserSettings: ", updateUserSettings);               
            result.data = {};
            result.message = "";
            result.success = true;
            result.error = 200;
        }
        else {
            // UNSURE WHAT IT MEANS TO END UP HERE
            console.log("saveUserSettings: NOW WHAT??? ", updateUserSettings);                         
        }

    }
    catch(ex: any) {
        result.success = false;
        result.message = ex.message;
    }
    return result;
}


// ---------------------------------------------------------------------------------------
// SAVE USER SETTING
// ---------------------------------------------------------------------------------------
export async function saveUserSetting(email: string, newSetting: string): Promise<databaseMessage> {
    let result:databaseMessage = {success: false, message: "Error while saving user setting", data: {}, error: 400}

    console.log("saveUserSetting: ", email, newSetting);
    try {        
        // // Get user settings if they exist.
        const userSettings = await getUserSettings(email);
        if (userSettings && userSettings.success) {
            //console.log("gotUserSetting: ", userSettings);

            const parsedSettings = JSON.parse(userSettings.data);            
            console.log("Parsed Settings: ", parsedSettings);

            // convert user settings from request to object
            const requestSettings = JSON.parse(newSetting);
            //console.log("requestSettings: ", requestSettings);
            
            // Merge the two objects
            const newUserSettings = Object.assign(parsedSettings, requestSettings);
            console.log("newUserSettings: ", newUserSettings);            

            const newUserSettingsString = JSON.stringify(newUserSettings);
            return await saveUserSettings(email, newUserSettingsString);
        }
    }
    catch(ex: any) {
        console.log("Caught error in saveSetting: ", ex);
        result.success = false;
        result.message = ex.message;
    }
    return result;
}



// 2.0 - Web Tracking


// ---------------------------------------------------------------------------------------
// GET USER POSITIONS
// ---------------------------------------------------------------------------------------
// export async function getUserPositions(userId: string, startDate: Date, endDate: Date ): Promise<databaseMessage> {
//     let result:databaseMessage = {success: false, message: "Error while getting User Positions", data: {}, error: 400}
    
//     try {
        
//         const userPosition = await db.user.findFirst({
//             where: {
//                 NOT: [
//                     // {email: email},
//                     {id: userId},
//                     {isDeleted: true }
//                 ]                
//             },                         
//             include: {
//                 coordinates: {
//                     where: {
//                         timestamp: { gte: startDate, lte: endDate },
//                     },
//                     // take: 20,
//                     // skip: 1,
//                     orderBy: {
//                         timestamp: 'desc'
//                     },
//                 },            
//                 settings: {                    
//                 },                
//             },
//         });

//         if (userPosition) { 
//             // parse the settings into an array
//             const settings = (userPosition.settings !== null) ? JSON.parse(userPosition.settings.data) : {};
            
//             // create the user object to return
//             const user = { coordinates: userPosition.coordinates, email: userPosition.email, settings }          
                        
//             console.log("User & Positions: ", user);
               
//             result.data = user;
//             result.message = "";
//             result.success = true;
//             result.error = 200;        
//         }
//         else {
//             console.log("No users and positions retrieved");
//             throw ("No users and positions");
//         }
//     }
//     catch(ex: any) {
//         result.success = false;
//         result.message = ex.message;
//     }

//     return result;
// }


// ---------------------------------------------------------------------------------------
// GET USER POSITIONS
//  Params:
//      startDate -> UTC format
//      endDate -> UTC format
//      limit -> how many records should be skipped while querying
//      accuracy -> include all waypoints with an accuracy equal to or less than this
//      
// ---------------------------------------------------------------------------------------
//export async function getUserPositions(startDateISO:any, endDateISO:any, limit: number, accuracy: number): Promise<databaseMessage> {
export async function getUserPositions(params: userPositionQueryParams): Promise<databaseMessage> {
    let result:databaseMessage = {success: false, message: "Error while getting users", data: {}, error: 400}
    
    let {startDateISO, endDateISO, limit, accuracy } = params;

    // if (startDateISO === undefined) {
    //     console.log("startDate is blank, setting default start date");
    //     startDateISO = new Date();        
    // }    

    // if (endDateISO === undefined) {
    //     console.log("endDate is blank, setting default end date");
    //     endDateISO = new Date();
    // }    

    // if (limit === undefined) {
    //     limit = 1;
    // }

    // if (accuracy === undefined) {
    //     accuracy = 10000;
    // }
    

    try {
        
        const users = await db.user.findMany({
            where: {
                NOT: [                    
                    {email: { startsWith: 'test' }},
                    {isDeleted: true }                    
                ]                
            },                         
            include: {
                coordinates: {     
                    where: {
                        timestamp: { gte: startDateISO, lte: endDateISO },
                        accuracy: { lte: accuracy}
                    },               
                    take: limit,
                    // skip: skip,                    
                    orderBy: {
                        timestamp: 'desc'
                    },
                },            
                settings: {                    
                },                
            },
        });

        if (users) { 
            const filteredResults = users.map( (user) => {
                const settings = (user.settings !== null) ? JSON.parse(user.settings.data) : {};
                const currentUser = false;

                return { coordinates: user.coordinates, email: user.email, name: user.name, settings, currentUser }
            });           
                           
            result.data = filteredResults;
            result.message = "";
            result.success = true;
            result.error = 200;        
        }
        else {            
            throw ("getUserPositions: No users and positions");
        }
    }
    catch(ex: any) {
        result.success = false;
        result.message = ex.message;
    }

    return result;
}










