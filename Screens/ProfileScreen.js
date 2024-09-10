import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
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
        <ActivityIndicator size="large" color="#284979" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userProfile && userName ? (
        <View style={styles.profileContainer}>
          <View style={styles.item}>
            <Text style={styles.label}>Name: <Text style={styles.value}>{userName}</Text></Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Email: <Text style={styles.value}>{userName}</Text></Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Company: <Text style={styles.value}>{userProfile.company}</Text></Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Warehouse: <Text style={styles.value}>{userProfile.warehouse}</Text></Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Country: <Text style={styles.value}>{userProfile.country}</Text></Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>Currency: <Text style={styles.value}>{userProfile.currency}</Text></Text>
          </View>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      ) : (
        <View>
          <Text>Failed to load user data</Text>
        </View>
      )}
    </View>
  );
}

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    width: '95%',
    marginTop: 30,
    marginBottom: 30,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: '400',
    color: '#555',
  },
  errorText: {
    color: 'red',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
})