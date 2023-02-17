import type { userAndPosition } from "~/types/globalTypes";

export default function UserList({users, action}: {users: userAndPosition[], action: any})
{
    console.log("Userlist: ", users, users.length);
    return (
        <div className='users-grid'>
            {(users && users.length > 0) &&  
                users.map((user: any) => { 
                    return <UserPill  key={user.name} color={user.settings.avatarColor}                         
                                email={user.email} 
                                action={action} /> 
                            })
            }
            
            {(!users || users.length === 0) &&                
                <UserPill  key={123} color={"white"} email={"No Users"} action={null} />
            }
        </div>   
    );
}


function UserPill({color, email, action}: {color: string, email: string, action: any})
{
    let admin = (email === 'FishBlue') ? true : false;

    return (
        <div 
            className='avatar-pill'
            style={{'backgroundColor': color, 'color': 'white' }}   
            onClick={admin ? action : function() {return undefined}}          
        >            
            {email}
        </div>          
    ) 
}