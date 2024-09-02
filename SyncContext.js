import React, { createContext, useState, useContext } from 'react';

const SyncContext = createContext();

export const useSync = () => useContext(SyncContext);

export const SyncProvider = ({ children }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const [isAutoSync, setIsAutoSync] = useState(false);

  return (
    <SyncContext.Provider value={{ isSyncing, setIsSyncing, isAutoSync, setIsAutoSync }}>
      {children}
    </SyncContext.Provider>
  );
};