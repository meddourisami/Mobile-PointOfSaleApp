import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ArticleScreen from '../Screens/ArticleScreen';
import AddArticleScreen from '../Screens/AddArticleScreen';

const Stack = createNativeStackNavigator();

const ArticleNavigation = () => {
  return (
        <Stack.Navigator  screenOptions={{headerShown : false}}>
          <Stack.Screen name="ArticleScreen"  component={ArticleScreen} />
          <Stack.Screen name="AddArticleScreen" component={AddArticleScreen} />
        </Stack.Navigator>
    );
}

export default ArticleNavigation;

const styles = StyleSheet.create({})