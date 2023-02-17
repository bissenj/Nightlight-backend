/*
  Connect to Strava API, pull down activities and total up the ones with 'uphill' in the name.

  Why:
    Currently there is a Whitefish Mountain Vertical Tracker which totals up a person's amount of elevation gain
    while riding chairlifts.  For those of us who ski up the mountain there's no way to total the elevation gain
    throughout the season, so this page fills that gap.  

  // Original Tutorial from:
  // https://javascript.plainenglish.io/strava-api-react-app-326e63527e2c

  // Epoch timestamp for 'after paramter'
  // https://www.epochconverter.com/

*/

import { useState, useEffect } from 'react';
import { useLoaderData } from "@remix-run/react";     
import type { LoaderFunction, LinksFunction, MetaFunction } from "@remix-run/node"; 

// Styles
import appStylesUrl from "~/styles/app.css";

// Custom UI
import Header from "./ui/header";
import Footer from "./ui/footer";
import AnimatedNumber from "./ui/animatedNumber";

// STYLES
export const links: LinksFunction = () => {
  return [      
      { rel: "icon", href: "/coding.png", type: "image/png", },
      { rel: "stylesheet", href: appStylesUrl },      
  ];
};

// SEO
export const meta: MetaFunction = () => ({
  title: "Uphill Tracker | Nightlight API",
  description:
    "Uphill Tracker Page",  
});


// TYPES
type LoaderData = { strava_client_id: string | undefined, 
                    strava_client_secret: string | undefined, 
                    strava_refresh_token: string | undefined, 
                    success: boolean }

// SERVER GET
// Summary:  Gets the important STRAVA config data
export const loader: LoaderFunction = async({ params }) => {       
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  // Check that all data is present or set flag to prevent page from trying to connect to Strava.
  let success = false;
  if (clientId && clientSecret && refreshToken) {
    success = true;
  }
  
  const data: LoaderData = {
    strava_client_id: clientId, 
    strava_client_secret: clientSecret,
    strava_refresh_token: refreshToken,
    success
  }    
  
  return data;
}


