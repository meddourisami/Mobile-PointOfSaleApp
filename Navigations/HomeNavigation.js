import { StyleSheet, Text, View } from 'react-native'
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientScreen from '../Screens/client/ClientScreen';
import ArticleScreen from '../Screens/article/ArticleScreen';
import StockScreen from '../Screens/stock/StockScreen';
import LivraisonScreen from '../Screens/Livraison/LivraisonScreen';
import PaimentScreen from '../Screens/paiment/PaimentScreen';
import VenteScreen from '../Screens/vente/VenteScreen';
import HomeScreen from '../Screens/HomeScreen';
import CommandeScreen from '../Screens/Commande/CommandeScreen';
import AddArticleScreen from '../Screens/article/AddArticleScreen';
import AddClientScreen from '../Screens/client/AddClientScreen';
import EditClientScreen from '../Screens/client/EditClientScreen';
import ItemGroupScreen from '../Screens/ItemGroupScreen';
import Cart from '../Screens/Cart/Cart';
import Quotation from '../Screens/Quotation/Quotation';
import CommandeArticles from '../Screens/Commande/CommandeArticles';
import AddStockScreen from '../Screens/stock/AddStockScreen';
import SalesInvoiceScreen from '../Screens/SalesInvoice/SalesInvoiceScreen';
import PaymentDetails from '../Screens/paiment/PaymentDetails';
import Sync from '../Sync/Sync';
import ArticleDetails from '../Screens/article/ArticleDetails';


const Stack = createNativeStackNavigator();

const HomeNavigation = () => {
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="ArticleScreen" component={ArticleScreen} />
            <Stack.Screen name="ClientScreen" component={ClientScreen} />
            <Stack.Screen name="StockScreen" component={StockScreen} />
            <Stack.Screen name="LivraisonScreen" component={LivraisonScreen} />
            <Stack.Screen name="PaimentScreen" component={PaimentScreen} />
            <Stack.Screen name="VenteScreen" component={VenteScreen} />
            <Stack.Screen name="CommandeScreen" component={CommandeScreen} />
            <Stack.Screen name="AddArticleScreen" component={AddArticleScreen} />
            <Stack.Screen name="AddClientScreen" component={AddClientScreen} />
            <Stack.Screen name="EditClientScreen"  component={EditClientScreen} />
            <Stack.Screen name="ItemGroupScreen" component={ItemGroupScreen} />
            <Stack.Screen name="Cart" component={Cart} />
            <Stack.Screen name="Quotation" component={Quotation} />
            <Stack.Screen name="CommandeArticles" component={CommandeArticles} />
            <Stack.Screen name="AddStockScreen" component={AddStockScreen} />
            <Stack.Screen name="SalesInvoiceScreen" component={SalesInvoiceScreen} />
            <Stack.Screen name="PaymentDetails" component={PaymentDetails} />
            <Stack.Screen name="Sync" component={Sync} />
            <Stack.Screen name="ArticleDetails" component={ArticleDetails} />
        </Stack.Navigator>
    );
}

export default HomeNavigation;

const styles = StyleSheet.create({})