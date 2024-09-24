import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import * as CryptoJS from 'crypto-js';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import * as axios from 'react-native-axios';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { useSync } from '../../SyncContext';

const CommandeScreen = () => {
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const { token } = useSync();

    const Content =  () => {
        const [commandes , setCommandes] = useState([]);
        const [salesOrders , setSaleOrders] = useState([]);
        const [saleOrder, setSaleOrder] = useState([]);
        const [paymentStatuses, setPaymentStatuses] = useState({});
        const [payments, setPayments] = useState({});

        const getHash = (data) => {
            return CryptoJS.MD5(JSON.stringify(data)).toString();
        };

        const createMetadataTable = async () => {
            await db.runAsync(`
                CREATE TABLE IF NOT EXISTS SalesOrderMetadata (
                    id INTEGER PRIMARY KEY,
                    data_hash TEXT
                );
            `);
            const rowCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM SalesOrderMetadata;');
            if (rowCount.count === 0) {
                await db.runAsync('INSERT INTO SalesOrderMetadata (id, data_hash) VALUES (1, "");');
            }
        };

        const createSalesOrderLocalLogs = async () => {
            //await db.runAsync(`DROP TABLE IF EXISTS sales_order_logs;`);
            await db.runAsync(`CREATE TABLE IF NOT EXISTS sales_order_logs(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    action TEXT,
                    name TEXT,
                    state TEXT,
                    data TEXT
                )`);
        };

        const saveToLocalLogs = async () => {
            const logs = await db.getAllAsync(`SELECT name FROM sales_order_logs;`);
            const names = logs.map(log => log.name);

            const Orders = await db.getAllAsync(`SELECT * FROM Sales_Order;`);
            Orders.map(async (order)=> {

                if(order.name.includes("SAL-ORD-")){
                    console.log("already synced");
                }else{
                    const orderData= {
                        ...order,
                        doctype: "Sales Order",
                        __islocal: 1,
                        __unsaved: 1,
                    }
                    const orderItems = await db.getAllAsync(`SELECT * FROM Sales_Order_Item WHERE parent =?`, [order.name]);
                    const orderItemsData = [];
                    const updatedItems= orderItems.map(item =>({
                        ...item,
                        __islocal: 1,
                        __unsaved: 1,
                        doctype: "Sales Order Item"
                    }));

                    const orderTaxes = await db.getFirstAsync(`SELECT * FROM Sales_Taxes_and_Charges WHERE parent=?`, [order.name]);
                    const orderTaxesData = {
                        ...orderTaxes,
                        __islocal: 1,
                        __unsaved: 1,
                        doctype: "Sales Taxes and Charges"
                    }

                    const data = {
                        ...orderData,
                        items: updatedItems,
                        taxes: [orderTaxesData],
                    }

                    if (!names.includes(order.name)) {
                        await db.runAsync(
                            `INSERT INTO sales_order_logs (action, name, state, data) VALUES (?, ?, ?, ?)`,
                            ["INSERT", order.name, "local", JSON.stringify(data)]
                        );
                        console.log("saved to sales order local logs", order.name);
                    }else{
                        console.log("already in log");
                    }
                }
            });
        };

        // const handleSubmit = () => {
        //     saveToLocalLogs();  
        // };

        const syncDataWithServer = async () => {
            try {
                const logs = await db.getAllAsync(`SELECT * FROM sales_order_logs;`);
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
                            

                                await db.runAsync(`UPDATE sales_order_logs SET state= ? WHERE id = ?;`, ["Draft", log.id]);
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
                                        //await db.runAsync(`DELETE FROM sales_order_logs WHERE id = ?;`, [log.id]);
                                        //TODO CHECK FOR STATE SALES ORDER AND UPDATE LISTING VIEW *********************************
                                        console.log("Synced succes and deleted from local logs");
                                        response.json().then(async (data) => {
                                            console.log(data.docs[0].name);
                                            const orderTosync= await db.getFirstAsync(`SELECT * FROM Sales_Order WHERE name= ?`,[log.name]);
                                            await db.runAsync(`INSERT INTO Sales_Order(
                                                name, owner,
                                                docstatus, title, naming_series, customer,
                                                customer_name, order_type, transaction_date, delivery_date,
                                                company, skip_delivery_note, currency, selling_price_list,
                                                set_warehouse,
                                                total_qty, total_net_weight, base_total, base_net_total,
                                                total, net_total, tax_category, taxes_and_charges,
                                                base_total_taxes_and_charges, total_taxes_and_charges, base_grand_total,
                                                base_rounding_adjustment, base_rounded_total, base_in_words, grand_total, rounding_adjustment,
                                                rounded_total, in_words, advance_paid, disable_rounded_total, apply_discount_on,
                                                base_discount_amount, discount_amount,
                                                customer_address, customer_group, territory,
                                                status, delivery_status,
                                                billing_status,
                                                amount_eligible_for_commission,
                                                group_same_items,
                                                language, is_internal_customer,
                                                party_account_currency
                                            ) VALUES (
                                                ?, ?,
                                                ?, ?, ?, ?,
                                                ?, ?, ?, ?,
                                                ?, ?, ?, ?,
                                                ?,
                                                ?, ?, ?, ?,
                                                ?, ?, ?, ?,
                                                ?, ?, ?,
                                                ?, ?, ?, ?, ?,
                                                ?, ?, ?, ?, ?,
                                                ?, ?,
                                                ?, ?, ?,
                                                ?, ?,
                                                ?,
                                                ?,
                                                ?,
                                                ?, ?,
                                                ?
                                            )`,
                                                [
                                                    data.docs[0].name, orderTosync.owner,
                                                    orderTosync.docstatus, orderTosync.title, orderTosync.naming_series, orderTosync.customer,
                                                    orderTosync.customer_name, orderTosync.order_type, orderTosync.transaction_date, orderTosync.delivery_date,
                                                    orderTosync.company, orderTosync.skip_delivery_note, orderTosync.currency, orderTosync.selling_price_list,
                                                    orderTosync.set_warehouse,
                                                    orderTosync.total_qty, orderTosync.total_net_weight, orderTosync.base_total, orderTosync.base_net_total,
                                                    orderTosync.total, orderTosync.net_total, orderTosync.tax_category, orderTosync.taxes_and_charges,
                                                    orderTosync.base_total_taxes_and_charges, orderTosync.total_taxes_and_charges, orderTosync.base_grand_total,
                                                    orderTosync.base_rounding_adjustment, orderTosync.base_rounded_total, orderTosync.base_in_words, orderTosync.grand_total, orderTosync.rounding_adjustment,
                                                    orderTosync.rounded_total, orderTosync.in_words, orderTosync.advance_paid, orderTosync.disable_rounded_total, orderTosync.apply_discount_on,
                                                    orderTosync.base_discount_amount, orderTosync.discount_amount,
                                                    orderTosync.customer_address, orderTosync.customer_group, orderTosync.territory,
                                                    orderTosync.status, orderTosync.delivery_status,
                                                    orderTosync.billing_status,
                                                    orderTosync.amount_eligible_for_commission,
                                                    orderTosync.group_same_items,
                                                    orderTosync.language, orderTosync.is_internal_customer,
                                                    orderTosync.party_account_currency
                                                ]
                                            );
                                            const updatedOrder = await db.getFirstAsync(`SELECT * FROM Sales_Order WHERE name= ?`, [data.docs[0].name]);
                                            console.log(updatedOrder);
                                            await db.runAsync(`DELETE FROM Sales_order WHERE name = ?`, [log.name]);
                                            await db.runAsync(`UPDATE Sales_Order_Item SET parent=? WHERE parent=?`,[data.docs[0].name, log.name]);
                                            const updatedItems = await db.getAllAsync(`SELECT * FROM Sales_Order_Item WHERE parent=?`,[data.docs[0].name]);
                                            console.log(updatedItems);
                                            await db.runAsync(`UPDATE Sales_Taxes_and_Charges SET parent=? WHERE parent=?`,[data.docs[0].name, log.name]);
                                            await db.runAsync(`DELETE FROM sales_order_logs WHERE id = ?;`, [log.id]);
                                        });

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
                console.log('Error saving sale order to the server', e);
            }
        };

        const deleteSaleOrder = async (saleOrder) => {
            try{
                await db.runAsync(`DELETE FROM Sales_Order WHERE name = ?`, [saleOrder]);
                await db.runAsync(`DELETE FROM Sales_Order_Item WHERE parent =?`, [saleOrder]);
                await db.runAsync(`DELETE FROM Sales_Taxes_and_Charges WHERE parent =?`, [saleOrder]);
                await db.runAsync(`DELETE FROM sales_order_logs WHERE name =?`, [saleOrder]);
            }catch(e){
                console.log('Error deleting sale order', e);
            }
        }

        const handleDelete = (saleOrder) => {
            deleteSaleOrder(saleOrder);
            Alert.alert('Deleted sale order successfully');
        };

        const getSalesOrders = async () => {
            try{
                const allSalesOrders = await db.getAllAsync(`SELECT * FROM Sales_Order;`);
                setSaleOrders(allSalesOrders);
            }catch(e){
                console.log("error retreiving sales orders", e);
            }
        };

        // // const getPaymentStatusOfaSaleOrder = async (orderName) => {
        // //     try{
        //         let total= 0;
        //         const payments= await db.getAllAsync(`SELECT * FROM Payment_Reference_Entry WHERE reference_name=?`, [orderName]);
        //         if (payments.length === 0) {
        //             return "Unpaid";
        //         }else {
        //             payments.forEach(async(payment) => {
        //                 const paid = await db.getFirstAsync(`SELECT * FROM Payment_Entry WHERE name= ?`,[payment.parent]);
        //                 total += paid.paid_amount;
        //                 // console.log("in",total);
                    
        
        //             const totalOrderAmount = payments[0].total_amount; 
        //             // console.log(totalOrderAmount);    
                    
        //             // if (total === 0) {
        //             //     return "Unpaid";
        //             if (total < totalOrderAmount) {
        //                 return "Partially Paid";
        //             } else if (total >= totalOrderAmount) {
        //                 return "Paid";
        //             }
        //         });
        //         }
        //     }catch(e){
        //         console.log("error retrieving payments related to this sale order", e);
        //     }
        // };

        // const PaymentStatus = (order) => {
        //     getPaymentStatusOfaSaleOrder(order);
        // };

        const getStatusIcon = (status) => {
            if (status === "Paid") {
              return <Feather name="check-circle" size={24} color="green" />;
            } else {
              return <Feather name="x-circle" size={24} color="red" />;
            }
        };

        const fetchPaymentStatuses = async () => {
            const statuses = {};
            const payments = {};

            for (const order of salesOrders) {
              const status = await getPaymentStatusOfaSaleOrder(order.name);
              statuses[order.name] = status;
              const payment = await getPaymentsOfaSaleOrder(order.name);
            //   console.log(payment);
              payments[order.name] = payment;
            }
        
            setPaymentStatuses(statuses);
            setPayments(payments);
          };
        
          
          useEffect(() => {
            if (salesOrders && salesOrders.length > 0) {
              fetchPaymentStatuses();
            }
          }, [salesOrders]);
        
          
          const getPaymentStatusOfaSaleOrder = async (orderName) => {
            try {
                let total= 0;
              const payments = await db.getAllAsync(`SELECT * FROM Payment_Reference_Entry WHERE reference_name=?`, [orderName]);
              const totalOrderAmount = payments[0]?.total_amount || 0;

              if (payments.length === 0) {
                return "Unpaid";
                    }else {
                        await Promise.all(
                            payments.map(async(payment) => {
                                const paid = await db.getFirstAsync(`SELECT * FROM Payment_Entry WHERE name= ?`,[payment.parent]);
                                total += paid.paid_amount;
                            })
                        );
                        if (total < totalOrderAmount) {
                            return "Partially Paid";
                        } else if (total >= totalOrderAmount) {
                            return "Paid";
                        }
                    }
            }catch(e){
                console.error('Error fetching payment status:', e);
                return 'Unpaid';
            }
        };

        const getPaymentsOfaSaleOrder = async (orderName) => {
            try {
            let total= 0;
              const payments = await db.getAllAsync(`SELECT * FROM Payment_Reference_Entry WHERE reference_name=?`, [orderName]);
              const totalOrderAmount = payments[0]?.total_amount || 0;

              if (payments.length === 0) {
                            return 0;
                        }else {
                            await Promise.all(
                                payments.map(async(payment) => {
                                    const paid = await db.getFirstAsync(`SELECT * FROM Payment_Entry WHERE name= ?`,[payment.parent]);
                                    total += paid.paid_amount;
                                })
                            );
                            return total;
                        }
            }catch(e){
                console.error('Error fetching paid amount:', e);
            }
        };

        const getStatusColor = (status) => {
            const statusColors = {
              "Unpaid": "#ff5252",   
              "Paid": "#4BB543",
              "Partially Paid": "#aaaaaa"
            };
          
            return statusColors[status] || "#FFFFFF"; // Default color if status not found
          };

        useEffect(() => {   
            if(isFocused){
                const initialize = async () => {
                    createMetadataTable();
                    createSalesOrderLocalLogs();
                    saveToLocalLogs();
                    //syncDataWithServer();
                    //getSalesOrderfromAPI();
                    // getSalesOrders();
                };
                initialize();
            }
        }, [isFocused]);

        useEffect(() => {
            if (salesOrders) {
                getSalesOrders();
            }
        }, [salesOrders]);

        return (
          <View>
                  {salesOrders.length=== 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FF6B35" />
                    </View>
                  ) : (
                    <>
                    {/* <View style={{ flexDirection: 'row', alignItems: 'center' , paddingTop:10}}>
                        <FontAwesome5 name="sync" size={24} color="black" style={{position: 'absolute', right: 30}} onPress={handleSubmit} />
                    </View>  */}
                      <FlatList 
                          data ={salesOrders}
                          keyExtractor={(item) => item.name}
                          ListHeaderComponent={<View style={styles.headerContainer}>
                            {/* <FontAwesome5 name="sync" size={24} color="black" style={{position: 'absolute', bottom: 30, right: 30}} /> */}
                            </View>}
                          renderItem={({item}) => (
                              <TouchableOpacity key={item.key} style={styles.card} onPress={() => navigation.navigate('SalesInvoiceScreen',{commandeName: item.name, paymentStat: payments[item.name]})}>
                                    <View style={styles.cardContent}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.cardTitle}>{item.name}</Text>
                                            <MaterialIcons name="arrow-forward-ios" size={24} color="#333" style={{marginRight:20, marginBottom:5}} onPress={() => navigation.navigate('CommandeArticles', {CommandeName : item.name})} />
                                        </View>
                                        <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
                                            <View style={styles.cardDetails}>
                                                <Text style={styles.detailText}>Customer: {item.customer}</Text>
                                                <Text style={styles.detailText}>Date: {item.transaction_date}</Text>
                                                <Text style={styles.detailText}>Total Quantity: {item.total_qty}</Text>
                                                <Text style={styles.detailText}>Total Amount: {item.grand_total}</Text>
                                                <Text style={styles.detailText}>Paid Amount: {payments[item.name]}</Text>
                                                <TouchableOpacity  style={[styles.statusContainer, { backgroundColor: getStatusColor(paymentStatuses[item.name]) }]}>
                                                    <Text style={styles.statusText}>{paymentStatuses[item.name]}</Text>
                                                </TouchableOpacity>
                                            </View>
                                            {/* <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                                                <Text>Status: {PaymentStatus(item.name)} </Text>
                                                <View>{getStatusIcon(PaymentStatus(item.name))}</View>
                                            </View> */}
                                          <View style={styles.cardActions}>
                                              <TouchableOpacity style={styles.actionButton}>
                                                <MaterialIcons name="delete" size={30} color="#FF6B35" onPress={()=> {handleDelete(item.name)}}/>
                                              </TouchableOpacity>
                                              {/* <View style={styles.statusIcon}>
                                                <View>{getStatusIcon(paymentStatuses[item.name])}</View>
                                            </View> */}
                                          </View>
                                      </View>
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
    <View style={styles.container}>
        <Text style={styles.header}>Liste des commandes</Text>
        <Content />   
    </View>
  );
}


export default CommandeScreen;

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 10,
  },
  header: {
    fontSize: 24,
    // fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'column',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDetails: {
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardActions: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    // alignItems: 'center',
    marginEnd:10 ,
    marginLeft:10,
  },
  actionButton: {
    justifyContent:'flex-end', alignItems: 'center',paddingTop:10, height:35, marginRight:10, marginBottom:25
  },
  statusIcon: {
    justifyContent:'flex-end', alignItems: 'center',paddingTop:10, height:35, marginRight:10, marginBottom:5
  },
  statusContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    backgroundColor: "#ff5252",
    height: 30,
    width: 100,
    borderRadius:10,
    justifyContent: 'center',
    alignContent:'center',
  },
  statusText: {
    fontSize: 16,
    color: '#FFF',
    margin:5,
    alignItems:'center',
    justifyContent: 'center',
    alignContent:'center',

    // backgroundColor:" #FF0000"
  },
})
