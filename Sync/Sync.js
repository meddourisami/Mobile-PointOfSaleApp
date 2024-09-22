import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite'
import { useIsFocused } from '@react-navigation/native';
import { useSync } from '../SyncContext';

const Sync = () => {
    const db = useSQLiteContext();
    const isFocused = useIsFocused();
    const { token } = useSync();

    const [saleOrderLogs, setSaleOrderLogs] = useState([]);
    const [saleInvoiceLogs, setSaleInvoiceLogs] = useState([]);

    const syncSaleOrderWithServer = async (log) => {
        try {
            //const logs = await db.getAllAsync(`SELECT * FROM sales_order_logs;`);
            // await Promise.all(
            //     logs.map(async (log) => {
            //         console.log(
            //             {
            //                 "doc": log.data,  
            //                 "action": "Save"
            //             }
            //         );

                    const response = await fetch(
                        'http://192.168.1.12:8001/api/method/frappe.desk.form.save.savedocs',
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
                                    'http://192.168.1.12:8001/api/method/frappe.desk.form.save.savedocs',
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
                                        orderTosync= await db.getFirstAsync(`SELECT * FROM Sales_Order WHERE name= ?`,[log.name]);
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
                //}));
        }catch(e){
            console.log('Error saving sale order to the server', e);
        }
    };

    const syncSaleInvoiceWithServer = async (log) => {
        try {
          //const logs = await db.getAllAsync(`SELECT * FROM sales_invoice_logs;`); //TODO CHECK STATE BEFORE 
            // await Promise.all(
            //   logs.map(async (log) => {
                // console.log(
                //   {
                //     "doc": log.data,  
                //     "action": "Save"
                //   }
                // );

                      const response = await fetch(
                          'http://192.168.1.12:8001/api/method/frappe.desk.form.save.savedocs',
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
                                      'http://192.168.1.12:8001/api/method/frappe.desk.form.save.savedocs',
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
                  //}));
        }catch(e){
            console.log('Error sending sale invoice to the server', e);
        }
    };


    const SaleOrderLogsContent = () => {

        const getSaleOrderLogs = async () =>{
            try{
                const result = await db.getAllAsync('SELECT * FROM sales_order_logs;');
                setSaleOrderLogs(result);
                return result;
            }catch(error){
                console.log("Error fetching sale order logs",error);
            }
        };

        useEffect(()=> {
            if(isFocused){
                getSaleOrderLogs();
            }
        },[isFocused]);

        return(
            <View>
                    <ScrollView style={styles.logsContainer}>
                        {saleOrderLogs.length > 0 ? (
                            saleOrderLogs.map((log, index) => (
                                <View key={index} style={styles.logItem}>
                                    <Text>{`Item: ${log.name}`}</Text>
                                    <Text>{`Status: ${log.state}`}</Text>
                                </View>
                        ))
                    ) : (
                        <Text>No logs to sync.</Text>
                        )}
                    </ScrollView>
            </View>
        );
    };

    const SaleInvoiceLogsContent = () => {

        const getSaleInvoiceLogs = async () =>{
            try{
                const result = await db.getAllAsync('SELECT * FROM sales_invoice_logs;');
                setSaleInvoiceLogs(result);
            }catch(error){
                console.log("Error fetching sale invoice logs",error);
            }
        };

        useEffect(()=> {
            if(isFocused){
                getSaleInvoiceLogs();
            }
        },[isFocused]);

        return(
            <View>
                    <ScrollView style={styles.logsContainer}>
                        {saleInvoiceLogs.length > 0 ? (
                            saleInvoiceLogs.map((log, index) => (
                                <View key={index} style={styles.logItem}>
                                    <Text>{`Item: ${log.name}`}</Text>
                                    <Text>{`Status: ${log.state}`}</Text>
                                </View>
                        ))
                    ) : (
                        <Text>No logs to sync.</Text>
                        )}
                    </ScrollView>
            </View>
        );
    };

    const handleSync = async () => { 
        try {
            saleInvoiceLogs.map(async (log) => {
                const saleOrderName = JSON.parse(log.data).items[0].sales_order;
                if (saleOrderName){
                    sale_order_log_to_sync =await db.getFirstAsync(`SELECT  FROM sales_order_logs WHERE name =?;`,[saleOrderName]);
                    syncSaleOrderWithServer(sale_order_log_to_sync);
                    syncSaleInvoiceWithServer(log);
                }
                else{
                    syncSaleInvoiceWithServer(log);
                }
            })
            saleOrderLogs.map(async (log) =>{
                syncSaleOrderWithServer(log);
            })
        } catch (error) {
            console.log("Error syncing logs", error);
        };
    };

  return (
    <View>
      <Text>Logs To sync</Text>
      <Button title="Sync Now" onPress={handleSync} />
      <View>
        <Text>Sale Order Logs</Text>
        <SaleOrderLogsContent />
      </View>
      <View>
        <Text>Sale Invoice Logs</Text>
        <SaleInvoiceLogsContent />
      </View>
    </View>
  );
}

export default Sync;

const styles = StyleSheet.create({
    logsContainer: {
        marginBottom: 20,
    },
    logItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
})