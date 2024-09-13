import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused, useRoute } from '@react-navigation/native'
import { useSQLiteContext } from 'expo-sqlite';

const LivraisonDetails = () => {
    const route = useRoute();
    const db = useSQLiteContext();
    const isFocused = useIsFocused();
    const  { delivery_name } = route.params;
    const [ deliveryItems, setDeliveryItems ] = useState([]);
    const [ deliveryTaxes, setDeliveryTaxes ] = useState([]);

    const getdeliveryDetails = async() => {
        try{
            const delivery_items = await db.getAllAsync('SELECT * FROM Delivery_Note_Item WHERE parent=?', [delivery_name]);
            setDeliveryItems(delivery_items);
            console.log(delivery_items);
            const delivery_Taxes = await db.getFirstAsync('SELECT * FROM Sales_Taxes_and_Charges WHERE parent=?', [delivery_name]);
            setDeliveryTaxes(delivery_Taxes);
            console.log(delivery_Taxes);
        }catch(e){
            console.log("Error getting delivery Details",e);
        }
    };

    useEffect(()=> {
        if(isFocused) {
            const initialize = async() => {
              await getdeliveryDetails();
            }
            initialize();
        }
    },[isFocused]);


  return (
    <View style={styles.container}>
  {deliveryItems && deliveryTaxes && (
    <View>
    {deliveryItems && deliveryItems.length > 0 ? (
        <View>
          <Text style={styles.sectionTitle}>Items:</Text>
          <View style={styles.itemsContainer}>
            {deliveryItems.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <Text style={styles.itemCode}>{item.item_code}</Text>
                <Text style={styles.itemDetail}>Qty: {item.qty}</Text>
                <Text style={styles.itemDetail}>Rate: {item.rate} DA</Text>
                <Text style={styles.itemDetail}>Amount: {item.amount} DA</Text>
                <Text style={styles.itemDetail}>Warehouse: {item.warehouse}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <Text>No items available</Text>
      )}
      <Text style={styles.sectionTitle}>Taxes:</Text>
      <View style={styles.taxesContainer}>
          <View style={styles.taxCard}>
            <Text style={styles.taxDetail}>Tax Applied: <Text style={styles.taxDescription}>{deliveryTaxes.description}</Text></Text>
            <Text style={styles.taxDetail}>Rate: {deliveryTaxes.rate}%</Text>
            <Text style={styles.taxDetail}>Amount: {deliveryTaxes.tax_amount} DA</Text>
          </View>
        
      </View>
    </View>
  )}
</View>
  )
}

export default LivraisonDetails

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f7f7f7',
    flex:1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#444',
  },
  itemsContainer: {
    marginBottom: 24,
  },
  itemCard: {
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  itemCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  itemName: {
    fontSize: 16,
    marginBottom: 4,
    color: '#666',
  },
  itemDescription: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  itemDetail: {
    fontSize: 14,
    color: '#333',
  },
  taxesContainer: {
    marginTop: 16,
  },
  taxCard: {
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  taxDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  taxDetail: {
    fontSize: 14,
    color: '#333',
  },
})