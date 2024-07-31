import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import * as CryptoJS from 'crypto-js';
import { AntDesign } from '@expo/vector-icons';

const ArticleScreen = () => {
    const isFocused = useIsFocused();
    const db = useSQLiteContext();
    const route = useRoute();
    const { ItemGroup } = route.params || {};
    const navigation = useNavigation();

    const Content = () => {
        const [items, setItems] = useState([]);
        const [articles, setArticles] = useState([]);

        const getHash = (data) => {
            return CryptoJS.MD5(JSON.stringify(data)).toString();
        };

        const createMetadataTable = async () => {
            await db.runAsync(`
                CREATE TABLE IF NOT EXISTS ItemMetadata (
                    id INTEGER PRIMARY KEY,
                    data_hash TEXT
                );
            `);
            const rowCount = await db.runAsync('SELECT COUNT(*) as count FROM ItemMetadata;');
            if (rowCount.count === 0) {
                await db.runAsync('INSERT INTO ItemMetadata (id, data_hash) VALUES (1, "");');
            }
        };

        const getItemsFromApi = async () =>{
            try{
                const response = await fetch('http://195.201.138.202:8006/api/resource/Item?fields=["*"]', {
                        method: 'GET',
                        headers: {
                            'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
                        },
                    });

                const json = await response.json();
                //console.log(json.data);

                const newHash = getHash(json.data);

                const existingHash = await db.runAsync('SELECT data_hash FROM CustomerMetadata WHERE id = 1;');

                if (existingHash !== newHash) {

                    await Promise.all(items.map(async (item) => {
                        await db.runAsync(`DELETE FROM Items WHERE name = ?;`, [item.name]);
                    }));

                    await saveInLocalItems(json.data);
                    setItems(json.data);
                }
                return json.data;
            } catch(e){
                console.log("error getting items", e);
            }
        };

        const saveInLocalItems = async (items) => {
            try{
                await Promise.all(items.map(async (item) => {
                    await db.runAsync(`INSERT OR REPLACE INTO Items(
                            name, item_code, item_name, item_group, stock_uom,
                            opening_stock, description, last_purchase_rate, country_of_origin, custom_invoicing_unit_price,
                            custom_unit_purchase_price, custom_wholesale_unit_selling_price
                        ) VALUES (
                            ?, ?, ?, ?, ?,
                            ?, ?, ?, ?, ?,
                            ?, ?
                        )`,
                        [
                            item.name, item.item_code, item.item_name ,item.item_group, item.stock_uom,
                            item.opening_stock, item.description, item.last_purchase_rate, item.country_of_origin, item.custom_invoicing_unit_price,
                            item.custom_unit_purchase_price, item.custom_wholesale_unit_selling_price
                        ]
                    )
                }));
            } catch(e){
                console.log("error saving items in local", e);
            }
        };

        // const syncDataWithServer = async (item) => {
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
        //         } = client;

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

        const getItems = async () => {
            try{
                const allArticles = await db.getAllAsync(`SELECT * FROM Items;`);
                //console.log(allArticles);
                setArticles(allArticles);
            }catch(e){
                console.log("error getting items from database", e);
            }
        };

        const getItemsByGroup = async (item_group) => {
            try{
                const articlesByGroup = await db.getAllAsync(`SELECT * FROM Items WHERE item_group = ?`,[item_group]);
                //console.log(articlesByGroup);
                setArticles(articlesByGroup);
            }
            catch(e){
                console.log("error getting items by group", e);
            };
        };

        useEffect(()=>{
            if(isFocused){
                //createMetadataTable();
                getItemsFromApi();
                    if(ItemGroup){
                        getItemsByGroup(ItemGroup);
                    }else{
                        getItems();
                    }
                }
        }, [isFocused, ItemGroup]);

        useEffect(() => {
            if (articles && !ItemGroup) {
              getItems();
            }
          }, [articles, ItemGroup]);

        // useEffect(() =>{
        //     if(articles){
        //         getItems();
        //     }
        // },[articles]);

        return(
            <View>
                {articles.length === 0 ? (
                        <Text>No data yet.</Text>
                    ) : (
                        <FlatList
                            data={articles}
                            keyExtractor= {(item) => item.name}
                            renderItem={({item}) => (
                                <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10, backgroundColor: "#FFF"}}>
                                    <TouchableOpacity>
                                        <Text>
                                            {item.item_name} - {item.item_group}
                                        </Text>
                                        <Text>On Stock {item.opening_stock}</Text>
                                        <Text>Prix de vente : {item.custom_invoicing_unit_price}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{justifyContent:'flex-end', alignItems: 'center', backgroundColor:"#E59135", height:20, marginRight:10}}>
                                        <Text style={{color:"#FFF"}}>Add to cart</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    )}
            </View>
        );
    };
  return (
    <View>
        <Text style={{fontSize:24}}>Liste des articles</Text>
            <View>
                <Content />
            </View>
            <AntDesign 
                name="pluscircle" 
                size={35} 
                color="#284979" 
                style={styles.icon} 
                onPress={() => navigation.navigate('AddArticleScreen')}
            />
    </View>
  );
}

export default ArticleScreen

const styles = StyleSheet.create({
    icon: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        marginBottom:30,
    },
})