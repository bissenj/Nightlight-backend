import { useState } from "react";
import { Marker, Popup } from "react-map-gl";
import { sanitizeEmail } from "~/utils/helpers"
import type { position, userAndPosition } from "~/types/globalTypes";


// -------------------------------------------------------------------------------------------------
// RENDERS ALL THE COORDINATES FOR A LIST OF USERS
// -------------------------------------------------------------------------------------------------
export default function CustomMarkerList({users}: { users:userAndPosition[]}) {

    if (users && users.length > 0) {
        console.log("CustomMarkerList: ", users, users[0].coordinates.length);
    }

    if (!users || Object.keys(users).length < 1) {
        return <></>;
    }

    return (
        <>
            {users.map((user) => (                
                <UserMarkerList
                    key={user.name}
                    userColor={user.settings.avatarColor}
                    email={sanitizeEmail(user.email)}
                    coordinates={user.coordinates} 
                />
            ))}
        </>        
    )
}


// -------------------------------------------------------------------------------------------------
// RENDERS ALL THE COORDINATES FOR A USER
// -------------------------------------------------------------------------------------------------
function UserMarkerList({email, userColor, coordinates}: 
                        {email: string, userColor:string, coordinates:[position]}) {

    let sortedCoords = coordinates.reverse();       // Put oldest first

    return (  
        <div>
            {sortedCoords.map((coord:any, index: number) => (                
                <CustomMarker 
                    key={coord.id}
                    lat={coord.latitude}
                    long={coord.longitude}
                    userColor={userColor}
                    email={email}
                    timestamp={coord.timestamp} 
                    index={index+1}     
                    currentPosition={sortedCoords.length} 
                    accuracy={coord.accuracy}                                            
                />  
            ))}  
        </div>              
    )
}


// -------------------------------------------------------------------------------------------------
// CHILD COMPONENT FOR COORDINATE MARKER
// -------------------------------------------------------------------------------------------------
function CustomMarker({userColor, lat, long, email, timestamp, index, currentPosition, accuracy}: 
                      {userColor:string, lat: number, long:number, email:string, timestamp:string, 
                       index:number, currentPosition:number, accuracy:string}) {

    const [showPopup, setShowPopup] = useState(false);
    const classes = (index === currentPosition) ? 'custom-marker most-recent-marker' : 'custom-marker';
    
    return (
        <>
            <Marker    
                style={{zIndex: index === 0 ? 10 : "unset"}}
                longitude={long}
                latitude={lat}
                onClick={(e)=>{  
                    // HACK to override MapBox's 'closeOnClick' functionality.              
                    setTimeout(() => {setShowPopup(true); }, 150);                
                }}
            >  
                <>
                    <div className={classes} style={{backgroundColor: userColor, display:'flex', justifyContent: 'center', padding:'5px'}}>
                        <div style={{color: 'white', position: 'absolute', top:'0px', fontSize: '0.7em'}}>{index}</div>
                    </div> 
                </>
            </Marker>                

            {showPopup && (                
                <Popup 
                    longitude={long} latitude={lat} 
                    anchor="bottom"
                    closeOnClick={true}
                    closeButton={false}
                    onClose={() => setShowPopup(false)}    
                >                
                    <div className="custom-popup">
                        <p> {email} </p>
                        <p> <span className="popup-heading">Index: </span> 
                            {index} 
                            <br></br>
                            <span>(Higher is more recent.)</span>
                        </p>

                        <p><span className="popup-heading">Updated:</span> {timestamp} </p>
                        {index === currentPosition && 
                            <p><span>(This is the most recent location update)</span> </p>
                        }

                        <p><span className="popup-heading">Accuracy:</span> {accuracy} </p>
                    </div>
                </Popup>     
            )}
        </>
    )
}