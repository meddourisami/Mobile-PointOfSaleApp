import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import * as CryptoJS from 'crypto-js';
import { AntDesign } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';

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
        const [searchQuery, setSearchQuery] = useState('');

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
            const rowCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM ItemMetadata;');
            if (rowCount.count === 0) {
                await db.runAsync('INSERT INTO ItemMetadata (id, data_hash) VALUES (1, "");');
            }
        };

        function transformJson(data) {
            const keys = data.message.keys;
            const values = data.message.values;
            return values.map(entry => {
                let obj = {};
                keys.forEach((key, index) => { obj[key] = entry[index]; });
                return obj; 
            }); 
        };    

        const getItemsFromApi = async () =>{
            try{
                // const response = await fetch('http://195.201.138.202:8006/api/resource/Item?fields=["*"]', {
                //         method: 'GET',
                //         headers: {
                //             'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
                //         },
                //     });
                // const response = await fetch('http://192.168.100.6:8002/api/resource/Item?fields=["*"]', {
                //     method: 'GET',
                //     headers: {
                //         'Authorization': 'token 94c0faa6066a7c0:982654458dc9011',
                //     },
                // });

                // const json = await response.json();

                response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.query_report.run',
                //  response = await fetch('http://192.168.1.12:8002/api/method/frappe.desk.query_report.run',
                    {
                        method: 'POST',
                        headers: {
                            Authorization: 'token 94c0faa6066a7c0:982654458dc9011',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "report_name": "Stock Balance",
                            "filters": {
                              "company": "Ites Company (Demo)",
                              "from_date": "2024-07-22",
                              "to_date": "2024-08-22",
                              "warehouse": "Magasin Fille 1 - ICD",
                              "valuation_field_type": "Currency"
                            },
                            "ignore_prepared_report": false,
                            "are_default_filters": false,
                            "_": Date.now()
                          }),
                    }
                );
                const json = await response.json();
                quantities = json.message.result;
                const filteredQuantities = quantities.filter(item => !Array.isArray(item));
    
                names= [];
                filteredQuantities.map((quantity) => {
                    names.push(quantity.item_code);
                });

                filteredQuantities.map((quantity) => {
                    stockDetails={
                        bal_qty: quantity.bal_qty,
                        bal_val: quantity.bal_val,
                    };
                });
                response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.reportview.get',
                //  response = await fetch('http://192.168.1.12:8002/api/method/frappe.desk.reportview.get', 
                    {
                        method: 'POST',
                        headers: {
                            Authorization: 'token 94c0faa6066a7c0:982654458dc9011',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "doctype": "Item",
                            "fields": [
                            "*"
                            ],
                            "filters": [
                                ["Item", "name", "in", names]
                            ],
                            "order_by": "`tabItem`.`modified` desc",
                            "start": 0,
                            "page_length": 20,
                            "view": "List",
                            "group_by": "",
                            "with_comment_count": 1
                              
                        }),
                    }
                );
                const data = await response.json();
                const selectedItems = transformJson(data);
                
                const stockItems = selectedItems.map(item => {
                    const stockDetail = filteredQuantities.find(quantity => quantity.item_code === item.name);
                    return {
                        ...item,
                        bal_qty: stockDetail ? stockDetail.bal_qty : 0,
                        bal_val: stockDetail ? stockDetail.bal_val : 0
                    };
                });

                const newHash = getHash(stockItems);

                const existingHash = await db.getFirstAsync('SELECT data_hash FROM ItemMetadata WHERE id = 1;');
                if (existingHash.data_hash !== newHash) {

                    await Promise.all(stockItems.map(async (item) => {
                        await db.runAsync(`DELETE FROM Item WHERE name = ?;`, [item.name]);
                    }));

                    await saveInLocalItems(stockItems);
                    await db.runAsync('UPDATE ItemMetadata SET data_hash = ? WHERE id = 1;', [newHash]);
                    setItems(stockItems);
                }
                return stockItems;
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
                        default_manufacturer_part_no, total_projected_qty, _comment_count, bal_qty, bal_val
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
                        ?, ?, ?, ?, ?
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
                            item.default_manufacturer_part_no, item.total_projected_qty, item._comment_count, item.bal_qty, item.bal_val
                        ]
                    )
                }));
            } catch(e){
                console.log("error saving items in local", e);
            }
        };

        const getItems = async () => {
            try{
                const allArticles = await db.getAllAsync(`SELECT * FROM Item;`);
                setArticles(allArticles);
            }catch(e){
                console.log("error getting items from database", e);
            }
        };

        const getItemsByGroup = async (item_group) => {
            try{
                const articlesByGroup = await db.getAllAsync(`SELECT * FROM Item WHERE item_group = ?`,[item_group]);
                setArticles(articlesByGroup);
            }
            catch(e){
                console.log("error getting items by group", e);
            };
        };

        useEffect(()=>{
            if(isFocused){
                createMetadataTable();
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
                {/* <TextInput
                    placeholder="Search Articles"
                    value={searchQuery}
                    style={{
                        height: 40,
                        borderColor: '#ccc',
                        borderWidth: 1,
                        borderRadius: 10,
                        marginBottom: 10,
                        paddingHorizontal: 10
                    }}
                /> */}
                {articles.length === 0 ? (
                        <Text>No data yet.</Text>
                    ) : (
                        <FlatList
                            data={articles}
                            keyExtractor= {(item) => (item.name).toString()}
                            renderItem={({item}) => {
                                const defaultImage = "https://t3.ftcdn.net/jpg/04/84/88/76/360_F_484887682_Mx57wpHG4lKrPAG0y7Q8Q7bJ952J3TTO.jpg";
                                const imageUrl = item.image ? item.image : defaultImage;
                                    return (   
                                        <View style={{flexDirection:'row', height:100 , justifyContent:'space-between', marginBottom:10, backgroundColor: "#FFF", borderRadius:15, margin:5}}>
                                            <TouchableOpacity onPress={()=> navigation.navigate('ArticleDetails', {article:item.name})}>
                                                <View style={{flexDirection: 'row', alignItems:'center', justifyContent:'center'}}>
                                                    <Image
                                                        source={{ uri: imageUrl }} 
                                                        style={{ width: 80, height: 80, borderRadius: 10, marginRight: 10,  }} 
                                                    />
                                                    <View style={{justifyContent: 'center' }}>
                                                        <Text>
                                                            {item.item_name} - {item.item_group}
                                                        </Text>
                                                        <Text>On Stock {item.bal_qty}</Text>
                                                        <Text>Prix de vente : {item.standard_rate}</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{justifyContent:'flex-end', alignItems: 'center', backgroundColor:"#E59135", height:20, marginRight:10}} onPress={() => handleAddItemToCart(item)}>
                                                <Text style={{color:"#FFF"}}>Add to cart</Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                }}
                        />
                )}
            </View>
        );
    };

    const addItemToCart = async (item) => {
        const isItemInCart = selecteditems.some(existingItem => existingItem.name === item.name);

        if (isItemInCart) {
            Alert.alert("Article already in cart", "This article is already in the cart.");
            return;
        }
        setSelecteditems((prevSelectedItems) => [...prevSelectedItems, item]);
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

    const handleClearSelectedItems = () => {
        setSelecteditems([]);
    };

  return (
    <View style={styles.container}>
        <Text style={{fontSize:24}}>Liste des articles</Text>
            <View>
            {selecteditems && selecteditems.length > 0 && (
                <TouchableOpacity
                style={styles.cartButton}
                onPress={() => navigation.navigate('Cart', { selectedItems : selecteditems , customer: customer })}
                >
                    <Text style={{ color: '#FFF', fontSize: 18, marginLeft:30 }}>
                        {`Items: ${selecteditems.length}, Total: DA ${calculateTotalPrice().toFixed(2)}`}
                    </Text>
                    <Ionicons name="close-outline" size={24} color="white" onPress={handleClearSelectedItems}/>
                </TouchableOpacity>
            )}
            </View>
            <View style={styles.contentContainer}>
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
    </View>
  );
}

export default ArticleScreen;

const styles = StyleSheet.create({
    icon: {
        position: 'absolute',
        justifyContent:'flex-end',
        bottom: 10,
        right: 10,
        marginBottom:10,
        zIndex:10,
    },
    iconCart: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        marginBottom:30,
    },
    container: {
        flex: 1,
        padding: 0,
        position: 'relative',
    },
    headerText: {
        fontSize: 24,
        marginBottom: 10,
    },
    cartButton: {
        backgroundColor: '#284979',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent:'space-between',
    },
    cartButtonText: {
        color: '#FFF',
        fontSize: 18,
    },
    contentContainer: {
        flex: 1,
        marginBottom: 60,
    },
})