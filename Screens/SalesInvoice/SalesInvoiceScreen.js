import { ScrollView, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useRoute } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useBudget } from '../../BudgetContext';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

const SalesInvoiceScreen = ({navigation}) => {
    const route = useRoute();
    const {commandeName, invoice, paymentStat} = route.params;
    const isFocused = useIsFocused();
    const db = useSQLiteContext();
    const { updateBudget } = useBudget();


    const [commande, setCommande] = useState(null);
    const [salesOrderItems, setSalesOrderItems] = useState([]);
    const [salesOrderTaxes, setSalesOrderTaxes] = useState([]);
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
            if(commandeName){
                const selectedCommande = await db.getFirstAsync(`SELECT * FROM Sales_Order WHERE name= ?;`, [commandeName]);
                setCommande(selectedCommande);
                const salesOrderItems = await db.getAllAsync(`SELECT * FROM Sales_Order_Item WHERE parent= ?;`, [commandeName]);
                setSalesOrderItems(salesOrderItems);
                const salesOrderTaxes_and_Charges = await db.getAllAsync(`SELECT * FROM Sales_Taxes_and_Charges WHERE parent= ?;`, [commandeName]);
                setSalesOrderTaxes(salesOrderTaxes_and_Charges);
            }else{
                const selectedInvoice = await db.getFirstAsync(`SELECT * FROM Sales_Invoice WHERE name= ?;`, [invoice]);
                setCommande(selectedInvoice);
                const salesInvoiceItems = await db.getAllAsync(`SELECT * FROM Sales_Invoice_Item WHERE parent= ?;`, [invoice]);
                setSalesOrderItems(salesInvoiceItems);
                const salesInvoiceTaxes_and_Charges = await db.getAllAsync(`SELECT * FROM Sales_Taxes_and_Charges WHERE parent=?;`, [invoice]);
                setSalesOrderTaxes(salesInvoiceTaxes_and_Charges);
            }
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
                    0, 0, "ACC-SINV-"+currentDate.getFullYear()+"-", commande.customer,
                    commande.customer_name, currentDate.toISOString().split('T')[0], currentDate.toISOString().split('T')[0],
                    0, currentDate.toISOString().split('T')[0], 1, 0, 0,
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
                    salesOrderItem.base_rate, salesOrderItem.base_amount, 0, "4110 - Sales - ICD", 0,
                    "5111 - Cost of Goods Sold - ICD",
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
                    0, 1, salesOrderTaxes[0].charge_type, salesOrderTaxes[0].account_head,
                    salesOrderTaxes[0].description, 0, 0, salesOrderTaxes[0].cost_center, salesOrderTaxes[0].rate,
                    salesOrderTaxes[0].account_currency, salesOrderTaxes[0].tax_amount, salesOrderTaxes[0].total, salesOrderTaxes[0].tax_amount_after_discount_amount, salesOrderTaxes[0].base_tax_amount,
                    salesOrderTaxes[0].base_total, salesOrderTaxes[0].base_tax_amount_after_discount_amount, salesOrderTaxes[0].item_wise_tax_detail, salesOrderTaxes[0].dont_recompute_tax, invoiceName,
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
                    "1110 - Cash - ICD", paymentMode, paidAmount, invoiceDate.toISOString().split('T')[0],
                    invoiceName, "payments", "Sales Invoice"
                ]
            );
        }catch(e){
            console.log("Error saving the Sales Invoice, please try again" ,e);
        }
    };

    const completeSalesInvoiceSaving = async () => {
        try{
            await db.runAsync(`UPDATE Sales_Invoice SET base_paid_amount = ?, paid_amount = ? WHERE name = ?`, [paidAmount, paidAmount, invoice]);
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
                    "1110 - Cash - ICD", paymentMode, paidAmount, invoiceDate.toISOString().split('T')[0],
                    invoice, "payments", "Sales Invoice"
                ]
            );
        }catch(e){
            console.log("Error completing the sales invoice payment" ,e);
        }
    }

    const completeSalesOrderPayment = async () => {
        try{
            const currentDate = new Date();
            const userProfile = await db.getFirstAsync('SELECT * FROM User_Profile WHERE id =1;'); 
            // if(userProfile){
            const paymentName = 'new-payment-entry-'+generateRandomName();
            await db.runAsync(`INSERT INTO Payment_Entry(
                    name, owner,
                    docstatus, idx, naming_series, payment_type, payment_order_status,
                    posting_date, company, mode_of_payment, party_type, party,
                    party_name, book_advance_payments_in_separate_party_account, reconcile_on_advance_payment_date,
                    paid_from,
                    paid_from_account_currency, paid_from_account_balance, paid_to, paid_to_account_type, paid_to_account_currency,
                    paid_amount, paid_amount_after_tax, source_exchange_rate, base_paid_amount,
                    base_paid_amount_after_tax, received_amount, received_amount_after_tax, target_exchange_rate, base_received_amount,
                    base_received_amount_after_tax, total_allocated_amount, base_total_allocated_amount, unallocated_amount, difference_amount,
                    apply_tax_withholding_amount, base_total_taxes_and_charges,
                    total_taxes_and_charges, reference_date,
                    status, custom_remarks,
                    is_opening
                ) VALUES (
                    ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?,
                    ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?,
                    ?, ?,
                    ?, ?,
                    ?
                )`,
                [
                    paymentName, "Administrator",
                    0, 0, "ACC-PAY-"+currentDate.getFullYear()+"-", "Receive", "Initiated",
                    invoiceDate.toISOString().split('T')[0], userProfile.company, paymentMode, "Customer", commande.customer,
                    commande.customer_name, 0, 0,
                    userProfile.default_receivable_account,
                    userProfile.currency, 0, userProfile.default_cash_account, paymentMode, userProfile.currency,
                    paidAmount, 0, 1, paidAmount,
                    0, paidAmount, 0, 1, paidAmount,
                    0, paidAmount, paidAmount, 0, 0,
                    0, 0,
                    0, invoiceDate.toISOString().split('T')[0],
                    "Draft", 0,
                    "No"
                ] 

            );
            const paymentReferenceName = 'new-payment-entry-reference-'+generateRandomName();
            await db.runAsync(`INSERT INTO Payment_Reference_Entry(
                    name, modified_by,
                    docstatus, idx, reference_doctype, reference_name,
                    total_amount,
                    outstanding_amount, allocated_amount, exchange_rate, exchange_gain_loss, account,
                    parent, parentfield, parenttype
                ) VALUES (
                    ?, ?,
                    ?, ?, ?, ?,
                    ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?
                )`,
                [
                    paymentReferenceName, "Administrator",
                    0, 1, "Sales Order", commande.name,
                    commande.grand_total,
                    commande.grand_total, paidAmount, 1, 0, userProfile.default_receivable_account,
                    paymentName, "references", "Payment Entry"
                ]
            )
        // }
        }catch(e){
            console.log("Error saving sale order paymment",e);
        }
    }

    const handleSaveSalesInvoice = () => {
        try{
            if (!paidAmount ||  !invoiceDate){
                Alert.alert("Make sure you have entered the amount paid");
            }else if((paidAmount+paymentStat> commande.grand_total)){
                Alert.alert("Payment exceeded the sale order grand total");
            }else{
                if(commandeName && !invoice){
                    // saveSalesInvoice();
                    completeSalesOrderPayment();
                }
                // else if(invoice && !commandeName) {
                //     completeSalesInvoiceSaving();
                // }
                updateBudget(paidAmount);
                navigation.navigate('PaimentScreen', {salesOrderName: commandeName});
                Alert.alert("Payment procedeed successfully..");
            }
        }catch(e){
            Alert.alert("Payment failed to proceed");
            console.log("Error saving the payment, please try again" ,e);
        }
    };

    const generatePDF = async () => {
        console.log("Generating PDF");
        const options = {
            html: `
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .container { padding: 20px; }
                        .section { margin-bottom: 20px; }
                        .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
                        .text { font-size: 14px; color: #555; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="section">
                            <div class="title">Invoice Date</div>
                            <div class="text">${invoiceDate.toLocaleDateString()}</div>
                        </div>
                        <div class="section">
                            <div class="title">Customer</div>
                            <div class="text">${commande.customer}</div>
                        </div>
                        <div class="section">
                            <div class="title">Amount To Pay</div>
                            <div class="text">${commande.grand_total} DA</div>
                        </div>
                        <div class="section">
                            <div class="title">Payment Method</div>
                            <div class="text">${paymentMode}</div>
                        </div>
                    </div>
                </body>
                </html>
            `,
            fileName: 'payment',
            directory: 'Documents',
        };

        let file = await RNHTMLtoPDF.convert(options);
        console.log(file.filePath);
        alert(`PDF saved to ${file.filePath}`);
    };



    useEffect(() => { 
        if (isFocused){
            getCommandeDetails();
            //saveSalesInvoice();
        }
    },[isFocused]);

  return (
    <View style={{flex: 1, padding: 20, backgroundColor: '#f5f5f5'}}>
        {commande && salesOrderItems && salesOrderTaxes ? (
            <>
                <ScrollView style={{flex:1}} >
                    <View>
                        <TouchableOpacity 
                        style={{ borderRadius: 10,
                        backgroundColor: '#FFF',
                        marginVertical: 10,
                        padding: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 5, }}
                        onPress={showDatepicker}
                        >
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                                Select Invoice Date: {invoiceDate.toLocaleDateString()}
                            </Text>
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
                    <TouchableOpacity style={{
                        borderRadius: 10,
                        backgroundColor: '#FFF',
                        marginVertical: 10,
                        padding: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 5,}}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Customer: {commande.customer}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{borderRadius: 10, backgroundColor:"#FFF",  margin: 5, padding:20, justifyContent:'center'}}>
                        <Text style={{ fontSize: 14, color: '#555' }}>Amount To Pay: {commande.grand_total-paymentStat} DA</Text>
                        <TextInput
                        style={{
                        padding: 15,
                        backgroundColor: '#f0f0f0',
                        borderRadius: 10,
                        marginBottom: 15,
                        fontSize: 16,
                        borderColor: '#ccc',
                        borderWidth: 1,
                        }}
                        placeholder={`${(commande.grand_total-paymentStat).toFixed(2)} DA`}
                        keyboardType='numeric'
                        value={paidAmount}
                        onChangeText={text => setPaidAmount(Number(text))}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ borderRadius: 10, backgroundColor:"#FFF", margin: 5, padding:20, justifyContent:'center'}}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Payment Method: </Text>
                        <View style={{ borderWidth: 1, borderRadius: 5, borderColor: '#ccc' }}>
                            <Picker
                            selectedValue={paymentMode}
                            onValueChange={(itemValue) => setPaymentMode(itemValue)}
                            style={{ height: 50, width: '100%' }}
                            >
                                <Picker.Item label="Cash" value="Cash" />
                                <Picker.Item label="Cart Card" value="Cart Card" />
                            </Picker>
                        </View>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={{
                        borderRadius: 10,
                        backgroundColor: '#FFF',
                        marginVertical: 10,
                        padding: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 5,
                        alignItems: 'center',
                    }}
                    onPress={generatePDF}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#E59135' }}>Print Recipe </Text>
                    </TouchableOpacity> */}
                </ScrollView>
                <TouchableOpacity  style={{
                    height: 50,
                    marginVertical: 20,
                    width: '100%',
                    justifyContent: 'center',
                    backgroundColor: '#E59135',
                    alignItems: 'center',
                    borderRadius: 15,
                    }}
                >
                    <Text style={{ fontSize: 18, color: '#FFF', textAlign: 'center'}} onPress={handleSaveSalesInvoice}>Complete Payment</Text>
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