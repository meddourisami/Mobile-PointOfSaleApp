import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused, useRoute } from '@react-navigation/native'
import { useSQLiteContext } from 'expo-sqlite';

const ArticleDetails = () => {
    const route= useRoute();
    const { article } = route.params;
    const db = useSQLiteContext();
    const isFocused = useIsFocused();

    const Content = () => {
        const [item, setItem] = useState([]);

        const getItem = async () => {
            try{
                const items = await db.getFirstAsync(
                    `SELECT * FROM Item WHERE name = ?;`,
                    [article]
                );
                setItem(items);
            }catch(e){
                console.log("Error item from database",e);
            }
        };

        useEffect(() => {
            if(isFocused){
                const initialize = async () => {
                    getItem();
                };
            initialize();
            };
        },[isFocused]);

        // useEffect(() => {
        //     if(salesOrderItems){
        //         getSalesOrderItems();
        //     };
        // },[salesOrderItems]);

        return(
            <View>
                {item ? (
                        <Text>No data yet.</Text>
                    ) : (     
                            <TouchableOpacity>
                                <View style={{marginBottom:10, marginStart:10}}>
                                    <Text style={{fontWeight:'bold'}}>{item.name}</Text>
                                    <View style={{flexDirection:'column', justifyContent:'space-between', marginBottom:10}}>
                                        <Image
                                           source={{uri: item.image}}
                                           style={{width:200, height:200}} 
                                           resizeMode="contain"
                                        />
                                        <Text>Item Name:{item.item_code}</Text>
                                        <Text style={{fontWeight:'semibold'}}>Item Price:{item.standard_rate}</Text>
                                        <Text>Quantity:{item.bal_qty}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                )}
            </View>
        );
    
    };
    return(
      <View>
        <Text style={{fontSize: 24}}>Détails de l'Article</Text>
        <Content />
      </View>
    )

}

export default ArticleDetails;

const styles = StyleSheet.create({})