import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';

const CommandeArticles = ({navigation}) => {
    const route = useRoute();
    const { commandeName } = route.params;
    const db = useSQLiteContext();
    const isFocused = useIsFocused();

    const Content = () => {
        const [salesOrderItems, setSalesOrderItems] = useState([]);

        const getSalesOrderItems = async () => {
            try{
                const items = await db.getAllAsync(`SELECT * FROM Sales_Order_Item WHERE parent= ?`, [commandeName]);
                setSalesOrderItems(items);
            }catch(e){
                console.log("Error getting sales order items from database",e)
            }
        };

        useEffect(() => {
            if(isFocused){
                const initialize = async() => {
                    getSalesOrderItems();
                };
            initialize();
            };
        },[isFocused])

        return(
            <View>
                {salesOrderItems.length=== 0 ? (
                        <Text>No data yet.</Text>
                    ) : (
                    <FlatList
                        data ={salesOrderItems}
                        keyExtractor={(item) => item.name}
                        renderItem={({item}) => (
                            <TouchableOpacity style={{backgroundColor:'#fff' , marginBottom:10, borderRadius:15, margin:5}}>
                                <View style={{marginBottom:10, marginStart:10}}>
                                    <Text style={{fontWeight:'bold'}}>{item.name}</Text>
                                    <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
                                        <Text>Item Name:{item.item_name}</Text>
                                        <Text style={{fontWeight:'semibold'}}>Price:{item.rate}</Text>
                                        <Text>Quantity:{item.qty}</Text>
                                        <Text>Total Price:{item.amount}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        )
    };
    

  return (
    <View>
      <Text>Liste des articles Commandées</Text>
      <Content />
    </View>
  )
};

export default CommandeArticles;

const styles = StyleSheet.create({})