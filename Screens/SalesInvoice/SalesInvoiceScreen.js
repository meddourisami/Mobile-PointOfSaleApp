import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';

const SalesInvoiceScreen = ({navigation}) => {
    const route = useRoute();
    const {commandeName} = route.params;
    const isFocused = useIsFocused();
    const db = useSQLiteContext();

    const [commande, setCommande] = useState(null);
    const [salesOrderItems, setSalesOrderItems] = useState([]);
    const [salesOrderTaxes, setSalesOrderTaxes] = useState([]);

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
            const invoiceName = 'new-Sales-Invoice-'+generateRandomName();
            await db.runAsync(`INSERT INTO Sales_Invoice(
                    name, creation, modified, modified_by, owner,
                    docstatus, idx, title, naming_series, customer,
                    customer_name, tax_id, company_tax_id, posting_date, posting_time,
                    set_posting_time, due_date, is_pos, is_consolidated, is_return,
                    return_against, update_outstanding_for_self, update_billed_amount_in_sales_order, update_billed_amount_in_delivery_note, is_debit_note,
                    amended_from, cost_center, project, currency, conversion_rate,
                    selling_price_list, price_list_currency, plc_conversion_rate, ignore_pricing_rule, scan_barcode,
                    update_stock, set_warehouse, set_target_warehouse, total_qty, total_net_weight,
                    base_total, base_net_total, total, net_total, tax_category,
                    taxes_and_charges, shipping_rule, incoterm, named_place, base_total_taxes_and_charges,
                    total_taxes_and_charges, base_grand_total, base_rounding_adjustment, base_rounded_total, base_in_words,
                    grand_total, rounding_adjustment, use_company_roundoff_cost_center, rounded_total, in_words,
                    total_advance, outstanding_amount, disable_rounded_total, apply_discount_on, base_discount_amount,
                    is_cash_or_non_trade_discount, additional_discount_account, additional_discount_percentage, discount_amount, other_charges_calculation,
                    total_billing_hours, total_billing_amount, cash_bank_account, base_paid_amount, paid_amount,
                    base_change_amount, change_amount, account_for_change_amount, allocate_advances_automatically, only_include_allocated_payments,
                    write_off_amount, base_write_off_amount, write_off_outstanding_amount_automatically, write_off_account, write_off_cost_center,
                    redeem_loyalty_points, loyalty_points, loyalty_amount, loyalty_program, loyalty_redemption_account,
                    loyalty_redemption_cost_center, customer_address, address_display, contact_person, contact_display,
                    contact_mobile, contact_email, territory, shipping_address_name, shipping_address,
                    dispatch_address_name, dispatch_address, company_address, company_address_display, ignore_default_payment_terms_template,
                    payment_terms_template, tc_name, terms, po_no, po_date,
                    debit_to, party_account_currency, is_opening, unrealized_profit_loss_account, against_income_account,
                    sales_partner, amount_eligible_for_commission, commission_rate, total_commission, letter_head,
                    group_same_items, select_print_heading, language, subscription, from_date,
                    auto_repeat, to_date, status, inter_company_invoice_reference, campaign,
                    represents_company, source, customer_group, is_internal_customer, is_discounted,
                    remarks, repost_required, _user_tags, _comments, _assign,
                    _liked_by, _seen
                ) VALUES (
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
                    ?, ?
                )`,
                [
                    invoiceName, 
                ]
            )
        }catch(e){
            console.log("Error saving the sales invoice, please try again" ,e);
        }
    };

    const handleSaveSalesInvoice = () => {
        saveSalesInvoice();
        Alert.alert("Sales Invoice saved successfully..");
    }

    useEffect(() => { 
        if (isFocused){
            getCommandeDetails();
        }
    },[isFocused]);

  return (
    <View style={{alignItems:'center', flex:1}}>
        {commande ? (
            <>
                <Text>Select Invoice Date: </Text>
                <Text>Customer: {commande.customer}</Text>
                <Text>Amount To Pay: {commande.grand_total} DA</Text>
                <TextInput placeholder='Amount paid'></TextInput>
                <TouchableOpacity style={{height:50 ,margin: 10, width:200, justifyContent:'center', backgroundColor:"#E59135", alignItems:'center', borderRadius:15}}>
                    <Text style={{color:"#FFF"}}>Complete Sale</Text>
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