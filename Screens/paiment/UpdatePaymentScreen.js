import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const UpdatePaymentScreen = () => {
    const isFocused = useIsFocused();
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const route = useRoute();
    const Payment = route.params;
    const [paymentEntry, setPaymentEntry] = useState(null);
    const [paymentReference, setPaymentReference] = useState(null);

    const [paidAmount, setPaidAmount] = useState(null);
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [invoiceDate, setInvoiceDate] = useState(new Date());
    const [show, setShow] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || invoiceDate;
        setShow(false);
        setInvoiceDate(currentDate); 
    };

    const showDatepicker = () => {
        setShow(true); 
    };

    const getPaymentEntry = async () => {
        try{
            const paiment = await db.getFirstAsync(`SELECT * FROM Payment_Entry WHERE name = ?`,[Payment.Payment]);
            setPaymentEntry(paiment);
            const paimentReference = await db.getFirstAsync(`SELECT * FROM Payment_Reference_Entry WHERE parent= ?`,[Payment.Payment]);
            setPaymentReference(paimentReference);
        }catch(e){
            console.log("Error getting payment entry",e)
        }
    };

    const updatePayment = async () => {
        try{
            await db.runAsync(`UPDATE Payment_Entry SET 
                posting_date= ?, mode_of_payment= ?, paid_to_account_type= ?, paid_amount= ?, base_paid_amount= ?,
                received_amount= ?, base_received_amount= ?, total_allocated_amount= ?, base_total_allocated_amount= ? WHERE name= ?`,
                [invoiceDate.toISOString().split('T')[0], paymentMode, paymentMode, paidAmount, paidAmount, paidAmount, paidAmount, paidAmount, paidAmount, Payment.Payment] );
            await db.runAsync(`DELETE FROM payment_entry_logs WHERE name=?`, [Payment.Payment]);
        }catch(e){
            console.log("Error updating payment entry",e);
        }
    };

    const handleUpdate = async () => {
        await updatePayment();
        Alert.alert("Payment updated successfully");
        navigation.goBack();
    }

    useEffect(() => {
        if(isFocused){
            getPaymentEntry();
        }
    }, [isFocused]);

  return (
    <View style={{flex: 1, padding: 20, backgroundColor: '#f5f5f5'}}>
        {paymentEntry && paymentReference ? (
            <>
                <ScrollView style={{flex:1}} >
                    <View>
                        <TouchableOpacity 
                        style={{ borderRadius: 10,
                        backgroundColor: '#FFF',
                        marginVertical: 10,
                        padding: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 5, }}
                        onPress={showDatepicker}
                        >
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                                Select Invoice Date: {invoiceDate.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>
                        {show && (
                            <DateTimePicker
                            testID="dateTimePicker"
                            value={invoiceDate}
                            mode="date"
                            display="default"
                            onChange={onChange}
                            />
                        )}
                    </View>
                    <TouchableOpacity style={{
                        borderRadius: 10,
                        backgroundColor: '#FFF',
                        marginVertical: 10,
                        padding: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 5,}}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Customer: {paymentEntry.party}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{borderRadius: 10, backgroundColor:"#FFF",  margin: 5, padding:20, justifyContent:'center'}}>
                        <Text style={{ fontSize: 14, color: '#555' }}>Amount To Pay: {paymentReference.total_amount} DA</Text>
                        <TextInput
                        style={{
                        padding: 15,
                        backgroundColor: '#f0f0f0',
                        borderRadius: 10,
                        marginBottom: 15,
                        fontSize: 16,
                        borderColor: '#ccc',
                        borderWidth: 1,
                        }}
                        placeholder={`${paymentReference.total_amount} DA`}
                        keyboardType='numeric'
                        value={paidAmount}
                        onChangeText={text => setPaidAmount(Number(text))}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ borderRadius: 10, backgroundColor:"#FFF", margin: 5, padding:20, justifyContent:'center'}}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Payment Method: </Text>
                        <View style={{ borderWidth: 1, borderRadius: 5, borderColor: '#ccc' }}>
                            <Picker
                            selectedValue={paymentMode}
                            onValueChange={(itemValue) => setPaymentMode(itemValue)}
                            style={{ height: 50, width: '100%' }}
                            >
                                <Picker.Item label="Cash" value="Cash" />
                                <Picker.Item label="Cart Card" value="Cart Card" />
                            </Picker>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
                <TouchableOpacity  style={{
                    height: 50,
                    marginVertical: 20,
                    width: '100%',
                    justifyContent: 'center',
                    backgroundColor: '#E59135',
                    alignItems: 'center',
                    borderRadius: 15,
                    }}
                >
                    <Text style={{ fontSize: 18, color: '#FFF', textAlign: 'center'}} onPress={handleUpdate}>Update Payment Details</Text>
                </TouchableOpacity>
            </>
        ) : (
            <Text>Loading...</Text>
        )}
    </View>
  )
}

export default UpdatePaymentScreen;

const styles = StyleSheet.create({})