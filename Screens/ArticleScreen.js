import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ArticleScreen = ({navigation}) => {
  
  return (
    <View style={{flex:1, justifyContent:"center" , alignItems:"center"}}>
      <Text>ArticleScreen</Text>
      <Button title="add article">
      </Button>
    </View>
  )
}

export default ArticleScreen;

const styles = StyleSheet.create({})