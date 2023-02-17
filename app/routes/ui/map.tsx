/*
  References:
    https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/
    https://blog.logrocket.com/using-mapbox-gl-js-react/
    https://docs.mapbox.com/help/tutorials/?product=Mapbox+GL+JS
    https://visgl.github.io/react-map-gl/docs/api-reference/popup
*/

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLoaderData } from "@remix-run/react";
import type { LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import Map from "react-map-gl";

import type { userAndPosition } from "~/types/globalTypes";

// Styles
import mapStylesUrl from "~/styles/map.css";
import mapBoxStylesUrl from "mapbox-gl/dist/mapbox-gl.css";

// API
import { fetchUserPositions } from "~/utils/fetchHelpers"

// Custom UI
import UserList from "./userList";
import WaypointPanel from "./waypointPanel";
import CustomMarkerList from "./customMarkerList";
import Dropdown from "./dropdown";
import { sanitizeEmail } from "~/utils/helpers"

const { DateTime } = require("luxon");

const BUILD_VERSION = "02/17/2023-C";

// STYLES
export const links: LinksFunction = () => {
  return [      
      { rel: "icon", href: "/coding.png", type: "image/png", },
      { rel: "stylesheet", href: mapStylesUrl },
      { rel: "stylesheet", href: mapBoxStylesUrl }    
  ];
};

// SEO
export const meta: MetaFunction = () => ({
  title: "Travel Map",
  description:
    "See where we have been",  
});


// TYPES
type LoaderData = { users: [], key: string, buildVersion: string }

// SERVER GET
// Summary:  Sets Mapbox API key, thats it.       //OLD:: Get GPS coordinates from database
// WARNING: Loading GPS coords is now moved to onMount.
export const loader: LoaderFunction = async({ params }) => {       
  const mapboxKey = process.env.MAPBOX_API;
  const build = BUILD_VERSION; 
  
  // NOTE:  Don't do it this way or it will need to be manually updated in the HOST secrets list
  //        every deploy.
  //const build = process.env.BUILD_VERSION;  
  
  const data: LoaderData = {
    users: [], 
    key: mapboxKey ?? "",
    buildVersion: build ?? "N/A"
  }    
  
  return data;
}


export default function MapScreen() {       
    const debugging = false;  // When debugging, don't render the map (to reduce Mapbox API costs)
    const LOADING_DELAY = 3500;
    const SHORT_LOADING_DELAY = 300;
    const LOADING_OPACITY = 0.5;
    
    const data = useLoaderData<LoaderData>();        
    
    // Used to determine if UserList needs to be refreshed.
        // 0 = Don't refresh
        // 1 = Refresh (an input was changed)   
    //
    const [refreshParent, setRefreshParent] = useState(0);          

    // User Input
    const [startDate, setStartDate] = useState(null);               
    const [endDate, setEndDate] = useState(null);                   
    const [markerQuantity, setMarkerQuantity] = useState(1);        
    const [markerAccuracy, setMarkerAccuracy] = useState(10);       
    
    // UI Data
    const [userList, setUserList] = useState({users: []});          
    const [email, setEmail] = useState("");                         
    const [mapKey, setMapKey] = useState({key: data.key});              
    const [jwt, setJwt] = useState("");                             

    // Render States
    const [showDebug, setShowDebug] = useState(false);
    const [loading, setLoading] = useState(true);                   

    // Use 'useRef' instead of state to avoid re-renders.  
    // These variables are not needed immediately when they change, so don't need a re-render.
    const loadDelay = useRef(LOADING_DELAY);
    const loadOpacity = useRef(0);
    const mapIsLoaded = useRef(false);
    

    let navigate = useNavigate();

    // Screen constants   
    const timePeriodDropdown = { label: "Time Period", 
            list: [
              {value:-365, title: 'Last Updated'},
              {value:0, title: 'Today'},
              {value:-1, title: 'Yesterday'},
              {value:-3, title: 'Last 3 Days'},
              {value:-7, title: 'Last 7 Days'},
              {value:-30, title: 'Last 30 Days'}
            ]}
    const wayPointsDropdown = { label: "Waypoints", 
            list: [
              {value:1, title: 'Last Position'},
              {value:100, title: 'Some'},
              {value:400, title: 'Many'},
              {value:2000, title: 'Most'}
            ]}
    const accuracyDropdown = { label: "Accuracy", 
            list: [
              {value:10, title: 'Great'},
              {value:25, title: 'Good'},
              {value:100, title: 'Normal'},
              {value:250, title: 'Meh'},
              {value:10000, title: 'Poor'}
            ]}

    // Runs once when component is mounted
    useEffect(() => {
      //console.log('UseEffect -> Map Component is Mounted');
      if (data) {
        setUserList({users: data.users});

        // get user's email from local storage
        const user = localStorage.getItem("email");
        if (user) {          
          setEmail(sanitizeEmail(user));

          // get JWT token from local storage
          const token = localStorage.getItem("jwt");
          if (token) {
            setJwt(token);
          }

          // Set End Date
          let _endDate = DateTime.fromObject({}, {zone: 'America/Denver'});
          setEndDate(_endDate.toString());
          //console.log("End Date: ", _endDate.toISO());

          // Set Start Date
          let _startDate = DateTime.fromObject({}, {zone: 'America/Denver'});          
          _startDate = _startDate.plus({days:-365});
          setStartDate(_startDate.toString());
          //console.log("Start Date: ", _startDate.toISO());
          
          // get data for the map (from API)
          fetchUsersAndWaypoints(_startDate, _endDate, markerQuantity, markerAccuracy);           
                 
        }  
        else {
          //console.log("User is not authenticated - Navigating to login screen");

          // go to login screen 
          navigate("/login", { replace: true });          
        }             
      }
    }, []);


    // Gets called whenever an input is changed.  Causes users and waypoints to be re-queried.
    useEffect(() => {   
      const getUsers = async () => {
        console.log('UseEffect -> Refresh Parent', refreshParent);
        if (refreshParent != 0) {
            //console.log("reload data", refreshParent);
            setLoading(true);
                              
            // get data for the map
           await fetchUsersAndWaypoints(startDate, endDate, markerQuantity, markerAccuracy);   
        }
        else {
            // Do nothing here (by design)
            console.log("refreshParent is 0");     
        }    
      }  
      getUsers();    
      
  }, [refreshParent] );


  // Change transition variables once the map is loaded
  useEffect(() => {
      console.log('UseEffect -> Map is loaded', mapIsLoaded.current);
      if (mapIsLoaded.current) {
        // Sets delay animation to something less dramatic than the initial starting transition
        // since the map is already loaded.
        loadDelay.current = SHORT_LOADING_DELAY;
        loadOpacity.current = LOADING_OPACITY;        
      }
  }, [mapIsLoaded.current])

 
  // Fetch data for map
  const fetchUsersAndWaypoints = async(start:any, end:any, quantity:number, accuracy:number) => {     
    // Network request to refresh user list
    const usersAndPositions = await fetchUserPositions(start, end, quantity, accuracy);   
    //console.log("Users And Positions: ", usersAndPositions);

    // Check if the user is authenticated (or if jwt token expired)
    if (usersAndPositions.success === false && usersAndPositions.error === 401) {
          alert("You are no longer authenticated, please click OK and log back in");

          // go to login screen 
          navigate("/login", { replace: true });  
    }

    // Sanitize emails
    let users = usersAndPositions.data;    
    users.map((item: userAndPosition) => {
      item.email = sanitizeEmail(item.email);
    });    
    setUserList({users: users});   

    //console.log("fetchUsersAndWaypoints: ", usersAndPositions);                 

    // Reset the screen.
    setRefreshParent(0);                
    setTimeout(() => { 
      //console.log('Timer expired......');
      setLoading(false);  // Causes 1 render

      mapIsLoaded.current = true;      
    },     
    loadDelay.current);
  }
  

  // Used to refresh data when the time period changes.
  async function handleTimePeriodChange(e: React.ChangeEvent<HTMLInputElement>) {
    const daysOffset = parseInt(e.target.value);
    
    let _startDate = DateTime.fromObject({}, {zone: 'America/Denver'});          
    _startDate = _startDate.plus({days:daysOffset});

    let _endDate = DateTime.fromObject({}, {zone: 'America/Denver'});     
    if (daysOffset === -1) {
      _endDate = _endDate.plus({days:daysOffset});
    }

    // update state
    setStartDate(_startDate);
    setEndDate(_endDate);

    // Tell React we need to refresh this page      
    setRefreshParent(1);      
  }

  // Used to refresh data when the accuracy changes.
  async function handleAccuracyChange(e: React.ChangeEvent<HTMLInputElement>) {
    const updatedAccuracy = parseInt(e.target.value);    
    setMarkerAccuracy(updatedAccuracy);

    // Tell React we need to refresh this page      
    setRefreshParent(1);      
  }

  // Used to refresh data when the quantity changes.
  async function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const updatedQuantity = parseInt(e.target.value);
    setMarkerQuantity(updatedQuantity);

    // Tell React we need to refresh this page      
    setRefreshParent(1);      
  }
    
  console.log('Render');    // So we can get a handle on how many re-renders are occurring.

  // RENDER
  return (
    <div id='app' className='container'>  

      {/* HEADER SECTION */}
      <header className='header-container'>
        <div className='title'>
          Travel Map          
        </div>
        
        {/* USER NAMES */}  
        <div className="hidden" style={{opacity: loading ? loadOpacity.current : 1, marginBottom: '20px'}}>     

          {userList && userList.users && userList.users.length > 0 &&
            <UserList users={userList?.users} action={() => setShowDebug(!showDebug)} />
          }

        </div>

        {/* CONTROLS SECTION */}
        <div className='controls-container'>
          {/* HOW FAR BACK TO QUERY DB */}
          <Dropdown state={loading} label={timePeriodDropdown.label} list={timePeriodDropdown.list} changeAction={handleTimePeriodChange} />

          {/* FILTER BY ACCURACY */}
          <Dropdown state={loading} label={accuracyDropdown.label} selected={250} list={accuracyDropdown.list} changeAction={handleAccuracyChange} />

          {/* HOW MANY WAYPOINTS TO DISPLAY */}          
          <Dropdown state={loading} label={wayPointsDropdown.label} list={wayPointsDropdown.list} changeAction={handleAmountChange} />
        </div>
      </header>

      {/* MAIN CONTENT  */}
      <main className='content' style={{overflow: showDebug ? 'scroll': 'hidden'}}>

        {/* 
            Only render the map after we have users 
            this is to prevent the map from loading before we verify the user is authenticated.
        */}
        {userList && userList.users && userList.users.length > 0 &&

          // Loading overlay 
          <div className={loading ? "loading" : ""}> 

              {/* // MAP   */}
              {!debugging &&           
              <div className="map-container hidden" style={{opacity: loading ? loadOpacity.current : 1}}>                 
                  <Map mapboxAccessToken={mapKey.key} initialViewState={{longitude: -100, latitude: 40, zoom: 3.5, }}
                    style={{width: '100%'}} mapStyle="mapbox://styles/aspenpeakstudios/cl5blgs04000i15p8hzfgrvcq"
                  >
                    {/* MARKERS */}
                    <CustomMarkerList
                      users={userList?.users}
                    />                                  
                  </Map>
              </div> 

              } 
              {debugging && 
                <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}><p>DEBUG MODE IS ON.  MAP WILL NOT BE ACTIVATED</p></div>
              } 

              {/* Refresh Button */}
              <div 
                className="refresh-button hidden" 
                style={{opacity: loading ? loadOpacity.current : 1}}
                onClick={() => setRefreshParent(1)}
              >
                <span>&#x21bb;</span>
              </div>

          </div>
      }

          {/* WAYPOINTS LISTING FOR DEBUGGING */}
          { showDebug && 
            <WaypointPanel userList={userList} />
          }
        
      </main>

      {/* FOOTER SECTION */}
      <footer className='footer-container'>
        <span className='build'>Build Version: {data.buildVersion}</span>
        <a href="../login"><span>{email.length > 0 ? email : "Log in here"}</span></a>
      </footer>        
    </div>
    );
  }
  