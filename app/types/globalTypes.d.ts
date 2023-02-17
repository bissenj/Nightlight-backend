
export type databaseMessage = {
    success: boolean,
    message: string,
    data: any,
    error: number
}

export type userSettingsDefinitions = {
    updateSpeed: number,
    updateDistance: number,
    avatarColor: string,
    avatorImage: string,
}

export type mailMessage = {
    from: string,
    to: string,
    subject: string,
    html: string
}

export type location = {
    email: string, 
    latitude: number, 
    longitude: number, 
    timestamp: Date, 
    accuracy: number, 
    source: string
}

export type userPositionQueryParams = {
    startDateISO:string,
    endDateISO:string, 
    limit: number, 
    accuracy: number
}

export type position = {
    accurancy: string,
    id: string,
    latitude: string,
    longitude: string,
    source: string,
    timestamp: string,
    userId: string
}

export type userAndPosition = {    
    coordinates: [position],
    currentUser: boolean,
    email: string,
    name: string,
    settings: userSettingsDefinitions
}

// export type usersAndPositions = [userAndPosition]


