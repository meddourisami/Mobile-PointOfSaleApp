import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CommandeArticles from '../Screens/Commande/CommandeArticles';
import CommandeScreen from '../Screens/Commande/CommandeScreen';

const CommandeNavigation = () => {
    
    const Stack = createNativeStackNavigator();
    return (
        <Stack>
            <Stack.Screen name="CommandeScreen" component={CommandeScreen} />
            <Stack.Screen name="CommandeArticles" component={CommandeArticles} />
        </Stack>
    );
}

export default CommandeNavigation

const styles = StyleSheet.create({})