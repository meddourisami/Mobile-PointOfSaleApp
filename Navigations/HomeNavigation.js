import { StyleSheet, Text, View } from 'react-native'
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientScreen from '../Screens/ClientScreen';
import ArticleScreen from '../Screens/ArticleScreen';
import StockScreen from '../Screens/StockScreen';
import LivraisonScreen from '../Screens/LivraisonScreen';
import PaimentScreen from '../Screens/PaimentScreen';
import VenteScreen from '../Screens/VenteScreen';
import HomeScreen from '../Screens/HomeScreen';
import CommandeScreen from '../Screens/CommandeScreen';
import AddArticleScreen from '../Screens/AddArticleScreen';
import AddClientScreen from '../Screens/AddClientScreen';
import EditClientScreen from '../Screens/EditClientScreen';
import ItemGroupScreen from '../Screens/ItemGroupScreen';


const Stack = createNativeStackNavigator();

const HomeNavigation = () => {
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="ClientScreen" component={ClientScreen} />
            <Stack.Screen name="ArticleScreen" component={ArticleScreen} />
            <Stack.Screen name="StockScreen" component={StockScreen} />
            <Stack.Screen name="LivraisonScreen" component={LivraisonScreen} />
            <Stack.Screen name="PaimentScreen" component={PaimentScreen} />
            <Stack.Screen name="VenteScreen" component={VenteScreen} />
            <Stack.Screen name="CommandeScreen" component={CommandeScreen} />
            <Stack.Screen name="AddArticleScreen" component={AddArticleScreen} />
            <Stack.Screen name="AddClientScreen" component={AddClientScreen} />
            <Stack.Screen name="EditClientScreen"  component={EditClientScreen} />
            <Stack.Screen name="ItemGroupScreen" component={ItemGroupScreen} />
        </Stack.Navigator>
    );
}

export default HomeNavigation;

const styles = StyleSheet.create({})