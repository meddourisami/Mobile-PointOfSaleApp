import { FlatList, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

const PaimentScreen = () => {
  const db = useSQLiteContext();
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const Content =  () => {
        const [payments , setPayments] = useState([]);
        const [salesInvoices , setSalesInvoices] = useState([]);

        const createSalesOrderLocalLogs = async () => {
          await db.runAsync(`CREATE TABLE IF NOT EXISTS sales_invoice_logs(
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  action TEXT,
                  name TEXT,
                  state TEXT,
                  data TEXT
              )`);
      };

      const saveToLocalLogs = async () => {

          const logs = await db.getAllAsync(`SELECT name FROM sales_invoice_logs;`);
          const names = logs.map(log => log.name);

          const Invoices = await db.getAllAsync(`SELECT * FROM Sales_Invoice;`);
          Invoices.map(async (invoice)=> {
              const invoiceData= {
                  ...invoice,
                  doctype: "Sales Invoice",
                  __islocal: 1,
                  __unsaved: 1,
              }
              const invoiceItems = await db.getAllAsync(`SELECT * FROM Sales_Invoice_Item WHERE parent =?`, [invoice.name]);
              const invoiceItemsData = [];
              const updatedItems= invoiceItems.map(item =>({
                ...item,
                __islocal: 1,
                __unsaved: 1,
                doctype: "Sales Invoice Item"
              }));

              const invoiceTaxes = await db.getFirstAsync(`SELECT * FROM Sales_Taxes_and_Charges WHERE parent=?`, [invoice.name]);
              const invoiceTaxesData = {
                  ...invoiceTaxes,
                  __islocal: 1,
                  __unsaved: 1,
                  doctype: "Sales Taxes and Charges"
              }

              const invoicePayment = await db.getFirstAsync(`SELECT * FROM Sales_Invoice_Payment WHERE parent=?`, [invoice.name]);
              const invoicePaymentData ={
                ...invoicePayment,
                __islocal: 1,
                doctype: "Sales Invoice Payment",
              }

              const data = {
                  ...invoiceData,
                  items: updatedItems,
                  taxes: [invoiceTaxesData],
                  payments: [invoicePaymentData]
              }
              //console.log(data);

              console.log(JSON.stringify(data));

              if (!names.includes(invoice.name)) {
                  await db.runAsync(
                      `INSERT INTO sales_invoice_logs (action, name, state, data) VALUES (?, ?, ?, ?)`,
                      ["INSERT", invoice.name, "Draft", JSON.stringify(data)]
                  );
              }
          });
      };

      const handleSubmit = () => {
          saveToLocalLogs();  
      };

      const syncDataWithServer = async () => {
          try {
              const logs = await db.getAllAsync(`SELECT name FROM sales_invoice_logs;`);
              await Promise.all(
                  logs.map(async (log) => {
                    const response = await fetch(
                      'http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
                      {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                              'Authorization': 'token 94c0faa6066a7c0:982654458dc9011'
                          },
                          body: JSON.stringify({
                              "doc": JSON.stringify(log.data),  
                              "action": "Save"
                          })
                      }
                  );
                      // const response = await fetch(
                      //     'http://195.201.138.202:8006/api/method/frappe.desk.form.save.savedocs',
                      //     {
                      //         method: 'POST',
                      //         headers: {
                      //             'Content-Type': 'application/json',
                      //             'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c'
                      //         },
                      //         body: JSON.stringify({
                      //             "doc": JSON.stringify(log.data),  
                      //             "action": "Save"
                      //         })
                      //     }
                      // );
                      if(response.ok){
                        await db.runAsync(`DELETE FROM CustomerLocalLogs WHERE id = ?`, [log.id]);
                        console.log("Synced successfully");
                      }else{
                          console.log("Error from the server", await response.text());
                      }
                  }));
          }catch(e){
              console.log('Error saving sale order to the server', e);
          }
      };

        const getSalesInvoices = async () => {
          try{
              const allSalesInvoices = await db.getAllAsync(`SELECT * FROM Sales_Invoice;`);
              setSalesInvoices(allSalesInvoices);
          }catch(e){
              console.log("error retreiving sales Invoices", e);
          }
        };

        const getSalesPayments = async () => {
          try {
            const allPayments = await db.getAllAsync(`SELECT * FROM Sales_Invoice_Payment;`);
            setPayments(allPayments);
          }catch(e){
            console.log("error retreiving sales payments", e);
          }
        };

        useEffect(() => {   
          if(isFocused){
              const initialize = async () => {
                createSalesOrderLocalLogs();
                getSalesInvoices();
                getSalesPayments();
                saveToLocalLogs();
              };
              initialize();
          }
      }, [isFocused]);

        useEffect(() => {
          if (salesInvoices) {
              getSalesInvoices();
              getSalesPayments();
          }
        }, [salesInvoices]);

      return(
        <View>
          {payments.length=== 0 ? (
            <Text>No Transactions yet.</Text>
              ) : (
                <>
                <View style={{ flexDirection: 'row', alignItems: 'center' , paddingTop:10}}>
                  <FontAwesome5 name="sync" size={24} color="black" style={{position: 'absolute', right: 30}} onPress={handleSubmit} />
                </View> 
                <FlatList
                  data ={payments}
                  keyExtractor={(item) => item.name}
                  renderItem={({item}) => (
                    <TouchableOpacity style={{flexDirection:'row', backgroundColor:'#fff' , marginBottom:10, borderRadius:15, marginRight:5}}>
                      <View style={{paddingRight:10}}>
                        <Text>{item.name}</Text>
                        <Text>mode_of_payment:{item.mode_of_payment}</Text>
                        <Text>Amount Paid{item.amount}</Text>
                        <Text>Invoice Date{item.clearance_date}</Text>
                      </View>
                      <View style={{paddingLeft:10, flexDirection:'column',alignContent:'center'}}>
                        <TouchableOpacity 
                          style={{justifyContent:'flex-end', alignItems: 'center', backgroundColor:"#E59135", height:20, marginRight:20}}
                          onPress={()=>navigation.navigate('PaymentDetails',{Payment : item.parent})}
                        >
                          <Text style={{color:"#FFF"}}>View Details</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  )}
                />
                </>
          )}
        </View>
      );
    };
  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center', marginTop:10}}>
      <Text style={{fontSize:24}}>Liste des Transactions</Text>
      <Content />
    </View>
  )
}

export default PaimentScreen;

const styles = StyleSheet.create({})