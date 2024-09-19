import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SyncContext } from '../Contexts/SyncContext';

const ManualSyncButton = () => {
    const { syncOption } = useContext(SyncContext);

    const handleSync = () => {
        if (syncOption === 'manual') {
            // Implement the synchronization logic
            console.log('Manual synchronization triggered.');
            // Example: Fetch data from API and update state
        }
    };

    return (
        syncOption === 'manual' && (
            <TouchableOpacity style={styles.button} onPress={handleSync}>
                <Text style={styles.buttonText}>Sync Now</Text>
            </TouchableOpacity>
        )
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default ManualSyncButton;
