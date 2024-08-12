import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CommandeArticles from '../Screens/Commande/CommandeArticles';
import CommandeScreen from '../Screens/Commande/CommandeScreen';
import SalesInvoiceScreen from '../Screens/SalesInvoice/SalesInvoiceScreen';

const CommandeNavigation = () => {
    
    const Stack = createNativeStackNavigator();
    return (
        <Stack>
            <Stack.Screen name="CommandeScreen" component={CommandeScreen} />
            <Stack.Screen name="CommandeArticles" component={CommandeArticles} />
            <Stack.Screen name="SalesInvoiceScreen" component={SalesInvoiceScreen} />
        </Stack>
    );
}

export default CommandeNavigation

const styles = StyleSheet.create({})