import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite';
import { useIsFocused } from '@react-navigation/native';
import * as CryptoJS from 'crypto-js';
import { AntDesign } from '@expo/vector-icons';

const StockScreen = ({navigation}) => {
  const db = useSQLiteContext();

  const isFocused = useIsFocused();

  const Content =  () => {
      const [stocks , setStocks] = useState([]);
      const [warehouses , setWarehouses] = useState([]);
      //const [displayData , setDisplayData] = useState([]);

      const getHash = (data) => {
          return CryptoJS.MD5(JSON.stringify(data)).toString();
      };

      const createMetadataTable = async () => {
          await db.runAsync(`
              CREATE TABLE IF NOT EXISTS WarehouseMetadata (
                  id INTEGER PRIMARY KEY,
                  data_hash TEXT
              );
          `);
          const rowCount = await db.runAsync('SELECT COUNT(*) as count FROM WarehouseMetadata;');
          if (rowCount.count === 0) {
              await db.runAsync('INSERT INTO WarehouseMetadata (id, data_hash) VALUES (1, "");');
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

      const getWarehousesfromAPI = async () => {
          try{
              // const response = await fetch('http://195.201.138.202:8006/api/resource/Customer?fields=["*"]', {
              //     method: 'GET',
              //     headers: {
              //         'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
              //     },
              // });
              const response = await fetch('http://195.201.138.202:8006/api/resource/Warehouse?fields=["*"]', {
                  method: 'GET',
                  headers: {
                      'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
                  },
              });
              const json = await response.json();
              
              const newHash = getHash(json.data);

              const existingHash = await db.runAsync('SELECT data_hash FROM WarehouseMetadata WHERE id = 1;');
              if (existingHash !== newHash) {

                  await Promise.all(warehouses.map(async (warehouse) => {
                      await db.runAsync(`DELETE FROM Warehouse WHERE name = ?;`, [warehouse.name]);
                  }));

                  await saveInLocalWarehouses(json.data);
                  await db.runAsync('UPDATE WarehouseMetadata SET data_hash = ? WHERE id = 1;', [newHash]);
                  setWarehouses(json.data);
              }
              return json.data;
          } catch (error){
              console.log('error fetching warehouses',error);
          }
      };

      const saveInLocalWarehouses = async (warehouses) => {
          try{
              await Promise.all(warehouses.map(async (warehouse) => {
                await db.runAsync(`INSERT OR REPLACE INTO Warehouse
                  (
                    name, creation, modified, modified_by, owner,
                    docstatus, idx, disabled, warehouse_name, is_group,
                    parent_warehouse, is_rejected_warehouse, account, company, email_id,
                    phone_no, mobile_no, address_line_1, address_line_2, city,
                    state, pin, warehouse_type, default_in_transit_warehouse, lft,
                    rgt, old_parent, _user_tags, _comments, _assign,
                    _liked_by
                  ) VALUES (
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?)`,
                  [
                    warehouse.name, warehouse.creation, warehouse.modified, warehouse.modified_by, warehouse.owner,
                    warehouse.docstatus, warehouse.idx, warehouse.disabled, warehouse.warehouse_name, warehouse.is_group,
                    warehouse.parent_warehouse, warehouse.is_rejected_warehouse, warehouse.account, warehouse.company, warehouse.email_id,
                    warehouse.phone_no, warehouse.mobile_no, warehouse.address_line_1, warehouse.address_line_2, warehouse.city,
                    warehouse.state, warehouse.pin, warehouse.warehouse_type, warehouse.default_in_transit_warehouse, warehouse.lft,
                    warehouse.rgt, warehouse.old_parent, warehouse._user_tags, warehouse._comments, warehouse._assign,
                    warehouse._liked_by
                  ]
                );
              }));
          }catch(e){
              console.log('Error saving warehouses to local database', e);
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

      const getStocks = async () => {
          try{
              const allStocks = await db.getAllAsync(`SELECT * FROM Warehouse;`);
              setStocks(allStocks);
          }catch(e){
              console.log("error retreiving stocks", e);
          }
      };

      useEffect(() => {   
          if(isFocused){
              const initialize = async () => {
                  createMetadataTable();
                  getWarehousesfromAPI();
                  getStocks();
              };
              initialize();
          }
      }, [isFocused]);

      useEffect(() => {
          if (stocks) {
              getStocks();
          }
      }, [stocks]);

      return (
          <View>
                  {stocks.length=== 0 ? (
                      <Text>No data yet.</Text>
                  ) : (
                      <FlatList 
                          data ={stocks}
                          keyExtractor={(item, index) => item.name}
                          renderItem={({item}) => (
                              <TouchableOpacity style={{backgroundColor:'#fff' , marginBottom:10}}>
                                  <View style={{marginBottom:10, marginStart:10}}>
                                      <Text style={{fontWeight:'bold'}}>{item.name}</Text>
                                      <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
                                          <View>
                                              <Text>{item.name}</Text>
                                              <Text style={{fontWeight:'semibold'}}>Company:{item.company}</Text>
                                              <Text>Type: {item.warehouse_type}</Text>
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
              onPress={() => navigation.navigate('AddStockScreen')}
          />
      </View>
  );
}

export default StockScreen;

const styles = StyleSheet.create({
  container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    header: {
        fontSize: 24,
    },
    iconAdd: {
        position: 'absolute',
        bottom: 30,
        right: 30,
    },
    items: {
        backgroundColor: '#fff',
    },
})