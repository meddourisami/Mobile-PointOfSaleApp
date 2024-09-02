import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';

const PaymentDetails = () => {
    const route = useRoute();
    const { Payment } = route.params;
    const db = useSQLiteContext();
    const isFocused = useIsFocused();

    const Content = () => {
        const [salesInvoice, setSalesInvoice] = useState(null);

        const getSalesInvoice = async () => {
            try{
                const sales_invoice = await db.getFirstAsync(
                    `SELECT * FROM Sales_Order WHERE name = ?;`,
                    [Payment]
                );
                setSalesInvoice(sales_invoice);
            }catch(e){
                console.log("Error getting sales invoice from database",e);
            }
        };

        useEffect(() => {
            if(isFocused){
                const initialize = async () => {
                    getSalesInvoice();
                };
            initialize();
            };
        },[isFocused]);

        return(
            <View>
            {!salesInvoice ? (
                    <Text>No Payment Details yet.</Text>
                ) : (
                        <TouchableOpacity style={{backgroundColor:'#fff' , marginBottom:10, borderRadius:15, margin:5}}>
                            <View style={{marginBottom:10, marginStart:10}}>
                                <Text style={{fontWeight:'bold'}}>{salesInvoice.name}</Text>
                                <View style={{flexDirection:'column', justifyContent:'space-between', marginBottom:10}}>
                                    <Text>Invoice Name:{salesInvoice.name}</Text>
                                    <Text style={{fontWeight:'semibold'}}>Total:{salesInvoice.grand_total}</Text>
                                    <Text>Quantity:{salesInvoice.total_qty}</Text>
                                    <Text>Customer Name:{salesInvoice.customer_name}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                )}
            </View>
        );
    };

  return (
    <View>
      <Text style={{fontSize:24}}>PaymentDetails</Text>
      <Content />
    </View>
  )
}

export default PaymentDetails

const styles = StyleSheet.create({})