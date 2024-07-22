import { StyleSheet, Text, View } from 'react-native'
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LivraisonScreen from '../Screens/LivraisonScreen';
import AddLivraisonScreen from '../Screens/AddLivraisonScreen';
import EditLivraisonScreen from '../Screens/EditLivraisonScreen';


const Stack = createNativeStackNavigator();

const LivraisonNavigation = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown : false}}>
          <Stack.Screen name="Livraison" component={LivraisonScreen} />
          <Stack.Screen name="AddClientScreen" component={AddLivraisonScreen} />
          <Stack.Screen name="EditClientScreen" component={EditLivraisonScreen} />
        </Stack.Navigator>
    );
}

export default LivraisonNavigation;

const styles = StyleSheet.create({})