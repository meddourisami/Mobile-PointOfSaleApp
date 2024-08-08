import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import * as CryptoJS from 'crypto-js';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { FontAwesome5 } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AntDesign } from '@expo/vector-icons';

const CommandeScreen = () => {
    const db = useSQLiteContext();
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const Content =  () => {
        const [commandes , setCommandes] = useState([]);
        const [salesOrders , setSaleOrders] = useState([]);
        const [saleOrder, setSaleOrder] = useState([]);
        //const [displayData , setDisplayData] = useState([]);

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

        // const createLocalChangesTable = async () => {
        //     //await db.runAsync(`DELETE FROM CustomerLocalLogs`);
        //     await db.runAsync(`
        //         CREATE TABLE IF NOT EXISTS CustomerLocalLogs (
        //             id INTEGER PRIMARY KEY AUTOINCREMENT,
        //             customer_name TEXT,
        //             action TEXT,
        //             data TEXT
        //         );
        //     `);
        // };

        const getSalesOrderfromAPI = async () => {
            try{
                // const response = await fetch('http://195.201.138.202:8006/api/resource/Customer?fields=["*"]', {
                //     method: 'GET',
                //     headers: {
                //         'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
                //     },
                // });
                const response = await fetch('http://195.201.138.202:8006/api/resource/Customer?fields=["*"]', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
                    },
                });
                const json = await response.json();
                
                const newHash = getHash(json.data);

                const existingHash = await db.runAsync('SELECT data_hash FROM SalesOrderMetadata WHERE id = 1;');
                if (existingHash !== newHash) {

                    await Promise.all(salesOrders.map(async (salesOrder) => {
                        await db.runAsync(`DELETE FROM Sales_Order WHERE name = ?;`, [salesOrder.name]);
                    }));

                    await saveInLocalSalesOrders(json.data);
                    await db.runAsync('UPDATE SalesOrderMetadata SET data_hash = ? WHERE id = 1;', [newHash]);
                    setSaleOrders(json.data);
                }
                return json.data;
            } catch (error){
                console.log('error fetching salesOrder',error);
            }
        };

        const saveInLocalSalesOrders = async (salesOrders) => {
          try{
            await Promise.all(salesOrders.map(async (saleOrder) => {
              await db.runAsync(`INSERT OR REPLACE INTO SalesOrder 
                (
                  name, creation, modified, modified_by, owner,
                  docstatus, idx, title, naming_series, customer,
                  customer_name, tax_id, order_type, transaction_date, delivery_date,
                  po_no, po_date, company, skip_delivery_note, amended_from,
                  cost_center, project, currency, conversion_rate, selling_price_list,
                  price_list_currency, plc_conversion_rate, ignore_pricing_rule, scan_barcode, set_warehouse,
                  reserve_stock, total_qty, total_net_weight, base_total, base_net_total,
                  total, net_total, tax_category, taxes_and_charges, shipping_rule,
                  incoterm, named_place, base_total_taxes_and_charges, total_taxes_and_charges, base_grand_total,
                  base_rounding_adjustment, base_rounded_total, base_in_words, grand_total, rounding_adjustment,
                  rounded_total, in_words, advance_paid, disable_rounded_total, apply_discount_on,
                  base_discount_amount, coupon_code, additional_discount_percentage, discount_amount, other_charges_calculation,
                  customer_address, address_display, customer_group, territory, contact_person,
                  contact_display, contact_phone, contact_mobile, contact_email, shipping_address_name,
                  shipping_address, dispatch_address_name, dispatch_address, company_address, company_address_display,
                  payment_terms_template, tc_name, terms, status, delivery_status,
                  per_delivered, per_billed, per_picked, billing_status, sales_partner,
                  amount_eligible_for_commission, commission_rate, total_commission, loyalty_points, loyalty_amount,
                  from_date, to_date, auto_repeat, letter_head, group_same_items,
                  select_print_heading, language, is_internal_customer, represents_company, source,
                  inter_company_order_reference, campaign, party_account_currency, _user_tags, _comments,
                  _assign, _liked_by, _seen
                ) VALUES (
                  ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?,
                  )`,
                            [
                                customer.name, customer.creation, customer.modified, customer.modified_by, customer.owner,
                                customer.docstatus, customer.idx, customer.naming_series, customer.salutation, customer.customer_name, customer.customer_type,
                                customer.customer_group, customer.territory, customer.gender, customer.lead_name, customer.opportunity_name,
                                customer.account_manager, customer.image, customer.default_price_list, customer.default_bank_account, customer.default_currency,
                                customer.is_internal_customer, customer.represents_company, customer.market_segment, customer.industry, customer.customer_pos_id,
                                customer.website, customer.language, customer.customer_details, customer.customer_primary_contact, customer.mobile_no,
                                customer.email_id, customer.customer_primary_address, customer.primary_address, customer.tax_id, customer.tax_category,
                                customer.tax_withholding_category, customer.payment_terms, customer.loyalty_program, customer.loyalty_program_tier, customer.default_sales_partner,
                                customer.default_commission_rate, customer.so_required, customer.dn_required, customer.is_frozen, customer.disabled,
                                customer._user_tags, customer._comments, customer._assign, customer._liked_by, customer.custom_nrc,
                                customer.custom_nic, customer.custom_nai, customer.custom_code, customer.custom_address, customer.custom_phone,
                                customer.custom_nif, customer.custom_stateprovince, customer.custom_fax, customer.custom_activity, customer.custom_email_address,
                                customer.custom_credit_limit, customer.custom_register, customer.custom_deadlines_to_max_in_nb_day, customer.custom_total_unpaid, customer.custom_capital_stock,
                                customer.custom_item, customer_synced
                            ]
                        );
                }));
            }catch(e){
                console.log('Error saving sales orders to local database', e);
            }
        };

        // const syncDataWithServer = async (saleOrder) => {
        //     try {
        //         const {
        //             name,
        //             customer_name,
        //             customer_type,
        //             customer_group,
        //             territory,
        //             custom_code,
        //             custom_address,
        //             custom_phone
        //         } = saleOrder;

        //         console.log(name);

        //         const data = {
        //             name,
        //             customer_name,
        //             customer_type,
        //             customer_group,
        //             territory,
        //             custom_code,
        //             custom_address,
        //             custom_phone,
        //             doctype: "Customer",
        //             __islocal: 1,
        //             owner: "Administrator",
        //         };

        //         console.log("data", JSON.stringify({
        //             "doc": JSON.stringify(data),  
        //             "action": "Save"
        //         }));

        //         const response = await fetch(
        //             'http://195.201.138.202:8006/api/method/frappe.desk.form.save.savedocs',
        //                 {
        //                     method: 'POST',
        //                     headers: {
        //                         'Content-Type': 'application/json',
        //                         'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c'
        //                     },
        //                     body: JSON.stringify({
        //                         "doc": JSON.stringify(data),  
        //                         "action": "Save"
        //                     })
        //                 }
        //             );
        //         if(response.ok){
        //             console.log("Synced successfully");
        //         }else{
        //             console.log("Error from the server", await response.text());
        //         }
        //     }catch(e){
        //         console.log('Error saving data to server', e);
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
                    getSalesOrdersfromAPI();
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
                      <FlatList 
                          data ={salesOrders}
                          keyExtractor={(item) => item.name}
                          renderItem={({item}) => (
                              <TouchableOpacity style={{backgroundColor:'#fff' , marginBottom:10}}>
                                  <View style={{marginBottom:10, marginStart:10}}>
                                      <Text style={{fontWeight:'bold'}}>{item.name}</Text>
                                      <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
                                          <View>
                                              <Text>{item.name}</Text>
                                              <Text style={{fontWeight:'semibold'}}>Customer{item.customer}</Text>
                                              <Text>Date: {item.transaction_date}</Text>
                                              <Text>Total quantity: {item.total_qty}</Text>
                                              <Text>Total amount: {item.grand_total}</Text>
                                          </View>
                                          <View style={{flexDirection:'column', marginEnd:20 , paddingLeft:20, marginLeft:10}}>
                                              <AntDesign name="edit" size={24} style={{paddingBottom:10}} color="black" />
                                              <TouchableOpacity style={{justifyContent:'flex-end', alignItems: 'center', backgroundColor:"#E59135", height:20, marginRight:10}}>
                                                <Text style={{color:"#FFF"}} onPress={() => navigation.navigate('CommandeArticles', {CommandeName : item.name})}>View items</Text>
                                              </TouchableOpacity>
                                          </View>
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
    <View>
      <Text>Liste des commandes</Text>
      <Content />
            <FontAwesome 
            name="edit"
            size={35} 
            color="#284979" 
            style={styles.iconEdit}
            />
            <MaterialIcons 
            name="delete"
            size={35} 
            color="#284979" 
            style={styles.iconDelete}
            />
    </View>
  );
}

export default CommandeScreen;

const styles = StyleSheet.create({})