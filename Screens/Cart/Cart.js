import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useRoute } from '@react-navigation/native';
import * as CryptoJS from 'crypto-js';
import { useSQLiteContext } from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSync } from '../../SyncContext';
import Feather from '@expo/vector-icons/Feather';


const Cart = ({navigation}) => {
    const route = useRoute();
    const { selectedItems, customer } = route.params || {};
    const isFocused = useIsFocused();
    const db = useSQLiteContext();
    const { token } = useSync();

    const [cartItems, setCartItems] = useState(selectedItems);
    const [quantities, setQuantities] = useState({});
    const [taxes, setTaxes] = useState([]);
    const [charges, setCharges] = useState([]);
    const [selectedTax, setSelectedTax] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clients, setClients] = useState([]);

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
        return (calculateTotalPrice() - calculateTotalPriceWithoutTax()).toFixed(2);
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
        const rowCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM TaxesMetadata;');
        if (rowCount.count === 0) {
            await db.runAsync('INSERT INTO TaxesMetadata (id, data_hash) VALUES (1, "");');
        }
    };

    function transformJson(data) { const keys = data.message.keys; const values = data.message.values; return values.map(entry => { let obj = {}; keys.forEach((key, index) => { obj[key] = entry[index]; }); return obj; }); }

    const getTaxesfromAPI = async () => {
        try{
            // const response = await fetch('http://195.201.138.202:8006/api/resource/Sales Taxes and Charges Template?fields=["*"]', {
            //     method: 'GET',
            //     headers: {
            //         'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
            //     },
            // });
            const response = await fetch('http://192.168.100.6:8002/api/resource/Sales Taxes and Charges Template?fields=["*"]', {
            // const response = await fetch('http://192.168.100.6:8002/api/resource/Sales Taxes and Charges Template?fields=["*"]', {
                method: 'GET',
                headers: {
                    'Authorization': token,
                },
            });

            const json = await response.json();
            
            const newHash = getHash(json.data);

            const existingHash = await db.getFirstAsync('SELECT data_hash FROM TaxesMetadata WHERE id = 1;');
            if (existingHash.data_hash !== newHash) {

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
                    tax.company, tax.tax_category, tax.user_tags, tax._comments, tax._assign,
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
            const userProfile = await db.getFirstAsync('SELECT * FROM User_Profile WHERE id= 1');
            // if(userProfile){
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
                    userProfile.company, 0, userProfile.currency, "Standard Selling", 
                    userProfile.warehouse, 
                    calculateTotalQuantity(quantities), 0, calculateTotalPriceWithoutTax(), calculateTotalPriceWithoutTax(),
                    calculateTotalPriceWithoutTax(), calculateTotalPriceWithoutTax(), "", selectedTax.name,
                    calculateTaxAmount(), calculateTaxAmount(), calculateTotalPrice(),
                    calculateRoudingAdjustment(calculateTotalPrice()), calculateRoundedTotal(calculateTotalPrice()), "", calculateTotalPrice(), calculateRoudingAdjustment(calculateTotalPrice()),
                    calculateRoundedTotal(calculateTotalPrice()), "", 0, 1, "Grand Total",
                    0, 0,
                    currentCustomer.custom_address, currentCustomer.custom_group, currentCustomer.territory,
                    "Draft", "Not Delivered",
                    "Not Billed",
                    calculateTotalPriceWithoutTax(),
                    0,
                    "en", 0, // TODO API LANGUANGE --------------- "fr"
                    userProfile.currency
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
                        item.standard_rate, calculateTotalPricePerItem(item), item.standard_rate, calculateTotalPricePerItem(item), userProfile.warehouse,
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
                ]
            );
        // }
        }catch(e){
            console.log('Error saving sales order', e);
        }
    };

    const handleSaveSaleOrder = () => {
        try{
            if (!selectedTax ||  !selectedClient){
                Alert.alert(
                    'Missing Information',
                    'Please ensure you have selected both a tax and a client before proceeding.',
                    [{ text: 'OK' }]
                  );
            }else{
                saveSalesOrder();
                navigation.navigate('CommandeScreen');
                Alert.alert(
                    'Success',
                    'The sales order is being saved and you will be redirected to the Commande screen.',
                    [{ text: 'OK' }]
                  );
            }
        }catch(e){
            Alert.alert(
                'Error',
                'There was an issue saving the sales order. Please try again later.',
                [{ text: 'OK' }]
              );
            console.log('Error saving sales order', e);
        }
    };

    const saveSalesInvoice = async() => {
        let invoiceName = '';
        try{
            let currentCustomer = customer;
            if(!currentCustomer){
                currentCustomer = selectedClient;
            }
            const currentDate = new Date();
            const invoiceName = 'new-sales-Invoice-'+generateRandomName();
            await db.runAsync(`INSERT INTO Sales_Invoice(
                    name, owner,
                    docstatus, idx, naming_series, customer,
                    customer_name, posting_date, posting_time,
                    set_posting_time, due_date, is_pos, is_consolidated, is_return,
                    update_outstanding_for_self, update_billed_amount_in_sales_order, update_billed_amount_in_delivery_note, is_debit_note,
                    currency, conversion_rate,
                    selling_price_list, price_list_currency, plc_conversion_rate, ignore_pricing_rule,
                    update_stock, set_warehouse, total_qty, total_net_weight,
                    base_total, base_net_total, total, net_total, tax_category,
                    taxes_and_charges, base_total_taxes_and_charges,
                    total_taxes_and_charges, base_grand_total, base_rounding_adjustment, base_rounded_total, base_in_words,
                    grand_total, rounding_adjustment, use_company_roundoff_cost_center, rounded_total, in_words,
                    total_advance, outstanding_amount, disable_rounded_total, apply_discount_on, base_discount_amount,
                    is_cash_or_non_trade_discount, additional_discount_percentage, discount_amount, other_charges_calculation,
                    total_billing_hours, total_billing_amount, base_paid_amount, paid_amount,
                    base_change_amount, change_amount, account_for_change_amount, allocate_advances_automatically, only_include_allocated_payments,
                    write_off_amount, base_write_off_amount, write_off_outstanding_amount_automatically, write_off_account, write_off_cost_center,
                    redeem_loyalty_points, loyalty_points, loyalty_amount,
                    customer_address,
                    territory,
                    ignore_default_payment_terms_template,
                    debit_to, party_account_currency, is_opening,
                    amount_eligible_for_commission, commission_rate, total_commission,
                    group_same_items, language,
                    status,
                    customer_group, is_internal_customer, is_discounted,
                    repost_required
                ) VALUES (
                    ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?,
                    ?,
                    ?,
                    ?,
                    ?, ?, ?,
                    ?, ?, ?,
                    ?, ?,
                    ?,
                    ?, ?, ?,
                    ?
                )`,
                [
                    invoiceName, "Administrator",
                    0, 0, "ACC-SINV-"+currentDate.getFullYear()+"-", currentCustomer.customer_name,
                    currentCustomer.customer_name, currentDate.toISOString().split('T')[0], currentDate.toISOString().split('T')[0],
                    0, currentDate.toISOString().split('T')[0], 1, 0, 0,
                    1, 0, 1, 0,
                    "TND", 1,  // "DA"
                    "Standard Selling", "TND", 1, 0, // currency settings ------------ "DA"
                    1, "Magasin Fille 1 - ICD", calculateTotalQuantity(quantities), 0,
                    calculateTotalPriceWithoutTax(), calculateTotalPriceWithoutTax(), calculateTotalPriceWithoutTax(), calculateTotalPriceWithoutTax(), "",
                    selectedTax.name, calculateTaxAmount(),
                    calculateTaxAmount(), calculateTotalPrice(), calculateRoudingAdjustment(calculateTotalPrice()), calculateRoundedTotal(calculateTotalPrice()), "",
                    calculateTotalPrice(), calculateRoudingAdjustment(calculateTotalPrice()), 0, calculateRoundedTotal(calculateTotalPrice()), "",
                    0, calculateRoundedTotal(calculateTotalPrice()), 1, "Grand Total", 0,
                    0, 0, 0, "",
                    0, 0, 0, 0, 
                    0, 0, "", 0, 0,
                    0, 0, 0 , "", "",
                    0, 0, 0,
                    currentCustomer.custom_address,
                    currentCustomer.territory,
                    0,
                    "", "TND", "No", // currency settings --------------- "DA"
                    calculateTotalPriceWithoutTax(), 0, 0,
                    0, "en",  // language settings --------------- "
                    "Draft",
                    currentCustomer.customer_group, 0, 0,
                    0
                ]
            );

            console.log(selectedItems);
            await Promise.all(selectedItems.map(async (salesInvoiceItem)=> {
                console.log(salesInvoiceItem);
                const salesInvoiceItemName = 'new-sales-Invoice-Item-'+generateRandomName();
                await db.runAsync(`INSERT INTO Sales_Invoice_item(
                    name, owner,
                    docstatus, idx, has_item_scanned, item_code,
                    item_name, description, item_group,
                    qty, stock_uom, uom, conversion_factor,
                    stock_qty, price_list_rate, base_price_list_rate, margin_type, margin_rate_or_amount,
                    rate_with_margin, discount_percentage, discount_amount, base_rate_with_margin, rate,
                    amount, base_rate, base_amount,
                    stock_uom_rate, is_free_item, grant_commission, net_rate, net_amount,
                    base_net_rate, base_net_amount, delivered_by_supplier, income_account, is_fixed_asset,
                    expense_account,
                    enable_deferred_revenue,
                    warehouse,
                    use_serial_batch_fields, allow_zero_valuation_rate, incoming_rate, item_tax_rate,
                    actual_batch_qty,
                    delivered_qty,
                    page_break,
                    parent, parentfield, parenttype
                ) VALUES (
                    ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?,
                    ?,
                    ?,
                    ?, ?, ?, ?,
                    ?,
                    ?,
                    ?,
                    ?, ?, ?
                )`,
                [
                    salesInvoiceItemName, "Administrator",
                    0, 1, 0, salesInvoiceItem.item_code,
                    salesInvoiceItem.item_name, salesInvoiceItem.description, salesInvoiceItem.item_group,
                    quantities[salesInvoiceItem.name], salesInvoiceItem.stock_uom, salesInvoiceItem.stock_uom, 1,
                    quantities[salesInvoiceItem.name], salesInvoiceItem.standard_rate, salesInvoiceItem.standard_rate, "", 0,
                    0, 0, 0, 0, salesInvoiceItem.standard_rate,
                    calculateTotalPricePerItem(salesInvoiceItem), salesInvoiceItem.standard_rate, calculateTotalPricePerItem(salesInvoiceItem),
                    0, 0, 1, salesInvoiceItem.standard_rate, calculateTotalPricePerItem(salesInvoiceItem),
                    salesInvoiceItem.standard_rate, calculateTotalPricePerItem(salesInvoiceItem), 0, "4110 - Sales - ICD", 0,
                    "4110 - Sales - ICD",
                    0,
                    "Magasin Fille 1 - ICD",
                    1, 0, 0, "{}",
                    0,
                    0,
                    0,
                    invoiceName, "items", "Sales Invoice"
                ]
                );
            }));

            const salesTaxes_and_ChargesName = 'new-sales-taxes-and-charges-'+generateRandomName();
            await db.runAsync(`INSERT INTO Sales_Taxes_and_Charges(
                    name, owner,
                    docstatus, idx, charge_type, account_head,
                    description, included_in_print_rate, included_in_paid_amount, cost_center, rate,
                    account_currency, tax_amount, total, tax_amount_after_discount_amount, base_tax_amount,
                    base_total, base_tax_amount_after_discount_amount, item_wise_tax_detail, dont_recompute_tax, parent,
                    parentfield, parenttype
                ) VALUES (
                    ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?
                )`, 
                [
                    salesTaxes_and_ChargesName, "Administrator",
                    0, 1, "On Net Total", formatAccountHead(selectedTax.name),
                    selectedTax.name, 0, 0, "", getTaxRate(selectedTax),
                    null, calculateTaxAmount(), calculateTotalPrice(), calculateTaxAmount(), calculateTaxAmount(),
                    calculateTotalPrice(), calculateTaxAmount(), generateItemTaxDetail(selectedItems,selectedTax), 0, invoiceName,
                    "taxes", "Sales Invoice"
                ]
            );
            return invoiceName;
        }catch(e) {
            console.log("Error saving sales invoice",e);
        }
    };

    const handleSaveSalesInvoice = async () => {
        try{
            if (!selectedTax ||  !selectedClient){
                Alert.alert("Make sure you have selected a tax and a client");
            }else{
                const invoice = await saveSalesInvoice();
                navigation.navigate('SalesInvoiceScreen',{invoice});
                Alert.alert('Saving sales invoice');
            }
        }catch(e){
            Alert.alert('Error saving sales invoice');
            console.log('Error saving sales invoice', e);
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


    const getClients = async () => {
        try{
            const allClients = await db.getAllAsync(`SELECT * FROM Customers;`);
            setClients(allClients);
        }catch(e){
            console.log('Error retreiving clients', e);
        }
    };

    useEffect(() => {   
        if(isFocused){
            const initialize = async () => {
                // createMetadataTable();
                getTaxesfromAPI();
                getTaxes();
                getClients();
            };
            initialize();
        }
    }, [isFocused]);

    const CartItem = ({ item, onRemove, onQuantityChange }) => {
        const defaultImage = "https://t3.ftcdn.net/jpg/04/84/88/76/360_F_484887682_Mx57wpHG4lKrPAG0y7Q8Q7bJ952J3TTO.jpg";
        const imageUrl = item.image ? item.image : defaultImage;
      return (
        <View style={styles.cartItemContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.itemImage}
        />
        <View style={styles.itemDetailsContainer}>
          <Text style={styles.itemName}>{item.item_name}</Text>
        </View>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => onQuantityChange(item, -1)}>
            <Feather name="minus" size={24} color="#606060" style={styles.iconButton} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantities[item.name]}</Text>
          <TouchableOpacity onPress={() => onQuantityChange(item, 1)}>
            <Feather name="plus" size={24} color="#606060" style={styles.iconButton} />
          </TouchableOpacity>
        </View>
        <Text style={styles.priceText}>DA {item.standard_rate * quantities[item.name]}</Text>
        <TouchableOpacity onPress={() => onRemove(item)} style={styles.removeButton}>
          <Ionicons name="close-outline" size={28} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    );
    };

    return (
        <View style={styles.container}>
    <FlatList
      data={cartItems}
      keyExtractor={item => item.name.toString()}
      renderItem={({ item }) => (
        <CartItem 
          key={item.key}
          item={item} 
          onRemove={handleRemoveItem} 
          onQuantityChange={handleQuantityChange} 
        />
      )}
    />
    <View style={styles.pickerContainer}>
      {!customer && (
        <View style={styles.clientPickerContainer}>
          <Picker
            selectedValue={selectedClient}
            onValueChange={(itemValue) => setSelectedClient(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Customer" value={null} />
            {clients.map((client) => (
              <Picker.Item key={client.name} label={client.name} value={client} />
            ))}
          </Picker>
        </View>
      )}
      <Picker
        selectedValue={selectedTax}
        onValueChange={(itemValue) => setSelectedTax(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Tax" value={null} />
        {charges.map((tax) => (
          <Picker.Item key={tax.name} label={tax.name} value={tax} />
        ))}
      </Picker>
    </View>
    <View style={styles.separator} />
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryText}>Net Total: DA {calculateTotalPriceWithoutTax()}</Text>
      <Text style={styles.summaryText}>Total Tax: DA {calculateTaxAmount()}</Text>
      <View style={styles.separator} />
      <Text style={styles.summaryText}>Grand Total: DA {calculateTotalPrice()}</Text>
    </View>
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={handleSaveSaleOrder}>
        <Text style={styles.buttonText}>Passer à la Commande</Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.button} onPress={handleSaveSalesInvoice}>
        <Text style={styles.buttonText}>Passer au Paiment</Text>
      </TouchableOpacity> */}
    </View>
  </View>
);
};

export default Cart;

const styles = StyleSheet.create({
    container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F8F9FA',
  },
    cartItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderWidth: 1,
    // borderColor: '#D1D5DB',
    // borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  itemDetailsContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginHorizontal: 10,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#606060',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 10,
  },
  removeButton: {
    marginLeft: 10,
  },
   pickerContainer: {
    padding: 10,
  },
  clientPickerContainer: {
    marginBottom: 20,
    borderRadius: 10,
  },
  picker: {
    height: 40,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
  },
  summaryContainer: {
    backgroundColor: '#F7F8FA',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 3,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#FF6B35',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  buttonText: {
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold',
  },
  separator: {
    borderBottomWidth: 3,
    borderColor: '#ccc',
    borderStyle: 'dotted',
    marginVertical: 3,
  },
})