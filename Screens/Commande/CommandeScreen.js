import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import * as CryptoJS from 'crypto-js';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import * as axios from 'react-native-axios';

const CommandeScreen = () => {
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const Content =  () => {
        const [commandes , setCommandes] = useState([]);
        const [salesOrders , setSaleOrders] = useState([]);
        const [saleOrder, setSaleOrder] = useState([]);

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
            const rowCount = await db.runAsync('SELECT COUNT(*) as count FROM SalesOrderMetadata;');
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
                //console.log(data);

                //console.log(JSON.stringify(data));
                if (!names.includes(order.name)) {
                    await db.runAsync(
                        `INSERT INTO sales_order_logs (action, name, state, data) VALUES (?, ?, ?, ?)`,
                        ["INSERT", order.name, "Draft", JSON.stringify(data)]
                    );
                }
            });
        };

        const handleSubmit = () => {
            saveToLocalLogs();  
        };

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
                                    'Authorization': 'token 94c0faa6066a7c0:982654458dc9011'
                                },
                                body: JSON.stringify({
                                    "doc": log.data,  
                                    "action": "Save"
                                })
                            }
                        );
                        // const response = await axios.post('http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs', {
                        //     "doc": log.data,  
                        //     "action": "Save"
                        // }, {
                        //     headers: {
                        //         'Content-Type': 'application/json',
                        //         'Authorization': 'token 94c0faa6066a7c0:982654458dc9011'
                        //     }
                        //   }
                        // )
                        
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
                            //await db.runAsync(`DELETE FROM CustomerLocalLogs WHERE id = ?`, [log.id]);
                            response.json().then(data => {
                                console.log(data);
                            });
                            await db.runAsync(`UPDATE CustomerLocalLogs SET state= ?`, ["Submitted"]);
                            console.log("Submitted successfully");
                            try{
                                const response = await fetch()
                                if(response.ok){
                                    await db.runAsync(`DELETE FROM CustomerLocalLogs WHERE id = ?`, [log.id]);
                                    console.log("Synced succes");
                                }else{
                                    console.log("Failed to sync with server", await response.text());
                                }
                            }catch(e){
                                console.log("Failed to submit change", e);
                            }
                        }else{
                            console.log("Error from the server", await response.text());
                        }
                    }));
            }catch(e){
                console.log('Error saving sale order to the server', e);
            }
        };

        // const getSalesOrderfromAPI = async () => {
        //     try{
        //         // const response = await fetch('http://195.201.138.202:8006/api/resource/Customer?fields=["*"]', {
        //         //     method: 'GET',
        //         //     headers: {
        //         //         'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
        //         //     },
        //         // });
        //         const response = await fetch('http://195.201.138.202:8006/api/resource/Customer?fields=["*"]', {
        //             method: 'GET',
        //             headers: {
        //                 'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
        //             },
        //         });
        //         const json = await response.json();
                
        //         const newHash = getHash(json.data);

        //         const existingHash = await db.runAsync('SELECT data_hash FROM SalesOrderMetadata WHERE id = 1;');
        //         if (existingHash !== newHash) {

        //             await Promise.all(salesOrders.map(async (salesOrder) => {
        //                 await db.runAsync(`DELETE FROM Sales_Order WHERE name = ?;`, [salesOrder.name]);
        //             }));

        //             await saveInLocalSalesOrders(json.data);
        //             await db.runAsync('UPDATE SalesOrderMetadata SET data_hash = ? WHERE id = 1;', [newHash]);
        //             setSaleOrders(json.data);
        //         }
        //         return json.data;
        //     } catch (error){
        //         console.log('error fetching salesOrder',error);
        //     }
        // };

        // const saveInLocalSalesOrders = async (salesOrders) => {
        //   try{
        //     await Promise.all(salesOrders.map(async (saleOrder) => {
        //       await db.runAsync(`INSERT OR REPLACE INTO Sales_Order 
        //         (
        //           name, creation, modified, modified_by, owner,
        //           docstatus, idx, title, naming_series, customer,
        //           customer_name, tax_id, order_type, transaction_date, delivery_date,
        //           po_no, po_date, company, skip_delivery_note, amended_from,
        //           cost_center, project, currency, conversion_rate, selling_price_list,
        //           price_list_currency, plc_conversion_rate, ignore_pricing_rule, scan_barcode, set_warehouse,
        //           reserve_stock, total_qty, total_net_weight, base_total, base_net_total,
        //           total, net_total, tax_category, taxes_and_charges, shipping_rule,
        //           incoterm, named_place, base_total_taxes_and_charges, total_taxes_and_charges, base_grand_total,
        //           base_rounding_adjustment, base_rounded_total, base_in_words, grand_total, rounding_adjustment,
        //           rounded_total, in_words, advance_paid, disable_rounded_total, apply_discount_on,
        //           base_discount_amount, coupon_code, additional_discount_percentage, discount_amount, other_charges_calculation,
        //           customer_address, address_display, customer_group, territory, contact_person,
        //           contact_display, contact_phone, contact_mobile, contact_email, shipping_address_name,
        //           shipping_address, dispatch_address_name, dispatch_address, company_address, company_address_display,
        //           payment_terms_template, tc_name, terms, status, delivery_status,
        //           per_delivered, per_billed, per_picked, billing_status, sales_partner,
        //           amount_eligible_for_commission, commission_rate, total_commission, loyalty_points, loyalty_amount,
        //           from_date, to_date, auto_repeat, letter_head, group_same_items,
        //           select_print_heading, language, is_internal_customer, represents_company, source,
        //           inter_company_order_reference, campaign, party_account_currency, _user_tags, _comments,
        //           _assign, _liked_by, _seen
        //         ) VALUES (
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?, ?, ?,
        //           ?, ?, ?
        //           )`,
        //                     [
        //                         saleOrder.name, saleOrder.creation, saleOrder.modified, saleOrder.modified_by, saleOrder.owner,
        //                         saleOrder.docstatus, saleOrder.idx, saleOrder.title, saleOrder.naming_series, saleOrder.customer,
        //                         saleOrder.customer_name, saleOrder.tax_id, saleOrder.order_type, saleOrder.transaction_date, saleOrder.delivery_date,
        //                         saleOrder.po_no, saleOrder.po_date, saleOrder.company, saleOrder.skip_delivery_note, saleOrder.amended_from,
        //                         saleOrder.cost_center, saleOrder.project, saleOrder.currency, saleOrder.conversion_rate, saleOrder.selling_price_list,
        //                         saleOrder.price_list_currency, saleOrder.plc_conversion_rate, saleOrder.ignore_pricing_rule, saleOrder.scan_barcode, saleOrder.set_warehouse,
        //                         saleOrder.reserve_stock, saleOrder.total_qty, saleOrder.total_net_weight, saleOrder.base_total, saleOrder.base_net_total,
        //                         saleOrder.total, saleOrder.net_total, saleOrder.tax_category, saleOrder.taxes_and_charges, saleOrder.shipping_rule,
        //                         saleOrder.incoterm, saleOrder.named_place, saleOrder.base_total_taxes_and_charges, saleOrder.total_taxes_and_charges, saleOrder.base_grand_total,
        //                         saleOrder.base_rounding_adjustment, saleOrder.base_rounded_total, saleOrder.base_in_words, saleOrder.grand_total, saleOrder.rounding_adjustment,
        //                         saleOrder.rounded_total, saleOrder.in_words, saleOrder.advance_paid, saleOrder.disable_rounded_total, saleOrder.apply_discount_on,
        //                         saleOrder.base_discount_amount, saleOrder.coupon_code, saleOrder.additional_discount_percentage, saleOrder.discount_amount, saleOrder.other_charges_calculation,
        //                         saleOrder.customer_address, saleOrder.address_display, saleOrder.customer_group, saleOrder.territory, saleOrder.contact_person,
        //                         saleOrder.contact_display, saleOrder.contact_phone, saleOrder.contact_mobile, saleOrder.contact_email, saleOrder.shipping_address_name,
        //                         saleOrder.shipping_address, saleOrder.dispatch_address_name, saleOrder.dispatch_address, saleOrder.company_address, saleOrder.company_address_display,
        //                         saleOrder.payment_terms_template, saleOrder.tc_name, saleOrder.terms, saleOrder.status, saleOrder.delivery_status,
        //                         saleOrder.per_delivered, saleOrder.per_billed, saleOrder.per_picked, saleOrder.billing_status, saleOrder.sales_partner,
        //                         saleOrder.amount_eligible_for_commission, saleOrder.commission_rate, saleOrder.total_commission, saleOrder.loyalty_points, saleOrder.loyalty_amount,
        //                         saleOrder.from_date, saleOrder.to_date, saleOrder.auto_repeat, saleOrder.letter_head, saleOrder.group_same_items,
        //                         saleOrder.select_print_heading, saleOrder.language, saleOrder.is_internal_customer, saleOrder.represents_company, saleOrder.source,
        //                         saleOrder.inter_company_order_reference, saleOrder.campaign, saleOrder.party_account_currency, saleOrder._user_tags, saleOrder._comments,
        //                         saleOrder._assign, saleOrder._liked_by, saleOrder._seen
        //                     ]
        //                 );
        //         }));
        //     }catch(e){
        //         console.log('Error saving sales orders to local database', e);
        //     }
        // };

        const getSalesOrders = async () => {
            try{
                const allSalesOrders = await db.getAllAsync(`SELECT * FROM Sales_Order;`);
                setSaleOrders(allSalesOrders);
            }catch(e){
                console.log("error retreiving sales orders", e);
            }
        };

        useEffect(() => {   
            if(isFocused){
                const initialize = async () => {
                    createMetadataTable();
                    createSalesOrderLocalLogs();
                    saveToLocalLogs();
                    syncDataWithServer();
                    // getSalesOrderfromAPI();
                    getSalesOrders();
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
                      <Text>No data yet.</Text>
                  ) : (
                    <>
                    <View style={{ flexDirection: 'row', alignItems: 'center' , paddingTop:10}}>
                        <FontAwesome5 name="sync" size={24} color="black" style={{position: 'absolute', right: 30}} onPress={handleSubmit} />
                    </View> 
                      <FlatList 
                          data ={salesOrders}
                          keyExtractor={(item) => item.name}
                          ListHeaderComponent={<View style={{ flexDirection: 'row', alignItems: 'center' , paddingTop:10}}>
                            <FontAwesome5 name="sync" size={24} color="black" style={{position: 'absolute', bottom: 30, right: 30}} />
                            </View>}
                          renderItem={({item}) => (
                              <TouchableOpacity style={{backgroundColor:'#fff' , marginBottom:10, borderRadius:15, marginRight:5}} onPress={() => navigation.navigate('SalesInvoiceScreen',{commandeName: item.name})}>
                                  <View style={{marginBottom:10, marginStart:10}}>
                                      <Text style={{fontWeight:'bold'}}>{item.name}</Text>
                                      <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
                                          <View style={{}}>
                                              <Text>{item.name}</Text>
                                              <Text style={{fontWeight:'semibold'}}>Customer{item.customer}</Text>
                                              <Text>Date: {item.transaction_date}</Text>
                                              <Text>Total quantity: {item.total_qty}</Text>
                                              <Text>Total amount: {item.grand_total}</Text>
                                          </View>
                                          <View style={{flexDirection:'column', marginEnd:20 , marginLeft:10}}>
                                              <AntDesign name="edit" size={24} style={{paddingBottom:10, marginLeft:18}} color="black" />
                                              <TouchableOpacity style={{justifyContent:'flex-end', alignItems: 'center', backgroundColor:"#E59135", height:20, marginRight:20}}>
                                                <Text style={{color:"#FFF"}} onPress={() => navigation.navigate('CommandeArticles', {CommandeName : item.name})}>View items</Text>
                                              </TouchableOpacity>
                                              <View style={{ flexDirection: 'row', alignItems: 'center' , paddingTop:10}}>
                                                 <FontAwesome5 name="sync" size={24} color="black" style={{marginLeft:18}} />
                                              </View>
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
    <View>
        <Text style={{fontSize:24}}>Liste des commandes</Text>
        <Content />   
    </View>
  );
}

export default CommandeScreen;

const styles = StyleSheet.create({})