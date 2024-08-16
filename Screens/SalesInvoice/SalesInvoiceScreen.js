import { ScrollView, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const SalesInvoiceScreen = ({navigation}) => {
    const route = useRoute();
    const {commandeName} = route.params;
    const isFocused = useIsFocused();
    const db = useSQLiteContext();

    const [commande, setCommande] = useState(null);
    const [salesOrderItems, setSalesOrderItems] = useState([]);
    const [salesOrderTaxes, setSalesOrderTaxes] = useState([]);
    const [customer, setCustomer] = useState([]);
    const [paidAmount, setPaidAmount] = useState(null);
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [invoiceDate, setInvoiceDate] = useState(new Date());
    const [show, setShow] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || invoiceDate;
        setShow(false);
        setInvoiceDate(currentDate); 
    };

    const showDatepicker = () => {
        setShow(true); 
    };

    const getCommandeDetails = async () => {
        try {
            const selectedCommande = await db.getFirstAsync(`SELECT * FROM Sales_Order WHERE name= ?;`, [commandeName]);
            setCommande(selectedCommande);
            const salesOrderItems = await db.getAllAsync(`SELECT * FROM Sales_Order_Item WHERE parent= ?;`, [commandeName]);
            setSalesOrderItems(salesOrderItems);
            const salesOrderTaxes_and_Charges = await db.getAllAsync(`SELECT * FROM Sales_Taxes_and_Charges WHERE parent= ?;`, [commandeName]);
            setSalesOrderTaxes(salesOrderTaxes_and_Charges);
        }catch(e){
            console.log("Error getting the sale order from local database",e );
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

    const saveSalesInvoice = async () => {
        try{
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
                    0, 0, "ACC-SINV-"+Date.getFullYear()+"-", commande.customer,
                    commande.customer_name, Date.toISOString().split('T')[0], Date.toISOString().split('T')[0],
                    0, Date.toISOString().split('T')[0], 1, 0, 0,
                    1, 0, 1, 0,
                    "TND", 1,  // "DA"
                    "Standard Selling", "TND", 1, 0, // currency settings ------------ "DA"
                    1, commande.set_warehouse, commande.total_qty, commande.total_net_weight,
                    commande.base_total, commande.base_net_total, commande.total, commande.net_total, commande.tax_category,
                    commande.taxes_and_charges, commande.base_total_taxes_and_charges,
                    commande.total_taxes_and_charges, commande.base_grand_total, commande.base_rounding_adjustment, commande.base_rounded_total, commande.base_in_words,
                    commande.grand_total, commande.rounding_adjustment, 0, commande.rounded_total, commande.in_words,
                    commande.advance_paid, commande.total-commande.advance_paid, commande.disable_rounded_total, commande.apply_discount_on, commande.base_discount_amount,
                    0, 0, commande.discount_amount, "",
                    0, 0, paidAmount, paidAmount,
                    0, 0, "", 0, 0,
                    0, 0, 0 , "", "",
                    0, 0, 0,
                    commande.custom_address,
                    commande.territory,
                    0,
                    "", "TND", "No", // currency settings --------------- "DA"
                    commande.amount_eligible_for_commission, 0, 0,
                    0, "en",  // language settings --------------- "
                    "Draft",
                    commande.customer_group, 0, 0,
                    0
                ]
            );

            await Promise.all(salesOrderItems.map(async (salesOrderItem)=> {
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
                    actual_batch_qty, sales_order,
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
                    ?, ?,
                    ?,
                    ?,
                    ?, ?, ?
                )`,
                [
                    salesInvoiceItemName, "Administrator",
                    0, 1, 0, salesOrderItem.item_code,
                    salesOrderItem.item_name, salesOrderItem.description, salesOrderItem.item_group,
                    salesOrderItem.qty, salesOrderItem.stock_uom, salesOrderItem.stock_uom, 1,
                    salesOrderItem.qty, salesOrderItem.rate, salesOrderItem.base_rate, "", 0,
                    0, 0, 0, 0, salesOrderItem.rate,
                    salesOrderItem.amount, salesOrderItem.base_rate, salesOrderItem.base_amount,
                    0, 0, 1, salesOrderItem.rate, salesOrderItem.amount,
                    salesOrderItem.base_rate, salesOrderItem.base_amount, 0, "", 0,
                    "",
                    0,
                    salesOrderItem.warehouse,
                    1, 0, 0, "{}",
                    0, salesOrderItem.parent,
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
                    0, 1, salesOrderTaxes.charge_type, salesOrderTaxes.account_head,
                    salesOrderTaxes.description, 0, 0, salesOrderTaxes.cost_center, salesOrderTaxes.rate,
                    salesOrderTaxes.account_currency, salesOrderTaxes.tax_amount, salesOrderTaxes.total, salesOrderTaxes.tax_amount_after_discount_amount, salesOrderTaxes.base_tax_amount,
                    salesOrderTaxes.base_total, salesOrderTaxes.base_tax_amount_after_discount_amount, salesOrderTaxes.item_wise_tax_detail, salesOrderTaxes.dont_recompute_tax, invoiceName,
                    "taxes", "Sales Invoice"
                ]
            );

            const salesInvoicePaymentName = 'new-sales-Invoice-Payment-'+generateRandomName();
            await db.runAsync(`INSERT INTO Sales_Invoice_Payment(
                    name,
                    docstatus, idx, "default", mode_of_payment, amount,
                    account, type, base_amount, clearance_date,
                    parent, parentfield, parenttype
                ) VALUES (
                    ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?
                )`, 
                [
                    salesInvoicePaymentName,
                    0, 1, 1, paymentMode, paidAmount,
                    "", paymentMode, paidAmount, invoiceDate.toISOString().split('T')[0],
                    invoiceName, "payments", "Sales Invoice"
                ]
            );
        }catch(e){
            console.log("Error saving the Sales Invoice, please try again" ,e);
        }
    };

    const handleSaveSalesInvoice = () => {
        try{
            saveSalesInvoice();
            navigation.navigate('PaimentScreen');
            Alert.alert("Sales Invoice saved successfully..");
        }catch(e){
            Alert.alert("Sales Invoice failed to be saved");
            console.log("Error saving the Sales Invoice, please try again" ,e);
        }
    }

    useEffect(() => { 
        if (isFocused){
            getCommandeDetails();
            // getCustomer();
        }
    },[isFocused]);

  return (
    <View style={{alignItems:'center', flex:1}}>
        {commande && salesOrderItems && salesOrderTaxes ? (
            <>
                <ScrollView style={{flex:1}} >
                    <View>
                        <TouchableOpacity 
                        style={{ borderRadius: 10, backgroundColor: "#FFF", margin: 5, padding: 20, justifyContent: 'center' }}
                        onPress={showDatepicker}
                        >
                            <Text>Select Invoice Date: {invoiceDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        {show && (
                            <DateTimePicker
                            testID="dateTimePicker"
                            value={invoiceDate}
                            mode="date"
                            display="default"
                            onChange={onChange}
                            />
                        )}
                    </View>
                    <TouchableOpacity style={{borderRadius: 10, backgroundColor:"#FFF",  margin: 5, padding:20, justifyContent:'center'}}>
                        <Text>Customer: {commande.customer}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{borderRadius: 10, backgroundColor:"#FFF",  margin: 5, padding:20, justifyContent:'center'}}>
                        <Text style={{margin:10}}>Amount To Pay: {commande.grand_total} DA</Text>
                        <TextInput
                        style={{ padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5 }}
                        placeholder='Amount paid'
                        keyboardType='numeric'
                        value={paidAmount}
                        onChangeText={text => setPaidAmount(text)}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ borderRadius: 10, backgroundColor:"#FFF", margin: 5, padding:20, justifyContent:'center'}}>
                        <Text>Payment Method: </Text>
                        <View style={{ borderWidth: 1, borderRadius: 5, marginTop: 10 }}>
                            <Picker
                            selectedValue={paymentMode}
                            onValueChange={(itemValue) => setPaymentMode(itemValue)}
                            style={{ height: 50, width: '100%' }}
                            >
                                <Picker.Item label="Cash" value="Cash" />
                                <Picker.Item label="Card" value="Card" />
                            </Picker>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{ borderRadius: 10, backgroundColor:"#FFF", margin: 5, padding:20, justifyContent:'center'}}>
                        <Text>Print Recipe </Text>
                    </TouchableOpacity>
                </ScrollView>
                <TouchableOpacity style={{height:50 ,margin: 10, width:200, justifyContent:'center', backgroundColor:"#E59135", alignItems:'center', borderRadius:15}}>
                    <Text style={{color:"#FFF"}} onPress={handleSaveSalesInvoice}>Complete Sale</Text>
                </TouchableOpacity>
            </>
        ) : (
            <Text>Loading...</Text>
        )}
    </View>
  )
};

export default SalesInvoiceScreen;

const styles = StyleSheet.create({})