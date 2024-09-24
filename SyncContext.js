import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect } from 'react';

export const SyncContext = createContext();

export const useSync = () => useContext(SyncContext);

export const SyncProvider = ({ children }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const [isAutoSync, setIsAutoSync] = useState(false);

  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        const reference = await AsyncStorage.getItem('reference');
        const verifCode = await AsyncStorage.getItem('verifCode');
        if (reference && verifCode) {
          const newToken = `token ${reference}:${verifCode}`;
          setToken(newToken);
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    fetchToken();
  }, []);

  return (
    <SyncContext.Provider value={{ isSyncing, setIsSyncing, isAutoSync, setIsAutoSync, token}}>
      {children}
    </SyncContext.Provider>
  );
};