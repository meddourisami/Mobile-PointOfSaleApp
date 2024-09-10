import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSync } from '../SyncContext';
import { Picker } from '@react-native-picker/picker';

const SettingsScreen = () => {
  const { isAutoSync, setIsAutoSync } = useSync(); 
  const [syncMode, setSyncMode] = useState(null); 

  const toggleAutoSync = () => {
    setIsAutoSync((previousState) => !previousState);
  };

  const currentTime = new Date();
  const syncTimes = {
    midday: new Date().setHours(12, 0, 0, 0),
    midnight: new Date().setHours(0, 0, 0, 0),
  };

  useEffect(() => {
    if (!isAutoSync) {
      const timeDifference = syncTimes[syncMode] - currentTime;

      if (timeDifference > 0) {
        const timeoutId = setTimeout(() => {
          setIsAutoSync(true);
        }, timeDifference);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [isAutoSync]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.settingItem}>
        <Text>Automatic Synchronization</Text>
        <Switch value={!isAutoSync} onValueChange={toggleAutoSync} />
      </View>

      {!isAutoSync && (
        <View style={styles.settingItem}>
          <Text>Select Sync Time</Text>
          <Picker
            selectedValue={syncMode}
            onValueChange={(itemValue) => setSyncMode(itemValue)}
          >
            <Picker.Item label="Midday" value="midday" />
            <Picker.Item label="Midnight" value="midnight" />
          </Picker>
        </View>
      )}
    </View>
  );
}

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
})