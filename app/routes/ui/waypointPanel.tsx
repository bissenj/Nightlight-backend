import type { userAndPosition } from "~/types/globalTypes";

// TYPES
type waypointList = { users: userAndPosition[] }

// CUSTOM MARKERS
export default function WaypointPanel({userList}: {userList: waypointList}) {        
    //console.log("Waypoint Panel: ", userList);
  
    return (
        <div className='waypoint-panel-container'>
            {/* MARKERS */}
            {(userList.users && userList.users.length > 0) && 
                    userList.users.map((user:any) => {
                      return user.coordinates.map((coord:any, index: number) => {
                        return (                            
                          <div className='waypoint-entry' key={coord.id} style={{backgroundColor: user.settings.avatarColor}}> 
                            <span>{index+1}</span>
                            <span>{coord.timestamp}</span>
                            <span>{coord.latitude}, {coord.longitude}</span>                                                        
                            <span>{coord.accuracy}</span>                                                        
                            <span>{coord.source}</span>                                                        
                          </div>                  
                        )
                    })
                })
            }    
        </div>         
    )
  }