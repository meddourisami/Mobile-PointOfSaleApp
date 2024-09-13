import { StyleSheet, Text, View } from 'react-native'
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
            setDeliveryItems(deliveryItems);
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
    <View>
      <Text>LivraisonDetails</Text>
      {!deliveryItems && !deliveryTaxes && (
        <View>
            <Text>Items:</Text>
            
        </View>
      )}
    </View>
  )
}

export default LivraisonDetails

const styles = StyleSheet.create({})