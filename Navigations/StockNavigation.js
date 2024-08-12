import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import StockScreen from '../Screens/stock/StockScreen';
import AddStockScreen from '../Screens/stock/AddStockScreen';

const StockNavigation = () => {
    Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator>
        <Stack.Screen name="StockScreen" component={StockScreen}/>
        <Stack.Screen name="AddStockScreen" component={AddStockScreen}/>
    </Stack.Navigator>
  )
}

export default StockNavigation

const styles = StyleSheet.create({})