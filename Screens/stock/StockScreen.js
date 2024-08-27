import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite';
import { useIsFocused } from '@react-navigation/native';
import * as CryptoJS from 'crypto-js';
import { AntDesign } from '@expo/vector-icons';

const StockScreen = ({navigation}) => {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();

  const Content =  () => {
    const [items, setItems]= useState([]);

    const getItems = async () => {
        try{
            const allArticles = await db.getAllAsync(`SELECT * FROM Item;`);
            setItems(allArticles);
        }catch(e){
            console.log("error getting items from database", e);
        }
    };

    useEffect(() => {
        if(isFocused){
            getItems();
        };
    }, [isFocused]);

    return(
        <View>
            <FlatList
                data={items}
                keyExtractor={(item) => item.name}
                renderItem={({item}) => {
                    const defaultImage = "https://t3.ftcdn.net/jpg/04/84/88/76/360_F_484887682_Mx57wpHG4lKrPAG0y7Q8Q7bJ952J3TTO.jpg";
                    const imageUrl = item.image ? item.image : defaultImage;
                    return(
                        <TouchableOpacity style={{backgroundColor:'#FFF', margin:10}}>
                            <Text>Item Name: {item.item_name}</Text>
                            <Text>Item Price: {item.standard_rate}</Text>
                            <Text>Quantity in Stock {item.bal_qty}</Text>
                            <Text>Value of all items in the stock {item.bal_val} DA</Text>
                            <Image
                                source={{ uri: imageUrl }} 
                                style={{ width: 50, height: 50, borderRadius: 10, marginRight: 10,  }} 
                            />
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    )    
  };


    return (
        <View>
            <Text>
                Items list per warehouse
            </Text>
            <Content/>
        </View>
    );
}

export default StockScreen;

const styles = StyleSheet.create({
  container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    header: {
        fontSize: 24,
    },
    iconAdd: {
        position: 'absolute',
        bottom: 30,
        right: 30,
    },
    items: {
        backgroundColor: '#fff',
    },
})