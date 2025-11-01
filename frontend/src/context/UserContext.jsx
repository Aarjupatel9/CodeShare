import React, { Children, createContext, useState } from 'react';
export const UserContext = createContext(null);


export const UserProvider = ({ children }) => {
    const [currUser, setCurrUser] = useState(null);

    
    return (
        <UserContext.Provider value={{ currUser, setCurrUser }}>
            {children}
        </UserContext.Provider>
    )
}