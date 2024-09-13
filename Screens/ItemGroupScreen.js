import { ActivityIndicator, Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import * as CryptoJS from 'crypto-js';
import { useSync } from '../SyncContext';

const ItemGroupScreen = ({navigation}) => {
  const { token } = useSync();
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const route = useRoute();
  const {customer} = route.params;

  const Content = () => {
    const [item_groups, setItem_groups] = useState([]);
    const [groupItems, setGroupItems] = useState([]);

    const getHash = (data) => {
      return CryptoJS.MD5(JSON.stringify(data)).toString();
    };

    const createMetadataTable = async () => {
      await db.runAsync(`
          CREATE TABLE IF NOT EXISTS GroupItemMetadata (
              id INTEGER PRIMARY KEY,
              data_hash TEXT
          );
      `);
      const rowCount = await db.runAsync('SELECT COUNT(*) as count FROM GroupItemMetadata;');
      if (rowCount.count === 0) {
          await db.runAsync('INSERT INTO GroupItemMetadata (id, data_hash) VALUES (1, "");');
      }
    };

    const getItemGroupsFromApi = async () => {
      try{
        const response = await fetch('http://192.168.1.16:8002/api/method/frappe.desk.reportview.get', 
        // const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.reportview.get', 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token,
            },
            body: JSON.stringify({
              "doctype": "Item Group",
              "fields": [
              "`tabItem Group`.`name`",
              "`tabItem Group`.`owner`",
              "`tabItem Group`.`creation`",
              "`tabItem Group`.`modified`",
              "`tabItem Group`.`modified_by`",
              "`tabItem Group`.`_user_tags`",
              "`tabItem Group`.`_comments`",
              "`tabItem Group`.`_assign`",
              "`tabItem Group`.`_liked_by`",
              "`tabItem Group`.`docstatus`",
              "`tabItem Group`.`idx`",
              "`tabItem Group`.`item_group_name`",
              "`tabItem Group`.`parent_item_group`",
              "`tabItem Group`.`is_group`",
              "`tabItem Group`.`image`"
              ],
              "filters": [],
              "order_by": "`tabItem Group`.`modified` desc",
              "start": 0,
              "page_length": 20,
              "view": "List",
              "group_by": "",
              "with_comment_count": 1
            }),
          }
        );

      const json = await response.json();

      const newHash = getHash(json.data);

      const existingHash = await db.runAsync('SELECT data_hash FROM GroupItemMetadata WHERE id = 1;');
      if (existingHash !== newHash) {
        await Promise.all(item_groups.map(async (group) => {
          
          await db.runAsync(`DELETE FROM Customers WHERE name = ?;`, [group[0]]);
        }));

        saveInLocalItemGroups(json.message.values);
        await db.runAsync('UPDATE CustomerMetadata SET data_hash = ? WHERE id = 1;', [newHash]);
        setItem_groups(json.message.values);
      }
      return json.message.values;

      }catch(e){
        console.log("Error retreiving item groups",e);
      }
    };

    const saveInLocalItemGroups = async (item_groups) => {
      try{
          await Promise.all(item_groups.map(async (group) => {
              await db.runAsync(`INSERT OR REPLACE INTO GroupItem(name, item_group_name, parent_item_group) VALUES (? , ? , ?)`,
                [group[0], group[11], group[12]]
              );   
          }))
      }catch(e){
        console.log(e, 'Error saving in local');
      }
    };

    const getGroupItems = async () => {
      try{
        const groups = await db.getAllAsync(`SELECT * FROM GroupItem;`);
        setGroupItems(groups);
        // console.log(groups);

      }catch(e){
        console.log("Error retreiving group items from database",e);
      }
    };

    useEffect(() => {
      if(isFocused){
        // createMetadataTable();
        getItemGroupsFromApi();
        getGroupItems();
      }
    }, [isFocused]);

    // useEffect(() => {
    //   if (groupItems){
    //     getGroupItems();
    //   }
    // }, [groupItems]);

    return (
      <View style={styles.container}>
        {groupItems=== 0 ? (
          <ActivityIndicator size="large" color="#284979" style={{flex:1, justifyContent:'center', alignItems:'center'}}/>
        ) : (
          <FlatList
          data= {groupItems}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          renderItem={({item, index}) => (
            <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ArticleScreen', {ItemGroup : item.name, customer : customer})}>
              <View>
                {/* <Text style={{fontWeight:'bold'}}>Group Name</Text> */}
                <Text style={{fontWeight:'bold'}}>{item.name}</Text>
                {/* <Text style={{fontWeight:'bold'}}>Parent Item Group</Text> */}
                <Text>{item.parent_item_group}</Text>
              </View>  
            </TouchableOpacity>
          )}
          />
        )}
      </View>
    );
  };

  return (
    <View style={{flex:1, justifyContent:"flex-start"}}>
      <View style={{marginTop:20, flex:1}}>
        <Text style={styles.header}>List of Group Items</Text>
        <Content style={styles.items}/>
      </View>
    </View>
  );
}

export default ItemGroupScreen;

const styles = StyleSheet.create({
  container:{
    flex:1,
    borderRadius:20,
    borderColor:'grey',
    marginLeft:20,
    marginRight:20
  },
  items: {
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,

  },
  item: {
    flex:1,
    widht:200,
    height:200,
    flexDirection:'row',
    backgroundColor:"#FFF",
    marginBottom:5,
    aspectRatio:1,
    margin:5,
    borderColor: 'grey',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
})