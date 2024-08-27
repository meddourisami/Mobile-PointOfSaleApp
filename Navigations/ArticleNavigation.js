import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ArticleScreen from '../Screens/article/ArticleScreen';
import AddArticleScreen from '../Screens/article/AddArticleScreen';
import Cart from '../Screens/Cart/Cart';
import ArticleDetails from '../Screens/article/ArticleDetails';

const Stack = createNativeStackNavigator();

const ArticleNavigation = () => {
  return (
        <Stack.Navigator  screenOptions={{headerShown : false}}>
          <Stack.Screen name="ArticleScreen"  component={ArticleScreen} />
          <Stack.Screen name="AddArticleScreen" component={AddArticleScreen} />
          <Stack.Screen name="ArticleDetails" component={ArticleDetails}
          <Stack.Screen name="" component={Cart} />
        </Stack.Navigator>
    );
}

export default ArticleNavigation;

const styles = StyleSheet.create({})