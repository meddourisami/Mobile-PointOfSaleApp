import {ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useSQLiteContext} from 'expo-sqlite';
import * as CryptoJS from 'crypto-js';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useSync} from '../../SyncContext';
import {transformData} from '../../helpers/helper';
import {Picker} from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useProfile} from "../../Contexts/ProfileContext";

const ArticleScreen = () => {
    const {token} = useSync();
    const isFocused = useIsFocused();
    const db = useSQLiteContext();
    const route = useRoute();
    const {ItemGroup, customer} = route.params || {};
    const navigation = useNavigation();
    const [selectedItems, setSelectedItems] = useState([]);
    const { userProfile } = useProfile();

    const Content = () => {
        const [items, setItems] = useState([]);
        const [filteredItems, setFilteredItems] = useState([]);
        const [searchQuery, setSearchQuery] = useState('');
        const [itemsGroups, setItemsGroups] = useState([]); // State for selected group
        const [selectedGroup, setSelectedGroup] = useState(null); // State for selected group
        const [loading, setLoading] = useState(true);


        const getHash = (data) => {
            return CryptoJS.MD5(JSON.stringify(data)).toString();
        };


        const transformJson = async (data) => {
            const keys = await data.message.keys;
            const values = await data.message.values;
            return await values.map(entry => {
                let obj = {};
                keys.forEach((key, index) => {
                    obj[key] = entry[index];
                });
                return obj;
            });
        };

        const getItemsGroups = async () => {
            try {
                const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.reportview.get',
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "doctype": "Item Group",
                            "fields": [
                                "`tabItem Group`.`name`",
                                "`tabItem Group`.`owner`",
                                "`tabItem Group`.`_user_tags`",
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
                if (response.ok === true) {
                    const groups = await response.json();
                    const transformedGroups = transformData(groups)
                    setItemsGroups(transformedGroups)
                } else {
                    throw new Error('No items groups');
                }
            } catch (e) {
                console.log("error items groups", e);
            }
        }
        const getApiItems = async () => {
            try {
                const today = new Date();
                const monthAgo = new Date();
                monthAgo.setMonth(today.getMonth() - 1);

                console.log(userProfile , 'userProfile from articles');
                // const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.query_report.run',
                const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.query_report.run',
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': token,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "report_name": "Stock Balance",
                            "filters": {
                                "company": userProfile.company,
                                "from_date": monthAgo.toISOString().split('T')[0],
                                "to_date": today.toISOString().split('T')[0],
                                "warehouse": userProfile.warehouse,
                                "valuation_field_type": "Currency"
                            },
                            "ignore_prepared_report": true,
                            "are_default_filters": false,
                            "_": Date.now()
                        }),
                    }
                );
                if (response.ok) {
                    const json = await response.json();
                    const stockBalances = json.message.result;
                    const filteredStockBalances = stockBalances.filter(item => !Array.isArray(item));

                    const ItemsNames = [];
                    filteredStockBalances.map((stockBalance) => {
                        ItemsNames.push(stockBalance.item_code);
                    });

                    filteredStockBalances.map((stockBalance) => {
                        const stockDetails = {
                            bal_qty: stockBalance.bal_qty,
                            bal_val: stockBalance.bal_val,
                        };
                    });
                    // const ItemsResponse = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.reportview.get',
                    const ItemsResponse = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.reportview.get',
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': token,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                "doctype": "Item",
                                "fields": [
                                    "*"
                                ],
                                "filters": [
                                    ["Item", "name", "in", ItemsNames]
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
                    if (ItemsResponse.ok) {
                        const data = await ItemsResponse.json();
                        const itemsData = await transformJson(data);
                        const stockItems = itemsData.map(item => {
                            const stockDetail = filteredStockBalances.find(quantity => quantity.item_code === item.name);
                            return {
                                ...item,
                                bal_qty: stockDetail ? stockDetail.bal_qty : 0,
                                bal_val: stockDetail ? stockDetail.bal_val : 0
                            };
                        });

                        await Promise.all(stockItems.map(async (item) => {
                            await db.runAsync(`DELETE FROM Item WHERE name = ?;`, [item.name]);
                        }));

                        await saveInLocalItems(stockItems);
                    } else {
                        console.log("error getting stock balance report", e);
                        throw new Error('stock balance report request failed');
                    }
                }
            } catch (e) {
                console.log("error getting items", e);
                Alert.alert("Error", "Failed fetching list of Items");
            }
        };

        async function insertItem(item) {
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
        }

        const insertUpdatedItem = async (apiData) => {
            try {
                const apiDataHash = getHash(apiData);

                // Fetch the existing hash from the local database
                const result = await db.runAsync('SELECT hash FROM Item WHERE name = ? ;', [apiData.name]); // WHERE id = ?', [apiData.id);

                const localHash = result.length > 0 ? result[0].hash : null;

                if (apiDataHash !== localHash) {
                    // Insert or update only if the hash is different
                    await insertItem(apiData)
                    return true; // Indicates an update was made
                }
                return false; // No update needed
            } catch (error) {
                console.error('Error updating Items with hash comparison:', error);
                return false;
            }
        };

        const saveInLocalItems = async (items) => {
            try {
                await Promise.all(items.map(async (item) => {
                    await insertUpdatedItem(item);
                }));
            } catch (e) {
                console.log("error saving items in local", e);
            }
        };

        const getLocalItems = async () => {
            try{
                const localItems= await db.getAllAsync(`SELECT * FROM Item;`);
                setItems(localItems);
                setFilteredItems(localItems)
            }catch(e){
                console.log("Error fetching all Items",e);
            }
        };
        useEffect(() => {
            getApiItems();
        }, []);

        useEffect(() => {
            if (filteredItems.length === 0) {
                setLoading(false)
            }
        }, [filteredItems]);

        useEffect(() => {
            getLocalItems();
            getItemsGroups()

        }, []);

        useEffect(() => {
            if (items.length > 0) {
                setFilteredItems(items);
            }
        }, [items]);


        useEffect(() => {
            if (searchQuery === '' && selectedGroup === null) {
                setFilteredItems(items);
            } else {
                const filtered = items.filter(item => {
                    const matchesGroup = selectedGroup ? item.item_group === selectedGroup : true;
                    const matchesSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.name.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesSearch && matchesGroup;
                });
                setFilteredItems(filtered);
            }
        }, [searchQuery, selectedGroup]);

        return (
            <View>
                <TextInput
                    placeholder="Search Articles"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={{
                        height: 40,
                        borderColor: '#ccc',
                        borderWidth: 1,
                        borderRadius: 10,
                        marginBottom: 10,
                        paddingHorizontal: 10
                    }}
                />
                {/* Picker for Group Selection */}
                {itemsGroups.length !== 0 ? (
                    <Picker
                        selectedValue={selectedGroup}
                        onValueChange={(itemValue) => setSelectedGroup(itemValue)}
                        style={{height: 50, width: '100%', marginBottom: 10}}
                    >
                        <Picker.Item label="All Groups" value={null}/>
                        {itemsGroups.map((group) => (
                            <Picker.Item key={group.name} label={group.name} value={group.name}/>
                        ))}
                    </Picker>) : (<View></View>)}

                {filteredItems.length === 0 || loading === true ? (
                    <ActivityIndicator size="large" color="#284979"
                                       style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}/>
                ) : (
                    <FlatList
                        data={filteredItems}
                        keyExtractor={(item) => (item.name).toString()}
                        renderItem={({item}) => {
                            const defaultImage = "https://t3.ftcdn.net/jpg/04/84/88/76/360_F_484887682_Mx57wpHG4lKrPAG0y7Q8Q7bJ952J3TTO.jpg";
                            const imageUrl = item.image ? item.image : defaultImage;
                            return (
                                <View key={item.key} style={styles.articleCard}>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('ArticleDetails', {article: item.name})}>
                                        <View style={styles.articleContent}>
                                            <Image
                                                source={{uri: imageUrl}}
                                                style={styles.articleImage}
                                            />
                                            <View style={styles.articleDetails}>
                                                <Text
                                                    style={styles.articleTitle}>{item.name} - {item.item_name}</Text>
                                                <Text style={styles.articleStock}>Group: {item.item_group}</Text>
                                                <Text style={styles.articleStock}>In Stock: {item.bal_qty}</Text>
                                                <View style={styles.articlePrice}>
                                                    <Text style={styles.articleStock}>Prix de vente: </Text>
                                                    <Text style={{
                                                        fontSize: 16,
                                                        color: '#FF6B35'
                                                    }}> {item.standard_rate}</Text>
                                                    <Text> ({userProfile.currency})</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                    <MaterialCommunityIcons
                                        name="cart-plus"
                                        size={30}
                                        color="#FF6B35"
                                        style={styles.addToCartIcon}
                                        onPress={() => handleAddItemToCart(item)}
                                    />
                                </View>
                            );
                        }}
                    />
                )}
            </View>
        );
    };


    const addItemToCart = async (item) => {
        const isItemInCart = selectedItems.some(existingItem => existingItem.name === item.name);

        if (isItemInCart) {
            Alert.alert("Article already in cart", "This article is already in the cart.");
            return;
        }
        setSelectedItems((prevSelectedItems) => [...prevSelectedItems, item]);
    };

    const handleAddItemToCart = async (item) => {
        try {
            await addItemToCart(item);
        } catch (e) {
            console.log("error adding item to cart", e);
        }
    };

    const calculateTotalPrice = () => {
        return selectedItems.reduce((total, item) => total + item.standard_rate, 0);
    };

    const handleClearSelectedItems = () => {
        setSelectedItems([]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Liste des articles</Text>

            <View style={styles.articlesContainer}>
                <Content/>
            </View>
            <View>
                {selectedItems && selectedItems.length > 0 && (
                    <View style={styles.selectedItemsContainer}>

                        <TouchableOpacity
                            style={styles.cartButton}
                            onPress={() => navigation.navigate('Cart', {
                                selectedItems: selectedItems,
                                customer: customer
                            })}
                        >
                            <Text style={styles.cartButtonText}>
                                {`Items: ${selectedItems.length}, Total: ${calculateTotalPrice().toFixed(2)} (${userProfile.currency})`}
                            </Text>
                            <Ionicons name="close-outline" size={24}
                                      style={{justifyContent: 'flex-end', marginLeft: 20}} color="white"
                                      onPress={handleClearSelectedItems}/>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            {/* <View>
                <AntDesign
                name="pluscircle"
                size={35}
                color="#284979"
                style={styles.icon}
                onPress={() => navigation.navigate('AddArticleScreen')}
                />
            </View> */}
        </View>
    );
}

export default ArticleScreen;

const styles = StyleSheet.create({
    icon: {
        position: 'absolute',
        justifyContent: 'flex-end',
        bottom: 10,
        right: 10,
        marginBottom: 10,
        zIndex: 10,
    },
    iconCart: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        marginBottom: 30,
    },
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#F8F9FA',
    },
    header: {
        fontSize: 24,
        color: '#333',
        marginBottom: 10,
    },
    cartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    articlesContainer: {
        flex: 1,
        marginBottom: 70,
    },
    articleCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: 15,
        marginVertical: 5,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    articleContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    articleImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 10,
    },
    articleDetails: {
        justifyContent: 'center',
    },
    articleTitle: {
        fontSize: 16,
        // fontWeight: 'bold',
        color: '#333',
    },
    articleStock: {
        fontSize: 14,
        color: '#606060',
    },

    articlePrice: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    addToCartIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginRight: 10,
    },
    selectedItemsContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#666',
        padding: 10,
        borderRadius: 15,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cartButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 20,
        marginLeft: 10,
    },
})