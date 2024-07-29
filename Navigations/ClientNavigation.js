import { StyleSheet, Text, View } from 'react-native'
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientScreen from '../Screens/ClientScreen';
import AddClientScreen from '../Screens/AddClientScreen';
import EditClientScreen from '../Screens/EditClientScreen';
import ItemGroupScreen from '../Screens/ItemGroupScreen';
import FilteredItemsScreen from '../Screens/FilteredItemsScreen';


const Stack = createNativeStackNavigator();

const ClientNavigation = () => {
    return (
        <Stack.Navigator  screenOptions={{headerShown : false}}>
          <Stack.Screen name="ClientScreen"  component={ClientScreen} />
          <Stack.Screen name="AddClientScreen" component={AddClientScreen} />
          <Stack.Screen name="EditClientScreen"  component={EditClientScreen} />
          <Stack.Screen name="ItemGroupScreen" component={ItemGroupScreen} />
          <Stack.Screen name="FilteredItemsScreen" component={FilteredItemsScreen} />
        </Stack.Navigator>
    );
}

export default ClientNavigation;

const styles = StyleSheet.create({})