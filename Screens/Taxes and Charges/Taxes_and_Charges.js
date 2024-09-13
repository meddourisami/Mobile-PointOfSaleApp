import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite';
import { useIsFocused } from '@react-navigation/native';
import * as CryptoJS from 'crypto-js';
import { useSync } from '../../SyncContext';

const Taxes_and_Charges = () => {
  const db = useSQLiteContext();
  const { token } = useSync();
  const isFocused = useIsFocused();

  const Content =  () => {
      const [taxes , setTaxes] = useState([]);
      const [charges , setCharges] = useState([]);
      //const [displayData , setDisplayData] = useState([]);

      const getHash = (data) => {
          return CryptoJS.MD5(JSON.stringify(data)).toString();
      };

      const createMetadataTable = async () => {
          await db.runAsync(`
              CREATE TABLE IF NOT EXISTS TaxesMetadata (
                  id INTEGER PRIMARY KEY,
                  data_hash TEXT
              );
          `);
          const rowCount = await db.runAsync('SELECT COUNT(*) as count FROM TaxesMetadata;');
          if (rowCount.count === 0) {
              await db.runAsync('INSERT INTO TaxesMetadata (id, data_hash) VALUES (1, "");');
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

      const getTaxesfromAPI = async () => {
          try{
              const response = await fetch('http://195.201.138.202:8006/api/resource/Tax Category?fields=["*"]', {
                  method: 'GET',
                  headers: {
                      'Authorization': token,
                  },
              });
              const json = await response.json();
              
              const newHash = getHash(json.data);

              const existingHash = await db.runAsync('SELECT data_hash FROM TaxesMetadata WHERE id = 1;');
              if (existingHash !== newHash) {

                  await Promise.all(taxes.map(async (tax) => {
                      await db.runAsync(`DELETE FROM Sales_Taxes_and_Charges WHERE name = ?;`, [tax.name]);
                  }));

                  await saveInLocalTaxes(json.data);
                  await db.runAsync('UPDATE TaxesMetadata SET data_hash = ? WHERE id = 1;', [newHash]);
                  setTaxes(json.data);
              }
              return json.data;
          } catch (error){
              console.log('error fetching taxes',error);
          }
      };

      const saveInLocalTaxes = async (taxes) => {
          try{
              await Promise.all(taxes.map(async (tax) => {
                await db.runAsync(`INSERT OR REPLACE INTO Sales_Taxes_and_Charges
                  (
                    name, owner, creation, modified, modified_by,
                    docstatus, idx, charge_type, row_id, account_head,
                    description, included_in_print_rate, included_in_paid_amount, cost_center, rate,
                    account_currency, tax_amount, total, tax_amount_after_discount_amount, base_tax_amount, base_total,
                    base_tax_amount_after_discount_amount, item_wise_tax_detail, dont_recompute_tax, parent, parentfield,
                    parenttype
                  ) VALUES (
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?)`,
                  [
                    tax.name, tax.owner, tax.creation, tax.modified, tax.modified_by,
                    tax.docstatus, tax.idx, tax.charge_type, tax.row_id, tax.account_head,
                    tax.description, tax.included_in_print_rate, tax.included_in_paid_amount, tax.cost_center, tax.rate,
                    tax.account_currency, tax.tax_amount, tax.total, tax.tax_amount_after_discount_amount, tax.base_tax_amount, tax.base_total,
                    tax.base_tax_amount_after_discount_amount, tax.item_wise_tax_detail, tax.dont_recompute_tax, tax.parent, tax.parentfield,
                    tax.parenttype
                  ]
                );
              }));
          }catch(e){
              console.log('Error saving taxes to local database', e);
          }
      };

      // const syncDataWithServer = async (stock) => {
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
      //         } = stock;

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
      //             let customer_synced = 1;
      //             await db.runAsync(`UPDATE Customers SET synced = 1 WHERE name = ?`, [name]);
      //         }else{
      //             console.log("Error from the server", await response.text());
      //         }

      //     }catch(e){
      //         console.log('Error saving data to server', e);
      //     }
      // };

    //   const getStocks = async () => {
    //       try{
    //           const allStocks = await db.getAllAsync(`SELECT * FROM Warehouse;`);
    //           setStocks(allStocks);
    //       }catch(e){
    //           console.log("error retreiving stocks", e);
    //       }
    //   };

    //   useEffect(() => {   
    //       if(isFocused){
    //           const initialize = async () => {
    //               createMetadataTable();
    //               getWarehousesfromAPI();
    //               getStocks();
    //           };
    //           initialize();
    //       }
    //   }, [isFocused]);

    //   useEffect(() => {
    //       if (stocks) {
    //           getStocks();
    //       }
    //   }, [stocks]);

      return (
          <View>
                  {stocks.length=== 0 ? (
                    <ActivityIndicator size="large" color="#284979" style={{flex:1, justifyContent:'center', alignItems:'center'}}/>
                  ) : (
                      <FlatList 
                          data ={stocks}
                          keyExtractor={(item) => item.name}
                          renderItem={({item}) => (
                              <TouchableOpacity style={{backgroundColor:'#fff' , marginBottom:10}}>
                                  <View style={{marginBottom:10, marginStart:10}}>
                                      <Text style={{fontWeight:'bold'}}>{item.name}</Text>
                                      <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
                                          <View>
                                              <Text>{item.name}</Text>
                                              <Text style={{fontWeight:'semibold'}}>Adresse:{item.company}</Text>
                                              <Text>Phone: {item.warehouse_type}</Text>
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
      <View style={styles.container}>
          <View>
              <Text style={styles.header}>List of Warehouses</Text>
              <Content style={styles.items}/>
          </View>
          <AntDesign 
              name="pluscircle" 
              size={35} 
              color="#284979" 
              style={styles.iconAdd} 
          />
      </View>
  );
}

export default Taxes_and_Charges;

const styles = StyleSheet.create({})