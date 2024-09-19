
import { SyncContext } from '../Contexts/SyncContext';
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';


const SyncSettings = () => {
    const { syncOption, setSyncOption } = useContext(SyncContext);

    // Define the synchronization options
    const options = [
        { label: 'Automatic Synchronization', value: 'automatic' },
        { label: 'Manual Synchronization (Button)', value: 'manual' },
        { label: 'Synchronization with Timer', value: 'timer' },
    ];

    // Handler for selecting an option
    const handleSelect = (value) => {
        setSyncOption(value);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Synchronization Settings</Text>
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={styles.optionContainer}
                    onPress={() => handleSelect(option.value)}
                >
                    <View style={styles.radioCircle}>
                        {syncOption === option.value && <View style={styles.selectedRb} />}
                    </View>
                    <Text
                        style={[
                            styles.optionLabel,
                            syncOption === option.value && styles.selectedOptionLabel,
                        ]}
                    >
                        {option.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const RADIO_SIZE = 20;
const SELECTED_RADIO_SIZE = 10;

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    radioCircle: {
        height: RADIO_SIZE,
        width: RADIO_SIZE,
        borderRadius: RADIO_SIZE / 2,
        borderWidth: 2,
        borderColor: '#2196F3',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedRb: {
        width: SELECTED_RADIO_SIZE,
        height: SELECTED_RADIO_SIZE,
        borderRadius: SELECTED_RADIO_SIZE / 2,
        backgroundColor: '#2196F3',
    },
    optionLabel: {
        marginLeft: 10,
        fontSize: 16,
        color: 'gray',
    },
    selectedOptionLabel: {
        color: '#2196F3',
        fontWeight: 'bold',
    },
});

export default SyncSettings;
