import { ActivityIndicator, FlatList, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { useSync } from '../../SyncContext';

const PaimentScreen = () => {
  const db = useSQLiteContext();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const route = useRoute();
    // const { salesOrderName } = route.params;
    const { token } = useSync();

    const Content =  () => {
        const [payments , setPayments] = useState([]);
        const [salesInvoices , setSalesInvoices] = useState([]);
        const [associatedSaleOrders, setAssociatedSaleOrders] = useState({});

        const createPaymentEntryLocalLogs = async () => {
          // await db.runAsync(`DELETE FROM payment_entry_logs;`);
          await db.runAsync(`CREATE TABLE IF NOT EXISTS payment_entry_logs(
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  action TEXT,
                  name TEXT,
                  associatedSaleOrder TEXT,
                  state TEXT,
                  data TEXT
              )`);
          };

      const saveToLocalLogs = async () => {
        try{
          const logs = await db.getAllAsync(`SELECT name FROM payment_entry_logs;`);
          const names = logs.map(log => log.name);
          
          const bills = await db.getAllAsync(`SELECT * FROM Payment_Entry;`);
          bills.map(async (bill)=> {
            if(bill.name.includes("ACC-PAY-")){
              console.log("already synced")
            }else{
              const paymentData= {
                  ...bill,
                  doctype: "Payment Entry",
                  __islocal: 1,
                  __unsaved: 1,
              }
              console.log(paymentData);

              const invoicePaymentReference = await db.getFirstAsync(`SELECT * FROM Payment_Reference_Entry WHERE parent =?;`, [bill.name]);
              const invoicePaymenReferencetData ={
                ...invoicePaymentReference,
                __islocal: 1,
                __unsaved: 1,
                doctype: "Payment Entry Reference"
              }

              const data = {
                  ...paymentData,
                  references: [invoicePaymentReference],
                  taxes: [],
                  deductions: [],
              }

              if (!names.includes(bill.name)) {
                  await db.runAsync(
                      `INSERT INTO payment_entry_logs(action, name, associatedSaleOrder, state, data) VALUES (?, ?, ?, ?, ?)`,
                      ["INSERT", bill.name, invoicePaymentReference.reference_name, "Local", JSON.stringify(data)]
                  );
                  console.log("saved to payment entry log",bill.name);
              }else {
                console.log("already in log");
              }
            }
          });
        }catch(e){
          console.log("Error saving to local logs",e);
        }
      };

      const handleSubmit = () => {
        saveToLocalLogs();  
      };

      const syncDataWithServer = async () => {
          try {
            const logs = await db.getAllAsync(`SELECT * FROM sales_invoice_logs;`);
              await Promise.all(
                logs.map(async (log) => {
                  console.log(
                    {
                      "doc": log.data,  
                      "action": "Save"
                    }
                  );

                        const response = await fetch(

                            'http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': token
                                },
                                body: JSON.stringify({
                                    "doc": log.data,  
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
                            response.json().then(async (data) => {
                                console.log(data.docs[0]);
                            

                                await db.runAsync(`UPDATE sales_invoice_logs SET state= ? WHERE id = ?;`, ["Draft", log.id]);
                                console.log("Submitted successfully and updated log state");
                                console.log(
                                    {
                                        "doc": JSON.stringify(data.docs[0]),  
                                        "action": "Submit"
                                    }
                                );
                                try{
                                    const response = await fetch(
                                        'http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
                                    {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': token
                                        },
                                        body: JSON.stringify({
                                            "doc": JSON.stringify(data.docs[0]),  
                                            "action": "Submit"
                                        })
                                    })
                                    if(response.ok){
                                        await db.runAsync(`DELETE FROM sales_invoice_logs WHERE id = ?;`, [log.id]);

                                        ////TODO CHECK FOR STATE SALES ORDER AND UPDATE LISTING VIEW --------------------------------------------*********
                                        console.log("Synced succes and deleted from local logs");
                                        response.json().then(data => console.log(data));
                                    }else{
                                        console.log("Failed to sync with server", await response.text());
                                    }
                                }catch(e){
                                    console.log("Failed to submit sale order", e);
                                }
                            });
                        }else{
                            console.log("Error from the server", await response.text());
                        }
                    }));
          }catch(e){
              console.log('Error sending sale invoice to the server', e);
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
            const allPayments = await db.getAllAsync(`SELECT * FROM Payment_Entry;`);
            setPayments(allPayments);
          }catch(e){
            console.log("error retreiving sales payments", e);
          }
        };

        const getAssociatedSaleOrder = async (payment) => {
          try{
            const saleOrder = await db.getFirstAsync(`SELECT * FROM Payment_Reference_Entry WHERE parent = ?`,[payment]);
            return saleOrder.reference_name;
          }catch(e){
            console.log("error getting associated sale order", e);
          }
        };

        const fetchAssociatedSaleOrder = async () => {
          const associated_SaleOrders = {};
          for (const payment of payments) {
            const saleOrder = await getAssociatedSaleOrder(payment.name);
            associated_SaleOrders[payment.name] = saleOrder;
          }
          setAssociatedSaleOrders(associated_SaleOrders);
        };

        useEffect(() => {
          if (payments && payments.length > 0) {
            fetchAssociatedSaleOrder();
          }
        }, [payments]);

        useEffect(() => {   
          if(isFocused){
              const initialize = async () => {
                createPaymentEntryLocalLogs();
                // getSalesInvoices();
                saveToLocalLogs();
                getSalesPayments();
                //syncDataWithServer();
              };
              initialize();
          }
       }, [isFocused]);

       useEffect(() => {
           if (payments) {  
              getSalesPayments();
           }
         }, [payments]);
      

      return(
        <View>
          {payments.length=== 0 ? (
            <ActivityIndicator
              size="large"
              color="#FF6B35"
              style={styles.loader}
            />
              ) : (
                <>
                {/* <View style={{ flexDirection: 'row', alignItems: 'center' , padding:20}}>
                  <FontAwesome5 name="sync" size={24} color="black" style={{position: 'absolute', right: 30}} onPress={handleSubmit} />
                </View>  */}
                <FlatList
                  data ={payments}
                  keyExtractor={(item) => item.name.toString()}
                  renderItem={({item}) => (
                    <TouchableOpacity key={item.key} style={styles.card}>
                      <View style={styles.cardContent}>
                        <Text style={styles.paymentName}>{item.name}</Text>
                        <View style={styles.paymentDetails}>
                          <Text style={styles.detailText}>Mode of Payment: {item.mode_of_payment}</Text>
                          <Text style={styles.detailText}>Amount Paid: {item.paid_amount}</Text>
                          <Text style={styles.detailText}>Invoice Date: {item.posting_date}</Text>
                          <Text style={styles.detailText}>Sale order: {associatedSaleOrders[item.name]}</Text>
                        </View>
                      </View>
                      <View style={styles.cardActions}>
                        <AntDesign name="edit" size={24} color="#FF6B35" onPress={()=>{navigation.navigate('UpdatePaymentScreen', {Payment: item.name})}} />
                      </View>
                      {/* <View style={{paddingLeft:10, flexDirection:'column',alignContent:'center'}}>
                        <TouchableOpacity 
                          style={{justifyContent:'flex-end', alignItems: 'center', backgroundColor:"#E59135", height:20, marginRight:20}}
                          onPress={()=>navigation.navigate('PaymentDetails',{Payment : item.parent})}
                        >
                          <Text style={{color:"#FFF"}}>View Details</Text>
                        </TouchableOpacity>
                      </View> */}
                    </TouchableOpacity>
                  )}
                />
                </>
          )}
        </View>
      );
    };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Liste des Transactions</Text>
      <Content />
    </View>
  )
}

export default PaimentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
    padding: 10,
  },
  header: {
    fontSize: 24,
    // fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  paymentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  paymentDetails: {
    marginTop: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  cardActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
})