// SUMMARY:  This connects to the Strava API, pulls down all my activities, and totals up the elevation gain for 
//           any with 'uphill' in the name.  Basically recreates the Whitefish Mountain Vertical Tracker 
//           but just for uphill skiing.
//
function StravaApp() {
  
  const ssrData = useLoaderData<LoaderData>();    // SSR Data -> data retrieved on server prior to first render.

  //Strava
  const [isLoading, setIsLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [numUphills, setNumUphills] = useState(0);
  const [elevation, setElevation] = useState(0);
  const [allGoodSSR, setAllGoodSSR] = useState(ssrData.success);  // Do we have the required keys to get and render strava data?
  const [allGoodClient, setAllGoodClient] = useState(true);       // Did our fetch work correctly?

  //Strava Credentials
  let clientID = ssrData.strava_client_id;
  let clientSecret = ssrData.strava_client_secret;  
  let refreshToken = ssrData.strava_refresh_token;  

  let afterTimestamp = 1669935413;   // December 1st, 2023 
  const callRefresh = `https://www.strava.com/oauth/token?client_id=${clientID}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`
  
  // Endpoint for read-all activities. temporary token is added in getActivities()    
  const callActivities = `https://www.strava.com/api/v3/athlete/activities?after=${afterTimestamp}&access_token=`


   // Get list of my activities.  Uses refresh token to get current access token
  useEffect(() => {

    if (allGoodSSR) {
      fetch(callRefresh, {          // attempts to connect to Strava and get the latest access token.
        method: 'POST'
      })
      .then(response => {
        if (response.ok) {
          return response.json();   // this contains the current access token.
        }
        else {
          throw new Error('Something went wrong trying to get activities from Strava.');
        }
      })
      .then(result => getActivities(result.access_token))   // use access token to get all my activities.
      .catch((ex) => {
        console.error('Error caught: ', ex.message);
        setAllGoodClient(false);
      })
    }
  }, [callRefresh])
       

  // use current access token to call strava and get all my activities
  function getActivities(access: any){
    // console.log(callActivities + access)
      fetch(callActivities + access)
      .then(response => response.json())        // these are the activities
      .then(data => { 
        setActivities(data); 
        calculateUphillData(data);              // figure out if i actually left the couch this winter.  Yeah i did.
        setIsLoading(prev => !prev);
      })
      .catch(e => console.error(e))
  }


  // go through the list of activities and total up all the ones with 'uphill' in the name.
  function calculateUphillData(activities: any) {    
    let num = 0;
    let total = 0;

    let i = 0;
    for(i; i<activities.length; i++) {            
        let item = activities[i];            
        if (item.name.toLowerCase().includes('uphill')) {
            num++;
            total += item.total_elevation_gain;
        };        
    }
    //console.log("Num: ", num, 'Elevation: ', total, ' meters.');

    // Convert meters to feet.
    total = Math.round(total * 3.28084);

    setElevation(total);
    setNumUphills(num);
  }


  // get stats to show on screen
  // Notes:  this is going to be called before we connect to strava (before and while page is fetching data) so 
  //         handle that scenario (ie.  return 0 activity count)
  function showActivities() {    
    let result = 0;    

    if(!isLoading) {      
      if (activities && activities.length) {
        result = activities.length;
      }           
    }

    return result;
  }

  console.log('render strava');         // get a handle on how many re-renders this page makes so we can optimize it later.

  return (
    <div className="app">      
      <Header text={'Uphill Skiing Report'}></Header>
      <div className='content'>

        {/* SOMETHING WENT WRONG ON THE SERVER  */}
        { !allGoodSSR &&
          <div>Something went wrong during SSR.  Check Strava config settings.</div>
        }

        {/* SOMETHING WENT WRONG ON THE CLIENT  */}
        { !allGoodClient &&
          <div>Something went wrong clientside during fetch.  Check Strava config settings.</div>
        }

        {/* NOTHING WENT WRONG - PROCEED  */}
        { (allGoodSSR && allGoodClient) &&

          <div className='strava-card'>
            <p className='fs-18'>                
                Total activities this season from Strava: 
                <AnimatedNumber target={showActivities()} decimalPlaces={0}></AnimatedNumber>               
            </p>
            <hr></hr>          
            <div className='fs-12'>

              {/* TOTAL NUMBER OF UPHILL ACTIVITIES */}
              <p>
                Activities that are 
                <a className='link-secondary' target='_new' 
                          href='https://www.aspensnowmass.com/discover/experiences/guides/its-all-uphill-from-here'
                          title='Link to article describing what Uphill Skiing actually is.'
                >
                  uphill skiing 
                </a>
                :
                <AnimatedNumber target={numUphills}></AnimatedNumber>                               
              </p>              

              {/* TOTAL ELEVATION GAIN FOR THE SEASON, IN FEET */}
              <p>
                Elevation Gain (feet): 
                <AnimatedNumber target={elevation}></AnimatedNumber>                            
              </p>              

              {/* TOTAL ELEVATION GAIN FOR THE SEASON, IN MILES */}
              <p>
                Elevation Gain (miles):               
                <AnimatedNumber target={(elevation/5280)} decimalPlaces={2}></AnimatedNumber>                            
              </p>
            </div>
          </div>
        }

      </div>  
      <Footer></Footer>
    </div>
  );
}

export default StravaApp;




/// - LEAVING THIS IN HERE IN CASE I CHOOSE TO MAKE THIS WORK SOME DAY.

// Vertical Tracker
//const [chairLiftElevation, setChairliftElevation] = useState(0);
// const verticalTrackerAPI = 'https://skiwhitefish.com/vertical/search.php';

//
// type LoaderData = { elevation: 0 }
// SERVER GET
// Summary:  Tries to get a user's vertical data from the Whitefish Mountain Vertical Tracker.
//           Doesn't work (and won't) though because of CORS.  
//           Need to do this instead from a non-webbrowser like POSTMAN which isn't affected by CORS.
//
// export const loader: LoaderFunction = async({ params }) => {   
//   console.log("Loader");
//   let results = 0;

//   const verticalTrackerAPI = 'https://skiwhitefish.com/vertical/search.php';
//   const formData = new FormData();
//   formData.append("search_term", "John Bissen");

//     // await fetch(verticalTrackerAPI, {
//     //     method: 'POST',
//     //     mode: 'cors',  
//     //     body: formData
//     // })
//     // .then(res => console.log('getVerticalData: ', res.text()))
//     //.then(result => console.log('getVerticalData: ', result));
   
//     const data: LoaderData = {
//       elevation: 1
//     }  

//   console.log("Data from server: ", data);
  
//   return data;
// }
