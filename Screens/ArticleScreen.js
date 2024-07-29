import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused } from '@react-navigation/native';

const ArticleScreen = () => {
    const isFocused = useIsFocused();
    const [items, setItems] = useState([]);

    const Content = () => {
        const getItemsFromApi = async () =>{
            try{
                const response = await fetch("http://195.201.138.202:8006/api/resource/Item/?fields=["*"]",
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
                        },
                    });
                    const json = await response.json();
                    setItems(json.data);
                    return json.data;
            }catch(e){
                console.log("error getting items", e);
            }
        }

        useEffect(()=>{
            if(isFocused){
                getItemsFromApi();
            }
        }, [isFocused])
    };
  return (
    <View>
      <Text>ArticleScreen</Text>
    </View>
  )
}

export default ArticleScreen

const styles = StyleSheet.create({})