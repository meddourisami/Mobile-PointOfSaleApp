// SyncContext.js
import React, { createContext, useState } from 'react';

// Create the context
export const SyncContext = createContext();

// Create the provider component
export const SynchoProvider = ({ children }) => {
    const [syncOption, setSyncOption] = useState('manual'); // Default to 'automatic'

    return (
        <SyncContext.Provider value={{ syncOption, setSyncOption }}>
            {children}
        </SyncContext.Provider>
    );
};
