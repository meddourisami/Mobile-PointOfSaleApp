import { StyleSheet, Text, View } from 'react-native'
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClientScreen from '../Screens/client/ClientScreen';
import ArticleScreen from '../Screens/article/ArticleScreen';
import StockScreen from '../Screens/stock/StockScreen';
import LivraisonScreen from '../Screens/Livraison/LivraisonScreen';
import PaimentScreen from '../Screens/paiment/PaimentScreen';
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
import LivraisonStatus from '../Screens/Livraison/LivraisonStatus';
import UpdatePaymentScreen from '../Screens/paiment/UpdatePaymentScreen';
import LoginPage from '../LoginPage';
import LivraisonDetails from '../Screens/Livraison/LivraisonDetails';


const Stack = createNativeStackNavigator();

const HomeNavigation = () => {
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home Page' }}/>
            <Stack.Screen name="ArticleScreen" component={ArticleScreen} options={{ title: 'Items' }}/>
            <Stack.Screen name="ClientScreen" component={ClientScreen} options={{ title: 'Customers' }}/>
            <Stack.Screen name="StockScreen" component={StockScreen} options={{ title: 'Stock' }}/>
            <Stack.Screen name="LivraisonScreen" component={LivraisonScreen} options={{ title: 'Deliveries' }}/>
            <Stack.Screen name="PaimentScreen" component={PaimentScreen} options={{ title: 'Payments' }}/>
            <Stack.Screen name="CommandeScreen" component={CommandeScreen} options={{ title: 'Sale Orders' }}/>
            <Stack.Screen name="AddArticleScreen" component={AddArticleScreen} options={{ title: 'Add Item' }}/>
            <Stack.Screen name="AddClientScreen" component={AddClientScreen} options={{ title: 'Add Client' }}/>
            <Stack.Screen name="EditClientScreen"  component={EditClientScreen} options={{ title: 'Edit Client' }}/>
            <Stack.Screen name="ItemGroupScreen" component={ItemGroupScreen} options={{ title: 'Item Groups' }}/>
            <Stack.Screen name="Cart" component={Cart} options={{ title: 'Cart' }}/>
            <Stack.Screen name="Quotation" component={Quotation} options={{ title: 'Quotation' }}/>
            <Stack.Screen name="CommandeArticles" component={CommandeArticles} options={{ title: 'Sale Order Details' }}/>
            <Stack.Screen name="AddStockScreen" component={AddStockScreen} options={{ title: 'Add Stock' }}/>
            <Stack.Screen name="SalesInvoiceScreen" component={SalesInvoiceScreen} options={{ title: 'Proceed to Payment' }}/>
            <Stack.Screen name="PaymentDetails" component={PaymentDetails} options={{ title: 'Payment Details' }}/>
            <Stack.Screen name="Sync" component={Sync} options={{ title: 'Sync' }}/>
            <Stack.Screen name="ArticleDetails" component={ArticleDetails} options={{ title: 'Item Details' }}/>
            <Stack.Screen name="LivraisonStatus" component={LivraisonStatus} options={{ title: 'Delivery Status' }}/>
            <Stack.Screen name="UpdatePaymentScreen" component={UpdatePaymentScreen} options={{ title: 'Update Payments' }}/>
            <Stack.Screen name="LoginPage" component={LoginPage} options={{ title: 'Login Page' }}/>
            <Stack.Screen name="LivraisonDetails" component={LivraisonDetails} options={{ title: 'Delivery Details' }}/>
        </Stack.Navigator>
    );
}

export default HomeNavigation;

const styles = StyleSheet.create({})