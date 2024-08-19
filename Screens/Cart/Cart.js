import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useRoute } from '@react-navigation/native';
import * as CryptoJS from 'crypto-js';
import { useSQLiteContext } from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';

const Cart = ({navigation}) => {
    const route = useRoute();
    const { selectedItems, customer } = route.params || {};
    const isFocused = useIsFocused();
    const db = useSQLiteContext();

    const [cartItems, setCartItems] = useState(selectedItems);
    const [quantities, setQuantities] = useState({});
    const [taxes, setTaxes] = useState([]);
    const [charges, setCharges] = useState([]);
    const [selectedTax, setSelectedTax] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clients, setClients] = useState([]);
    const [updatedTaxes, setUpdatedTaxes] = useState([]);

    const handleRemoveItem = (itemToRemove) => {
        setCartItems(cartItems.filter(item => item.name !== itemToRemove.name));
    };

    const handleQuantityChange = (item, change) => {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [item.name]: prevQuantities[item.name] + change
        }));
    };

    const calculateTotalQuantity = (quantities) => {
        return Object.values(quantities).reduce((total, quantity) => total + quantity, 0);
    }

    const calculateTotalPrice = () => {
        let total=cartItems.reduce((total, item) => (total + (item.standard_rate * quantities[item.name])),0);
        if (selectedTax) {
            total += total * (getTaxRate(selectedTax) / 100);
        }
        return total.toFixed(2);
    };  

    const calculateTotalPriceWithoutTax = () => {
        let total=cartItems.reduce((total, item) => (total + (item.standard_rate * quantities[item.name])), 0);
        return total.toFixed(2);
    };

    const calculateTaxAmount = () => {
        return (calculateTotalPrice() - calculateTotalPriceWithoutTax());
    };

    const calculateTaxAmountPerItem = (item) => {
        return (calculateTotalPricePerItem(item) * (getTaxRate(selectedTax)/100));
    }

    const calculateRoudingAdjustment  = (number) => {
        if (Number.isInteger(number)) {
            return 0;
        }
        const decimalPart = number - Math.round(number);
        return -decimalPart;
    };

    const calculateRoundedTotal = (number) => {
        return Math.round(number);
    };

    const calculateTotalPricePerItem = (item) => {
        return (item.standard_rate * quantities[item.name]);
    }

    const getTaxRate = (tax) => {
        const match = tax.title.match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
    }

    useEffect(() => {
        const initialQuantities = {};
        selectedItems.forEach(item => {
            initialQuantities[item.name] = 1;
        });
        setQuantities(initialQuantities);
    }, [selectedItems]);

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

    function transformJson(data) { const keys = data.message.keys; const values = data.message.values; return values.map(entry => { let obj = {}; keys.forEach((key, index) => { obj[key] = entry[index]; }); return obj; }); }

    const getTaxesfromAPI = async () => {
        // const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.reportview.get', {
        //     method: 'POST',
        //     headers: {
        //         'Authorization': 'token 94c0faa6066a7c0:982654458dc9011',
        //     },
        //     body: {
        //         "doctype": "Sales Taxes and Charges Template",
        //         "fields": ["*"],
        //         "filters": [],
        //         "order_by": "`tabSales Taxes and Charges Template`.`modified` asc",
        //         "start": 0,
        //         "page_length": 20,
        //         "view": "List",
        //         "group_by": null,
        //         "with_comment_count": 1
        //     }
        // });

        // const json = await response.json();
        // console.log(transformJson(json));
        //console.log("jkù",json);
        try{
            // const response = await fetch('http://195.201.138.202:8006/api/resource/Sales Taxes and Charges Template?fields=["*"]', {
            //     method: 'GET',
            //     headers: {
            //         'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
            //     },
            // });
            const response = await fetch('http://192.168.100.6:8002/api/resource/Sales Taxes and Charges Template?fields=["*"]', {
                method: 'GET',
                headers: {
                    'Authorization': 'token 94c0faa6066a7c0:982654458dc9011',
                },
            });

            const json = await response.json();
            console.log(json);
            
            const newHash = getHash(json.data);

            const existingHash = await db.runAsync('SELECT data_hash FROM TaxesMetadata WHERE id = 1;');
            if (existingHash !== newHash) {

                await Promise.all(taxes.map(async (tax) => {
                    await db.runAsync(`DELETE FROM Tax_Categories WHERE name = ?;`, [tax.name]);
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
              await db.runAsync(`INSERT OR REPLACE INTO Tax_Categories
                (
                    name, creation, modified, modified_by, owner,
                    docstatus, idx, title, is_default, disabled,
                    company, tax_category, user_tags, _comments, _assign,
                    _liked_by
                ) VALUES (
                  ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?,
                  ?)`,
                [
                    tax.name, tax.creation, tax.modified, tax.modified_by, tax.owner,
                    tax.docstatus, tax.idx, tax.title, tax.is_default, tax.disabled,
                    tax.company, tax.tax_category,  tax.user_tags, tax._comments, tax._assign,
                    tax._liked_by 
                ]
              );
            }));
        }catch(e){
            console.log('Error saving taxes to local database', e);
        }
    };

    const getTaxes = async () => {
        try{
            const allTaxes = await db.getAllAsync(`SELECT * FROM Tax_Categories WHERE company="Ites Company (Demo)";`);
            console.log(allTaxes);
            setCharges(allTaxes);
        }catch(e){
            console.log("error retreiving taxes", e);
        }
    };

    const generateRandomName = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < 10; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };

    function generateItemTaxDetail(items) {
        const itemWiseTaxDetail = {};
        items.forEach((item, index) => {
            itemWiseTaxDetail[item.name] = [getTaxRate(selectedTax), calculateTaxAmountPerItem(item)];
        });
        return JSON.stringify(itemWiseTaxDetail);
    };

    function formatAccountHead(input) {
        // Regular expression to match the pattern "VAT 18% - ICD"
        const regex = /VAT \d+% - ICD/;
        const match = input.match(regex);
        return match ? match[0] : null;
    };

    const saveSalesOrder = async() => {
        try{
            let currentCustomer = customer;
            if(!currentCustomer){
                currentCustomer = selectedClient;
            }
            const currentDate = new Date();
            const salesOrderName = 'new-sales-order-'+generateRandomName();
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
                    salesOrderName, "Administrator",
                    0, currentCustomer.name, "SAL-ORD-"+currentDate.getFullYear()+"-", currentCustomer.name,
                    currentCustomer.name, "Sales", currentDate.toISOString().split('T')[0], currentDate.toISOString().split('T')[0],
                    "Ites Company (Demo)", 0, "TND", "Standard Selling", ///TODO API COMPANY --------------------- "Saadi", 0, "DA", "Standard Selling" 
                    "Magasin Fille 1 - ICD", //TODO API WAREHOUSE -------------------- "Entropot 1  - TH"
                    calculateTotalQuantity(quantities), 0, calculateTotalPriceWithoutTax(), calculateTotalPriceWithoutTax(),
                    calculateTotalPriceWithoutTax(), calculateTotalPriceWithoutTax(), "", selectedTax.name,
                    calculateTaxAmount(), calculateTaxAmount(), calculateTotalPrice(),
                    calculateRoudingAdjustment(calculateTotalPrice()), calculateRoundedTotal(calculateTotalPrice()), "", calculateTotalPrice(), calculateRoudingAdjustment(calculateTotalPrice()),
                    0, "", 0, 0, "Grand Total",
                    0, 0,
                    currentCustomer.custom_address, currentCustomer.custom_group, currentCustomer.territory,
                    "Draft", "Not Delivered",
                    "Not Billed",
                    calculateTotalPriceWithoutTax(),
                    0,
                    "en", 0, // TODO API LANGUANGE --------------- "fr"
                    "TND" // TODO API CURRENCY GET ALL ------------ "DA"
                ]);

            await Promise.all(selectedItems.map(async (item)=> {
                const sales_order_ItemName = 'new-sales-order-item-'+generateRandomName();
                await db.runAsync(`INSERT INTO Sales_Order_Item(
                        name, parent, parentfield, parenttype, idx,
                        item_code, item_name, description, qty, stock_uom,
                        rate, amount, base_rate, base_amount, warehouse,
                        delivered_qty, billed_amt, pending_qty,
                        delivered_by_supplier, conversion_factor, pricing_rule, discount_percentage, gross_profit
                    ) VALUES (
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?,
                        ?, ?, ?, ?, ?
                    )`,
                    [
                        sales_order_ItemName, salesOrderName, "items", "Sales Order", 1,
                        item.item_code, item.item_name, item.description, quantities[item.name], item.stock_uom,
                        item.standard_rate, calculateTotalPricePerItem(item), item.standard_rate, calculateTotalPricePerItem(item), "Magasin Fille 1 - ICD", ///TODO API WAREHOUSE ------------ Entropot 1  - TH
                        0, 0, 0,
                        0, 1, "", 0, 0
                    ]);
                }));
               
            const sales_Taxes_and_ChargesName= 'new-sales-taxes-and-charges'+generateRandomName();
            await db.runAsync(`INSERT INTO Sales_Taxes_and_Charges(
                    name, owner,
                    docstatus, idx, charge_type, row_id, account_head,
                    description, included_in_print_rate, included_in_paid_amount, cost_center, rate,
                    account_currency, tax_amount, total, tax_amount_after_discount_amount, base_tax_amount,
                    base_total, base_tax_amount_after_discount_amount, item_wise_tax_detail, dont_recompute_tax, parent,
                    parentfield, parenttype
                ) VALUES (
                    ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?
                )`,
                [
                    sales_Taxes_and_ChargesName, "Administrator",
                    0, 1, "On Net Total", null, formatAccountHead(selectedTax.name),
                    selectedTax.name, 0, 0, "", getTaxRate(selectedTax),
                    null, calculateTaxAmount(), calculateTotalPrice(), calculateTaxAmount(), calculateTaxAmount(),
                    calculateTotalPrice(), calculateRoundedTotal(), generateItemTaxDetail(selectedItems, selectedTax), 0, salesOrderName,
                    "taxes", "Sales Order"
                ]);
        }catch(e){
            console.log('Error saving sales order', e);
        }
    };

    const handleSaveSaleOrder = () => {
        try{
            saveSalesOrder();
            navigation.navigate('CommandeScreen');
            Alert.alert('Saving sales order..');
        }catch(e){
            Alert.alert('Error saving sales order..');
            console.log('Error saving sales order', e);
        }
    };

    // const saveQuotation = async () => {
    //     try{
    //         const quotationName = 'new-sales-order-'+generateRandomName();
    //         console.log(salesOrderName);
    //         await db.runAsync(`INSERT INTO Sales_Order(
    //             name, owner,
    //             docstatus, title, naming_series, customer,
    //             customer_name, order_type, transaction_date, delivery_date, 
    //             company, skip_delivery_note, currency, selling_price_list,
    //             set_warehouse,
    //             total_qty, total_net_weight, base_total, base_net_total,
    //             total, net_total, tax_category, taxes_and_charges,
    //             base_total_taxes_and_charges, total_taxes_and_charges, base_grand_total,
    //             base_rounding_adjustment, base_rounded_total, base_in_words, grand_total, rounding_adjustment,
    //             rounded_total, in_words, advance_paid, disable_rounded_total, apply_discount_on,
    //             base_discount_amount, discount_amount,
    //             customer_address, customer_group, territory,
    //             status, delivery_status,
    //             billing_status,
    //             amount_eligible_for_commission,
    //             group_same_items,
    //             language, is_internal_customer,
    //             party_account_currency
    //         ) VALUES (
    //             ?, ?,
    //             ?, ?, ?, ?,
    //             ?, ?, ?, ?,
    //             ?, ?, ?, ?,
    //             ?,
    //             ?, ?, ?, ?,
    //             ?, ?, ?, ?,
    //             ?, ?, ?,
    //             ?, ?, ?, ?, ?,
    //             ?, ?, ?, ?, ?,
    //             ?, ?,
    //             ?, ?, ?,
    //             ?, ?,
    //             ?,
    //             ?,
    //             ?,
    //             ?, ?,
    //             ?
    //         )`,
    //             [
    //                 quotationName, "Administrator",
    //                 0, customer.name, "SAL-ORD-YYYY", customer.name,
    //                 customer.name, "Sales Order", Date(), Date(),
    //                 "Saadi", 0, "DA", "Standard Selling",
    //                 "Entropot 1  - TH",
    //                 calculateTotalQuantity(quantities), 0, calculateTotalPriceWithoutTax(), calculateTotalPriceWithoutTax(),
    //                 calculateTotalPriceWithoutTax(), calculateTotalPriceWithoutTax(), "", selectedTax.name,
    //                 calculateTaxAmount(), calculateTaxAmount(), calculateTotalPrice(),
    //                 calculateRoudingAdjustment(calculateTotalPrice()), calculateRoundedTotal(calculateTotalPrice()), "", calculateTotalPrice(), calculateRoudingAdjustment(calculateTotalPrice()),
    //                 0, "", 0, 0, "Grand Total",
    //                 0, 0,
    //                 customer.custom_address, customer.custom_group, customer.territory,
    //                 "Draft", "Not Delivered",
    //                 "Not Billed",
    //                 calculateTotalPriceWithoutTax(),
    //                 0,
    //                 "fr", 0,
    //                 "DA"
    //             ]);

    //     }catch(e){
    //         console.log('Error saving quotation', e);
    //     }
    // };


    const handleSaveQuotation = () => {
        saveQuotation();
        saveQuotationItems();
        saveQuotation_Taxes_and_Charges();
        Alert.alert('Saving quotation..');
    };

    const getClients = async () => {
        try{
            const allClients = await db.getAllAsync(`SELECT * FROM Customers;`);
            setClients(allClients);
        }catch(e){
            console.log('Error retreiving clients', e);
        }
    };

    const getUpdatedTaxes = () => {
        setUpdatedTaxes([
            {
                "name": "Tunisia VAT 12% - ICD",
                "owner": "seif@gmail.com",
                "creation": "2024-07-05 11:14:01.904282",
                "modified": "2024-07-05 11:14:01.904282",
                "modified_by": "seif@gmail.com",
                "docstatus": 0,
                "idx": 0,
                "title": "Tunisia VAT 12%",
                "is_default": 0,
                "disabled": 0,
                "company": "Ites Company (Demo)",
                "tax_category": null
            },
            {
                "name": "Tunisia VAT 18% - ICD",
                "owner": "seif@gmail.com",
                "creation": "2024-07-05 11:14:01.617601",
                "modified": "2024-07-05 11:14:01.617601",
                "modified_by": "seif@gmail.com",
                "docstatus": 0,
                "idx": 76,
                "title": "Tunisia VAT 18%",
                "is_default": 1,
                "disabled": 0,
                "company": "Ites Company (Demo)",
                "tax_category": null
            },
            {
                "name": "Tunisia VAT 6% - ICD",
                "owner": "seif@gmail.com",
                "creation": "2024-07-05 11:14:02.091507",
                "modified": "2024-07-05 11:14:02.091507",
                "modified_by": "seif@gmail.com",
                "docstatus": 0,
                "idx": 0,
                "title": "Tunisia VAT 6%",
                "is_default": 0,
                "disabled": 0,
                "company": "Ites Company (Demo)",
                "tax_category": null
            }
        ]);
    };

    useEffect(() => {   
        if(isFocused){
            const initialize = async () => {
                createMetadataTable();
                getTaxesfromAPI();
                getTaxes();
                getUpdatedTaxes();
                getClients();
            };
            initialize();
        }
    }, [isFocused]);

    const CartItem = ({ item, onRemove, onQuantityChange }) => {
      return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1 }}>
                <Text>{item.item_name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => onQuantityChange(item, -1)}>
                        <Text style={{ fontSize: 20 }}>-</Text>
                    </TouchableOpacity>
                    <Text style={{ marginHorizontal: 10 }}>{quantities[item.name]}</Text>
                    <TouchableOpacity onPress={() => onQuantityChange(item, 1)}>
                        <Text style={{ fontSize: 20 }}>+</Text>
                    </TouchableOpacity>
                </View>
                <Text>DA {item.standard_rate * quantities[item.name]}</Text>
                <TouchableOpacity onPress={() => onRemove(item)}>
                    <Text style={{ color: 'red' }}>Remove</Text>
                </TouchableOpacity>
            </View>
      );
    };

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <FlatList
                data={cartItems}
                keyExtractor={item => item.name}
                renderItem={({ item }) => (
                    <CartItem 
                        item={item} 
                        onRemove={handleRemoveItem} 
                        onQuantityChange={handleQuantityChange} 
                    />
                )}
            />
            <View style={{ padding: 10 }}>
            {!customer && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 18 }}>Select Customer:</Text>
                        <Picker
                        selectedValue={selectedClient}
                        onValueChange={(itemValue, itemIndex) => {
                        setSelectedClient(itemValue)
                            }}
                        >
                            <Picker.Item label="Selected Customer" value={null} />
                            {clients.map((client) => (
                                <Picker.Item key={client.name} label={`${client.name}`} value={client} />
                            ))}
                        </Picker>
                    </View>
                )}
            <Text style={{ fontSize: 18 }}>Select Tax:</Text>
                <Picker
                selectedValue={selectedTax}
                onValueChange={(itemValue, itemIndex) => {
                    setSelectedTax(itemValue);
                }}
                >
                    <Picker.Item label="Selected Tax" value={null} />
                    {charges.map((tax) => (
                        <Picker.Item key={tax.name} label={`${tax.name}`} value={tax} />
                    ))}
                </Picker>
                <Text style={{ fontSize: 18 }}>Total: DA {calculateTotalPrice()}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
                    <TouchableOpacity style={styles.button} onPress={handleSaveSaleOrder}>
                        <Text style={styles.buttonText}>Passer Commande</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleSaveQuotation}>
                        <Text style={styles.buttonText}>Demander Devis</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default Cart;

const styles = StyleSheet.create({
    button: {
    backgroundColor: '#E59135',
    borderRadius: 10,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})