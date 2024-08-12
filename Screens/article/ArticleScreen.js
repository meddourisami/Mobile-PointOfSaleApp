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
    const { ItemGroup, customer } = route.params || {};
    const navigation = useNavigation();
    const [selecteditems, setSelecteditems] = useState([]);

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
                        await db.runAsync(`DELETE FROM Item WHERE name = ?;`, [item.name]);
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
                    await db.runAsync(`INSERT OR REPLACE INTO Item(
                        name, owner, creation, modified,
                        modified_by, docstatus, idx, naming_series, item_code,
                        item_name, item_group, stock_uom, disabled, allow_alternative_item,
                        is_stock_item, has_variants, opening_stock, valuation_rate, standard_rate,
                        is_fixed_asset, auto_create_assets, is_grouped_asset, asset_category, asset_naming_series,
                        over_delivery_receipt_allowance, over_billing_allowance, image, description, brand,
                        shelf_life_in_days, end_of_life, default_material_request_type, valuation_method, warranty_period,
                        weight_per_unit, weight_uom, allow_negative_stock, has_batch_no, create_new_batch,
                        batch_number_series, has_expiry_date, retain_sample, sample_quantity, has_serial_no,
                        serial_no_series, variant_of, variant_based_on, enable_deferred_expense, no_of_months_exp,
                        enable_deferred_revenue, no_of_months, purchase_uom, min_order_qty, safety_stock,
                        is_purchase_item, lead_time_days, last_purchase_rate, is_customer_provided_item, customer,
                        delivered_by_supplier, country_of_origin, customs_tariff_number, sales_uom, grant_commission,
                        is_sales_item, max_discount, inspection_required_before_purchase, quality_inspection_template, inspection_required_before_delivery,
                        include_item_in_manufacturing, is_sub_contracted_item, default_bom, customer_code, default_item_manufacturer,
                        default_manufacturer_part_no, total_projected_qty, _comment_count
                    ) VALUES (
                        ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?
                    )`,
                        [
                            item.name, item.owner, item.creation, item.modified,
                            item.modified_by, item.docstatus, item.idx, item.naming_series, item.item_code,
                            item.item_name, item.item_group, item.stock_uom, item.disabled, item.allow_alternative_item,
                            item.is_stock_item, item.has_variants, item.opening_stock, item.valuation_rate, item.standard_rate,
                            item.is_fixed_asset, item.auto_create_assets, item.is_grouped_asset, item.asset_category, item.asset_naming_series,
                            item.over_delivery_receipt_allowance, item.over_billing_allowance, item.image, item.description, item.brand,
                            item.shelf_life_in_days, item.end_of_life, item.default_material_request_type, item.valuation_method, item.warranty_period,
                            item.weight_per_unit, item.weight_uom, item.allow_negative_stock, item.has_batch_no, item.create_new_batch,
                            item.batch_number_series, item.has_expiry_date, item.retain_sample, item.sample_quantity, item.has_serial_no,
                            item.serial_no_series, item.variant_of, item.variant_based_on, item.enable_deferred_expense, item.no_of_months_exp,
                            item.enable_deferred_revenue, item.no_of_months, item.purchase_uom, item.min_order_qty, item.safety_stock,
                            item.is_purchase_item, item.lead_time_days, item.last_purchase_rate, item.is_customer_provided_item, item.customer,
                            item.delivered_by_supplier, item.country_of_origin, item.customs_tariff_number, item.sales_uom, item.grant_commission,
                            item.is_sales_item, item.max_discount, item.inspection_required_before_purchase, item.quality_inspection_template, item.inspection_required_before_delivery,
                            item.include_item_in_manufacturing, item.is_sub_contracted_item, item.default_bom, item.customer_code, item.default_item_manufacturer,
                            item.default_manufacturer_part_no, item.total_projected_qty, item._comment_count
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
                const allArticles = await db.getAllAsync(`SELECT * FROM Item;`);
                //console.log(allArticles);
                setArticles(allArticles);
            }catch(e){
                console.log("error getting items from database", e);
            }
        };

        const getItemsByGroup = async (item_group) => {
            try{
                const articlesByGroup = await db.getAllAsync(`SELECT * FROM Item WHERE item_group = ?`,[item_group]);
                //console.log(articlesByGroup);
                setArticles(articlesByGroup);
            }
            catch(e){
                console.log("error getting items by group", e);
            };
        };

        // const addItemToCart = async (item) => {
        //     setSelecteditems((selecteditems) => [...selecteditems, item]);
        // };

        // const handleAddItemToCart = async (item) => {
        //     try {
        //         await addItemToCart(item);
        //     } catch (e) {
        //         console.log("error adding item to cart", e);
        //     }
        // };

        // const calculateTotalPrice = () => {
        //     return selectedIiems.reduce((total, item) => total + item.custom_invoicing_unit_price, 0);
        // };

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
                                <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10, backgroundColor: "#FFF", borderRadius:15, margin:5}}>
                                    <TouchableOpacity >
                                        <Text>
                                            {item.item_name} - {item.item_group}
                                        </Text>
                                        <Text>On Stock {item.opening_stock}</Text>
                                        <Text>Prix de vente : {item.standard_rate}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{justifyContent:'flex-end', alignItems: 'center', backgroundColor:"#E59135", height:20, marginRight:10}} onPress={() => handleAddItemToCart(item)}>
                                        <Text style={{color:"#FFF"}}>Add to cart</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    )}
            </View>
        );
    };

    const addItemToCart = async (item) => {
        setSelecteditems((selecteditems) => [...selecteditems, item]);
    };

    const handleAddItemToCart = async (item) => {
        try {
            await addItemToCart(item);
        } catch (e) {
            console.log("error adding item to cart", e);
        }
    };

    const calculateTotalPrice = () => {
        return selecteditems.reduce((total, item) => total + item.standard_rate, 0);
    };

  return (
    <View>
        <Text style={{fontSize:24}}>Liste des articles</Text>
            <View>
                <Content />
            </View>
            <View>
                <AntDesign 
                name="pluscircle" 
                size={35} 
                color="#284979" 
                style={styles.icon} 
                onPress={() => navigation.navigate('AddArticleScreen')}
                />
            </View>
            {selecteditems.length > 0 && (
                <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    backgroundColor: '#284979',
                    padding: 15,
                    borderRadius: 5,
                    alignItems: 'center',
                }}
                onPress={() => navigation.navigate('Cart', { selectedItems : selecteditems , customer: customer })}
                >
                    <Text style={{ color: '#FFF', fontSize: 18 }}>
                        {`Items: ${selecteditems.length}, Total: $${calculateTotalPrice().toFixed(2)}`}
                    </Text>
                </TouchableOpacity>
            )}
    </View>
  );
}

export default ArticleScreen;

const styles = StyleSheet.create({
    icon: {
        position: 'absolute',
        justifyContent:'flex-end',
        bottom: 30,
        right: 30,
        marginBottom:30,
    },
    iconCart: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        marginBottom:30,
    },
})