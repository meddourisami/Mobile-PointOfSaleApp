import {Button, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSync } from '../SyncContext';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from "react-i18next";
<<<<<<< HEAD
import  DateTimePicker  from '@react-native-community/datetimepicker';
=======
import ManualSyncButton from "./ManualSyncButton";
import SyncSettings from "./SyncSettings";
>>>>>>> context-async

const SettingsScreen = () => {
  const { isAutoSync, setIsAutoSync } = useSync(); 
  const [syncMode, setSyncMode] = useState(null);
  const { t, i18n } = useTranslation();
  const [isFrench, setIsFrench] = useState(i18n.language === 'fr');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  //const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  /*const switchLanguage = async () => {
    const newLanguage = i18n.language === 'en' ? 'fr' : 'en';
    await AsyncStorage.setItem('language', newLanguage);
    i18n.changeLanguage(newLanguage);
  };*/

  // Handle language selection
 /* const changeLanguage = async (languageCode) => {
    setSelectedLanguage(languageCode);
    await AsyncStorage.setItem('language', languageCode);
    i18n.changeLanguage(languageCode);
  };*/



  /*useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage);
      }
    };
    loadLanguage();
  }, []);*/

  // Handle language toggle
  const toggleSwitch = async () => {
    const newLanguage = isFrench ? 'en' : 'fr';  // Toggle between English and French
    setIsFrench(!isFrench);                     // Update the switch state
    await AsyncStorage.setItem('language', newLanguage);  // Save the selection
    i18n.changeLanguage(newLanguage);            // Change the language globally
  };

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        setIsFrench(savedLanguage === 'fr');
        i18n.changeLanguage(savedLanguage);
      }
    };
    loadLanguage();
  }, []);

  // const onTimeChange = (event, selectedDate) => {
  //   const currentDate = selectedDate || selectedTime;
  //   setShowTimePicker(false);
  //   setSelectedTime(currentDate);
  // };

  const toggleAutoSync = () => {
    setIsAutoSync((previousState) => !previousState);
  };

  const currentTime = new Date();
  // const syncTimes = {
  //   midday: new Date().setHours(12, 34, 0, 0),
  //   midnight: new Date().setHours(0, 0, 0, 0),
  // };

  const onTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const newTime = new Date(selectedDate);
      newTime.setSeconds(0, 0);
      setTime(newTime);
      setSyncMode(newTime); 
    }
    // setShowTimePicker(false);
  };

  useEffect(() => {
    if (!isAutoSync && syncMode) {
      const timeDifference = syncMode - currentTime;
      console.log("difference",timeDifference.toString());
      console.log("time",syncMode);

      if (timeDifference > 0) {
        const timeoutId = setTimeout(() => {
          setIsAutoSync(true);
        }, timeDifference);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [isAutoSync, syncMode]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.settingItem}>
        <Text>Switch Sync Mode To Manual</Text>
        <Switch value={!isAutoSync} onValueChange={toggleAutoSync} />
      </View>

      {!isAutoSync && (
        <View style={styles.settingItem}>
          <Text>Select Sync Time</Text>
            <View style={{flexDirection:'column'}}>
            <Button title="Select Sync Time" onPress={() => setShowTimePicker(true)} />
              {showTimePicker && (
                <DateTimePicker
                value={new Date(time)}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onTimeChange}
                />
              )}
              <Text>Next sync at:{new Date(syncMode).toLocaleTimeString()}</Text>
            </View>
        </View>
      )}

      <View style={styles.settingItem}>
        <Text>Select Sync Mode</Text>
        <Picker
        selectedValue={syncMode}
        style={{ height: 50, width: 150 }}
        onValueChange={(itemValue) => setSyncMode(itemValue)}
      >
        <Picker.Item label="Automatic" value="automatic" />
        <Picker.Item label="Manual" value="manual" />
        <Picker.Item label="Semi-Automatic" value="semi-automatic" />
      </Picker>

      {syncMode === 'semi-automatic' && (
        <View>
          <Text>Select Sync Time</Text>
          <View style={{ flexDirection: 'row' }}>
            <Button title="Select Sync Time" onPress={() => setShowTimePicker(true)} />
            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={onTimeChange}
              />
            )}
            <Text>Next sync at: {new Date(selectedTime).toLocaleTimeString()}</Text>
          </View>
        </View>
      )}
      </View>
     {/* <View>
        <Text>{t('switchLanguage')}</Text>
        <Button title={t('switchLanguage')} onPress={switchLanguage} />
      </View>*/}
      {/*<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>{t('switchLanguage')}</Text>

        <TouchableOpacity
            onPress={() => changeLanguage('en')}
            style={{
              padding: 10,
              backgroundColor: selectedLanguage === 'en' ? 'blue' : 'gray',
              marginBottom: 10,
              borderRadius: 5,
            }}
        >
          <Text style={{ color: 'white' }}>English</Text>
        </TouchableOpacity>

        <TouchableOpacity
            onPress={() => changeLanguage('fr')}
            style={{
              padding: 10,
              backgroundColor: selectedLanguage === 'fr' ? 'blue' : 'gray',
              borderRadius: 5,
            }}
        >
          <Text style={{ color: 'white' }}>Français</Text>
        </TouchableOpacity>
      </View>*/}

    {/*  <View style={styles.settingItem}>
        <Text >
          {t('switchLanguage')} ({isFrench ? 'Français' : 'English'})
        </Text>

        <Switch
            onValueChange={toggleSwitch}
            value={isFrench}
        />
      </View>*/}
      <View style={styles.container}>
        <View style={styles.settingItem}>
          <Text >
            {t('switchLanguage')} ({isFrench ? 'Français' : 'English'})
          </Text>

          <Switch
              onValueChange={toggleSwitch}
              value={isFrench}
          />
        </View>
        <SyncSettings />
      </View>
      <View >
        <ManualSyncButton />
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