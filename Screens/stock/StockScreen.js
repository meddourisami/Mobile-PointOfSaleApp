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

    return (
        <View style={styles.ItemContainer}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => {
                    const defaultImage = "https://t3.ftcdn.net/jpg/04/84/88/76/360_F_484887682_Mx57wpHG4lKrPAG0y7Q8Q7bJ952J3TTO.jpg";
                    const imageUrl = item.image ? item.image : defaultImage;
                    return (
                        <TouchableOpacity style={styles.card}>
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.image}
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.itemName}>{item.item_name}</Text>
                                <Text style={styles.itemPrice}>Price: {item.standard_rate} DA</Text>
                                <Text style={styles.itemStock}>In Stock: {item.bal_qty}</Text>
                                <Text style={styles.itemValue}>Total Value: {item.bal_val} DA</Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
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

    ItemContainer: {
        backgroundColor: '#F5F5F5',
        padding: 10,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 15,
        marginVertical: 10,
        marginHorizontal: 5,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    image: {
        width: 75,
        height: 75,
        borderRadius: 10,
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    itemPrice: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    itemStock: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
    itemValue: {
        fontSize: 14,
        color: '#555',
        marginTop: 5,
    },
})