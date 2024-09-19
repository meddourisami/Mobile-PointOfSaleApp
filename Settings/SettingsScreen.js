import {Button, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSync } from '../SyncContext';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from "react-i18next";
import ManualSyncButton from "./ManualSyncButton";
import SyncSettings from "./SyncSettings";

const SettingsScreen = () => {
  const { isAutoSync, setIsAutoSync } = useSync(); 
  const [syncMode, setSyncMode] = useState(null);
  const { t, i18n } = useTranslation();
  const [isFrench, setIsFrench] = useState(i18n.language === 'fr');
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

  const toggleAutoSync = () => {
    setIsAutoSync((previousState) => !previousState);
  };

  const currentTime = new Date();
  const syncTimes = {
    midday: new Date().setHours(12, 34, 0, 0),
    midnight: new Date().setHours(0, 0, 0, 0),
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
        <Text>Automatic Synchronization</Text>
        <Switch value={!isAutoSync} onValueChange={toggleAutoSync} />
      </View>

      {!isAutoSync && (
        <View style={styles.settingItem}>
          <Text>Select Sync Time</Text>
          <Picker
          selectedValue={syncMode}
          onValueChange={(itemValue) => setSyncMode(itemValue)}
          style={{ height: 50, width: 200 }}
          >
            <Picker.Item label="Midday" value={syncTimes.midday} />
            <Picker.Item label="Midnight" value={syncTimes.midnight} />
          </Picker>
        </View>
      )}
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