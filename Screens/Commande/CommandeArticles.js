import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';

const CommandeArticles = ({navigation}) => {
    const route = useRoute();
    const { CommandeName } = route.params;
    const db = useSQLiteContext();
    const isFocused = useIsFocused();

    const Content = () => {
        const [salesOrderItems, setSalesOrderItems] = useState([]);

        const getSalesOrderItems = async () => {
            try{
                const items = await db.getAllAsync(
                    `SELECT * FROM Sales_Order_Item WHERE parent = ?;`,
                    [CommandeName]
                );
                setSalesOrderItems(items);
            }catch(e){
                console.log("Error getting sales order items from database",e);
            }
        };

        useEffect(() => {
            if(isFocused){
                const initialize = async () => {
                    getSalesOrderItems();
                };
            initialize();
            };
        },[isFocused]);

        // useEffect(() => {
        //     if(salesOrderItems){
        //         getSalesOrderItems();
        //     };
        // },[salesOrderItems]);

        return (
            <View style={styles.contentContainer}>
              {salesOrderItems.length === 0 ? (
                <ActivityIndicator size="large" color="#284979" style={styles.loadingIndicator} />
              ) : (
                <FlatList
                  data={salesOrderItems}
                  keyExtractor={(item) => item.name}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.itemCard}>
                      <View style={styles.itemInfoContainer}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemLabel}>Item Name: <Text style={styles.itemText}>{item.item_name}</Text></Text>
                          <Text style={styles.itemLabel}>Item Price: <Text style={styles.itemPrice}>{item.rate} DA</Text></Text>
                          <Text style={styles.itemLabel}>Quantity: <Text style={styles.itemText}>{item.qty}</Text></Text>
                          <Text style={styles.itemLabel}>Total Price: <Text style={styles.itemTotal}>{item.amount} DA</Text></Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          );
        };
      
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Liste des articles Commandées</Text>
            <Content />
          </View>
        );
      };
      
      export default CommandeArticles;
      
      const styles = StyleSheet.create({
        container: {
          flex: 1,
          padding: 16,
          backgroundColor: '#f0f4f7', // Light background color for overall layout
        },
        title: {
          fontSize: 24,
        //   fontWeight: 'bold',
          color: '#333', // Darker text color for title
          marginBottom: 16,
        },
       
        loadingIndicator: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        itemCard: {
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 15,
          marginVertical: 8,
          marginHorizontal: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3, 
        },
        itemInfoContainer: {
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
        itemName: {
          fontWeight: 'bold',
          fontSize: 16,
          color: '#222', 
          marginBottom: 8,
        },
        itemDetails: {
          flexDirection: 'column',
          justifyContent: 'flex-start',
          marginBottom: 10,
        },
        itemLabel: {
        //   fontWeight: 'bold',
          fontSize: 14,
          color: '#666', 
          marginBottom: 2,
        },
        itemText: {
          fontSize: 14,
          color: '#222',
          marginBottom: 6,
        },
        itemPrice: {
          fontSize: 14,
        //   fontWeight: 'bold',
          color: '#DAA520',
          marginBottom: 6,
        },
        itemTotal: {
          fontSize: 14,
        //   fontWeight: 'bold',
          color: '#DAA520',
          marginBottom: 6,
        },
      });