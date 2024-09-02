import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import React, { useState } from 'react';
import { useSync } from '../SyncContext';

const SettingsScreen = () => {
  const { isAutoSync, setIsAutoSync } = useSync();

  const toggleAutoSync = () => {
    setIsAutoSync(previousState => !previousState);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.settingItem}>
        <Text>Automatic Synchronization</Text>
          <Switch
            value={isAutoSync}
            onValueChange={toggleAutoSync}
          />
          {/* {!isAutoSync ? (
            <Picker
              onValueChange={(itemValue) =>
              setSyncMode(itemValue)
            }>
              <Picker.Item label="Every two hours" value="two hours" />
              <Picker.Item label="At the end of the day" value="At the end of the day" /> //TODO to implement real timing settings
            </Picker>
          ) : (
            <>

            </>
          )}; */}
      </View>
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