import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useRoute } from '@react-navigation/native';
import * as CryptoJS from 'crypto-js';
import { useSQLiteContext } from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';

const Cart = ({navigation}) => {
    const route = useRoute();
    const { selectedItems, customer } = route.params;
    const isFocused = useIsFocused();
    const db = useSQLiteContext();

    const [cartItems, setCartItems] = useState(selectedItems);
    const [quantities, setQuantities] = useState({});
    const [taxes, setTaxes] = useState([]);
    const [charges, setCharges] = useState([]);
    const [selectedTax, setSelectedTax] = useState(null);

    const handleRemoveItem = (itemToRemove) => {
        setCartItems(cartItems.filter(item => item.name !== itemToRemove.name));
    };

    const handleQuantityChange = (item, change) => {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [item.name]: prevQuantities[item.name] + change
        }));
    };

    const calculateTotalPrice = () => {
        let total=cartItems.reduce((total, item) => (total + item.standard_rate) * quantities[item.name], 0);
        if (selectedTax) {
            total += total * (19 / 100);
        }
        return total.toFixed(2);
    };

    const handleTaxChange = (tax) => {
        setSelectedTax(tax);
    };

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

    const getTaxesfromAPI = async () => {
        try{
            const response = await fetch('http://195.201.138.202:8006/api/resource/Tax Category?fields=["*"]', {
                method: 'GET',
                headers: {
                    'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
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

    const getTaxes = async () => {
        try{
            const allTaxes = await db.getAllAsync(`SELECT * FROM Sales_Taxes_and_Charges;`);
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
    }

    let generatedName= generateRandomName();
    console.log(generatedName);

    const saveSalesOrderItems = async () => {
        try{
            await db.runAsync(``); //TODO SAVE THE SELECTED ITEMS TO SALES ORDER ITEMS
        }catch(e){
            console.log('Error saving sales order items', e);
        }
    };

    const saveSalesOrder = async => {
        try{
            // await db.runAsync(`INSERT INTO Sales_Order(
            //     name, creation, modified, modified_by, owner,
            //     docstatus, idx, title, naming_series, customer,
            //     customer_name, tax_id, order_type, transaction_date, delivery_date,
            //     po_no, po_date, company, skip_delivery_note, amended_from,
            //     cost_center, project, currency, conversion_rate, selling_price_list,
            //     price_list_currency, plc_conversion_rate, ignore_pricing_rule, scan_barcode, set_warehouse,
            //     reserve_stock, total_qty, total_net_weight, base_total, base_net_total,
            //     total, net_total, tax_category, taxes_and_charges, shipping_rule,
            //     incoterm, named_place, base_total_taxes_and_charges, total_taxes_and_charges, base_grand_total,
            //     base_rounding_adjustment, base_rounded_total, base_in_words, grand_total, rounding_adjustment,
            //     rounded_total, in_words, advance_paid, disable_rounded_total, apply_discount_on,
            //     base_discount_amount, coupon_code, additional_discount_percentage, discount_amount, other_charges_calculation,
            //     customer_address, address_display, customer_group, territory, contact_person,
            //     contact_display, contact_phone, contact_mobile, contact_email, shipping_address_name,
            //     shipping_address, dispatch_address_name, dispatch_address, company_address, company_address_display,
            //     payment_terms_template, tc_name, terms, status, delivery_status,
            //     per_delivered, per_billed, per_picked, billing_status, sales_partner,
            //     amount_eligible_for_commission, commission_rate, total_commission, loyalty_points, loyalty_amount,
            //     from_date, to_date, auto_repeat, letter_head, group_same_items,
            //     select_print_heading, language, is_internal_customer, represents_company, source,
            //     inter_company_order_reference, campaign, party_account_currency, _user_tags, _comments,
            //     _assign, _liked_by, _seen
            // ) VALUES (?)`,
            //     [])
        }catch(e){
            console.log('Error saving sales order', e);
        }
    }

    const saveQuotation = async => {
        try{

        }catch(e){
            console.log('Error saving quotation', e);
        }
    };

    useEffect(() => {   
        if(isFocused){
            const initialize = async () => {
                createMetadataTable();
                getTaxesfromAPI();
                getTaxes();
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
            <Text style={{ fontSize: 18 }}>Select Tax:</Text>
                <Picker
                selectedValue={selectedTax}
                onValueChange={(itemValue, itemIndex) => {
                    setSelectedTax(itemValue)
                }}
                >
                    <Picker.Item label="Selected Tax" value={null} />
                    {charges.map((tax) => (
                        <Picker.Item key={tax.name} label={`${tax.name} - ${tax.rate}%`} value={tax} />
                    ))}
                </Picker>
                <Text style={{ fontSize: 18 }}>Total: DA {calculateTotalPrice()}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
                    <TouchableOpacity style={styles.button} onPress={()=>{navigation.navigate('CommandeScreen',cartItems, taxes, quantities)}}>
                        <Text style={styles.buttonText}>Passer Commande</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
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