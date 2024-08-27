import React, { createContext, useState, useContext } from 'react';

const SyncContext = createContext();

export const useSync = () => useContext(SyncContext);

export const SyncProvider = ({ children }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  return (
    <SyncContext.Provider value={{ isSyncing, setIsSyncing }}>
      {children}
    </SyncContext.Provider>
  );
};