// SyncManager.js
import React, { useContext, useEffect, useRef } from 'react';
import { SyncContext } from '../Contexts/SyncContext';

const SyncManager = () => {
    const { syncOption } = useContext(SyncContext);
    const timerRef = useRef(null);

    useEffect(() => {
        // Cleanup any existing timer when syncOption changes
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (syncOption === 'automatic') {
            // Implement automatic synchronization logic
            // For example, synchronize whenever certain events occur
            console.log('Automatic synchronization enabled.');
            performSync()
            // Add your automatic sync logic here
        } else if (syncOption === 'timer') {
            // Set up a timer for synchronization
            console.log('Timer-based synchronization enabled.');
            timerRef.current = setInterval(() => {
                performSync();
            }, 5000); // Sync every 60 seconds
        } else if (syncOption === 'manual') {
            console.log('Manual synchronization enabled.');
            performSync()
            // Manual sync will be triggered by a button elsewhere
        }

        // Cleanup on unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [syncOption]);

    const performSync = () => {
        // Your synchronization logic here
        console.log('Performing synchronization...');
        // Example: Fetch data from API and update state
    };

    return null; // This component doesn't render anything
};

export default SyncManager;
