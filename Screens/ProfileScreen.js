import { ActivityIndicator, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSync } from '../SyncContext';

const ProfileScreen = ({handleLogout}) => {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const [userProfile, setUserProfile] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userWarehouse, setUserWarehouse] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useSync();

  const getProfileInfo = async () => {
    try {
      const user = await db.getFirstAsync('SELECT * FROM User_Profile WHERE id=1');
      setUserProfile(user);
      const userName = await AsyncStorage.getItem('user');
      setUserName(userName);
    }catch (err) {
      console.log(err, "Error getting profile info");
    };
  }

  useEffect(()=>{
      const initialize = async () =>{
        await getProfileInfo();
        setLoading(false);
      }
      if(isFocused){
      initialize();
    }
  },[isFocused]);



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#284979" style={{flex:1, justifyContent:'center', alignItems:'center'}}/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userProfile && userName ? (
        <View style={styles.profileContainer}>
          <Text style={styles.profileHeader}>User Profile</Text>
          <View style={styles.item}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{userName}</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{userProfile.email}</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Company:</Text>
            <Text style={styles.value}>{userProfile.company}</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Warehouse:</Text>
            <Text style={styles.value}>{userProfile.warehouse}</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Country:</Text>
            <Text style={styles.value}>{userProfile.country}</Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Currency:</Text>
            <Text style={styles.value}>{userProfile.currency}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load user data</Text>
        </View>
      )}
    </View>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  profileHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  item: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  value: {
    fontSize: 16,
    fontWeight: '400',
    color: '#111',
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
})