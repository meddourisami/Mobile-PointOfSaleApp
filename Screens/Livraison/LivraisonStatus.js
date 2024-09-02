import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native'
import { useSQLiteContext } from 'expo-sqlite';

const LivraisonStatus = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { deliveryName } = route.params;
    const isFocused= useIsFocused();
    const db = useSQLiteContext();
    const [livraison, setLivraison] = useState(null);
    const [deliveryItems, setDeliveryItems] = useState([]);
    const [deliveryTax, setDeliveryTax] = useState(null);

    const getDeliveryNote = async() =>{
        try{
            const delivery =await db.getFirstAsync(`SELECT * FROM Deliveries WHERE name = ?`,[deliveryName]);
            setLivraison(delivery);
            const items =await db.getAllAsync(`SELECT * FROM Delivery_Note_Item WHERE parent= ?`, [deliveryName]);
            setDeliveryItems(items);
            const tax= await db.getFirstAsync(`SELECT * FROM Sales_Taxes_and_Charges WHERE parent= ?`, [deliveryName]);
            setDeliveryTax(tax);
        }catch(e){
            console.log("Error getting delivery note from local database",e);
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

    function modifyTaxDetail(taxDetailString) {
        
        let taxDetailObject = JSON.parse(taxDetailString);
    
        
        for (let item in taxDetailObject) {
            
            if (taxDetailObject[item].length >= 2) {
                taxDetailObject[item][1] = -Math.abs(taxDetailObject[item][1]);
            }
        }
    
        return JSON.stringify(taxDetailObject);
    }

    const createDeliveryNoteReturn = async() => {
        try{
            const deliveryNoteName = 'new-delivery-note-'+generateRandomName();
            await db.runAsync(`INSERT OR REPLACE INTO Deliveries
                (
                    name, creation, modified, modified_by, owner,
                    docstatus, idx, title, naming_series, customer,
                    tax_id, customer_name, posting_date, posting_time, set_posting_time,
                    company, amended_from, is_return, issue_credit_note, return_against,
                    cost_center, project, currency, conversion_rate, selling_price_list,
                    price_list_currency, plc_conversion_rate, ignore_pricing_rule, scan_barcode, pick_list,
                    set_warehouse, set_target_warehouse, total_qty, total_net_weight, base_total,
                    base_net_total, total, net_total, tax_category, taxes_and_charges,
                    shipping_rule, incoterm, named_place, base_total_taxes_and_charges, total_taxes_and_charges,
                    base_grand_total, base_rounding_adjustment, base_rounded_total, base_in_words, grand_total,
                    rounding_adjustment, rounded_total, in_words, disable_rounded_total, apply_discount_on,
                    base_discount_amount, additional_discount_percentage, discount_amount, other_charges_calculation, customer_address,
                    address_display, contact_person, contact_display, contact_mobile, contact_email,
                    shipping_address_name, shipping_address, dispatch_address_name, dispatch_address, company_address,
                    company_address_display, tc_name, terms, per_billed, status,
                    per_installed, installation_status, per_returned, transporter, driver,
                    lr_no, vehicle_no, transporter_name, driver_name, lr_date,
                    po_no, po_date, sales_partner, amount_eligible_for_commission, commission_rate,
                    total_commission, auto_repeat, letter_head, print_without_amount, group_same_items,
                    select_print_heading, language, is_internal_customer, represents_company, inter_company_reference,
                    customer_group, territory, source, campaign, excise_page,
                    instructions, _user_tags, _comments, _assign, _liked_by,
                    _seen, custom_solde, custom_total_unpaid, custom_delivery_details, custom_driver,
                    custom_driver_name, custom_vehicle
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
                    ?, ?)`,
                    [
                        deliveryNoteName, livraison.creation, livraison.modified, livraison.modified_by, livraison.owner,
                        livraison.docstatus, livraison.idx, livraison.title, livraison.naming_series, livraison.customer,
                        livraison.tax_id, livraison.customer_name, livraison.posting_date, livraison.posting_time, livraison.set_posting_time,
                        livraison.company, livraison.amended_from, 1, livraison.issue_credit_note, livraison.name,
                        livraison.cost_center, livraison.project, livraison.currency, livraison.conversion_rate, livraison.selling_price_list,
                        livraison.price_list_currency, livraison.plc_conversion_rate, livraison.ignore_pricing_rule, livraison.scan_barcode, livraison.pick_list,
                        livraison.set_warehouse, livraison.set_target_warehouse, -livraison.total_qty, livraison.total_net_weight, -livraison.base_total,
                        -livraison.base_net_total, -livraison.total, -livraison.net_total, livraison.tax_category, -livraison.taxes_and_charges,
                        livraison.shipping_rule, livraison.incoterm, livraison.named_place, -livraison.base_total_taxes_and_charges, -livraison.total_taxes_and_charges,
                        -livraison.base_grand_total, livraison.base_rounding_adjustment, -livraison.base_rounded_total, livraison.base_in_words, -livraison.grand_total,
                        livraison.rounding_adjustment, -livraison.rounded_total, livraison.in_words, livraison.disable_rounded_total, livraison.apply_discount_on,
                        livraison.base_discount_amount, livraison.additional_discount_percentage, livraison.discount_amount, livraison.other_charges_calculation, livraison.customer_address,
                        livraison.address_display, livraison.contact_person, livraison.contact_display, livraison.contact_mobile, livraison.contact_email,
                        livraison.shipping_address_name, livraison.shipping_address, livraison.dispatch_address_name, livraison.dispatch_address, livraison.company_address,
                        livraison.company_address_display, livraison.tc_name, livraison.terms, livraison.per_billed, livraison.status,
                        livraison.per_installed, livraison.installation_status, livraison.per_returned, livraison.transporter, livraison.driver,
                        livraison.lr_no, livraison.vehicle_no, livraison.transporter_name, livraison.driver_name, livraison.lr_date,
                        livraison.po_no, livraison.po_date, livraison.sales_partner, -livraison.amount_eligible_for_commission, livraison.commission_rate,
                        livraison.total_commission, livraison.auto_repeat, livraison.letter_head, livraison.print_without_amount, livraison.group_same_items,
                        livraison.select_print_heading, livraison.language, livraison.is_internal_customer, livraison.represents_company, livraison.inter_company_reference,
                        livraison.customer_group, livraison.territory, livraison.source, livraison.campaign, livraison.excise_page,
                        livraison.instructions, livraison._user_tags, livraison._comments, livraison._assign, livraison._liked_by,
                        livraison._seen, livraison.custom_solde, livraison.custom_total_unpaid, livraison.custom_delivery_details, livraison.custom_driver,
                        livraison.custom_driver_name, livraison.custom_vehicle
                    ]
                );

                const deliveryNoteItemName = 'new-delivery-note-item-'+generateRandomName();
                await Promise.all(deliveryItems.map(async (item)=> {
                    await db.runAsync(`INSERT INTO Delivery_Note_Item(
                        name, creation, modified, modified_by, owner,
                        docstatus, idx, barcode, has_item_scanned, item_code,
                        item_name, customer_item_code, description, brand, item_group,
                        image, qty, stock_uom, uom, conversion_factor,
                        stock_qty, returned_qty, price_list_rate, base_price_list_rate, margin_type,
                        margin_rate_or_amount, rate_with_margin, discount_percentage, discount_amount, base_rate_with_margin,
                        rate, amount, base_rate, base_amount, pricing_rules,
                        stock_uom_rate, is_free_item, grant_commission, net_rate, net_amount,
                        item_tax_template, base_net_rate, base_net_amount, billed_amt, incoming_rate,
                        weight_per_unit, total_weight, weight_uom, warehouse, target_warehouse,
                        quality_inspection, allow_zero_valuation_rate, against_sales_order, so_detail, against_sales_invoice,
                        si_detail, dn_detail, pick_list_item, serial_and_batch_bundle, use_serial_batch_fields,
                        serial_no, batch_no, actual_batch_qty, actual_qty, installed_qty,
                        item_tax_rate, packed_qty, received_qty, expense_account, material_request,
                        purchase_order, purchase_order_item, material_request_item, cost_center, project,
                        page_break, parent, parentfield, parenttype
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
                        ?, ?, ?, ?
                    )`,
                    [
                        deliveryNoteItemName, item.creation, item.modified, item.modified_by, item.owner,
                        item.docstatus, item.idx, item.barcode, item.has_item_scanned, item.item_code,
                        item.item_name, item.customer_item_code, item.description, item.brand, item.item_group,
                        item.image, -item.qty, item.stock_uom, item.uom, item.conversion_factor,
                        -item.stock_qty, item.returned_qty, item.price_list_rate, item.base_price_list_rate, item.margin_type,
                        item.margin_rate_or_amount, item.rate_with_margin, item.discount_percentage, item.discount_amount, item.base_rate_with_margin,
                        item.rate, -item.amount, item.base_rate, -item.base_amount, item.pricing_rules,
                        item.stock_uom_rate, item.is_free_item, item.grant_commission, item.net_rate, -item.net_amount,
                        item.item_tax_template, item.base_net_rate, -item.base_net_amount, item.billed_amt, item.incoming_rate,
                        item.weight_per_unit, item.total_weight, item.weight_uom, item.warehouse, item.target_warehouse,
                        item.quality_inspection, item.allow_zero_valuation_rate, item.against_sales_order, item.so_detail, item.against_sales_invoice,
                        item.si_detail, item.dn_detail, item.pick_list_item, item.serial_and_batch_bundle, item.use_serial_batch_fields,
                        item.serial_no, item.batch_no, item.actual_batch_qty, item.actual_qty, item.installed_qty,
                        item.item_tax_rate, item.packed_qty, item.received_qty, item.expense_account, item.material_request,
                        item.purchase_order, item.purchase_order_item, item.material_request_item, item.cost_center, item.project,
                        item.page_break, deliveryNoteName, item.parentfield, item.parenttype
                    ]
                    );
                    }));

                    const deliveryTaxName = 'new-sales-taxes-and-charges-'+generateRandomName();
                    await db.runAsync(`INSERT INTO Sales_Taxes_and_Charges(
                      name, owner, creation, modified, modified_by,
                      docstatus, idx, charge_type, row_id, account_head,
                      description, included_in_print_rate, included_in_paid_amount, cost_center, rate,
                      account_currency, tax_amount, total, tax_amount_after_discount_amount, base_tax_amount,
                      base_total, base_tax_amount_after_discount_amount, item_wise_tax_detail, dont_recompute_tax, parent,
                      parentfield, parenttype
                    ) VALUES (
                      ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?,
                      ?, ?
                    )`,
                        [
                            deliveryTaxName, deliveryTax.owner, deliveryTax.creation, deliveryTax.modified, deliveryTax.modified_by,
                            deliveryTax.docstatus, deliveryTax.idx, deliveryTax.charge_type, deliveryTax.row_id, deliveryTax.account_head,
                            deliveryTax.description, deliveryTax.included_in_print_rate, deliveryTax.included_in_paid_amount, deliveryTax.cost_center, deliveryTax.rate,
                            deliveryTax.account_currency, -deliveryTax.tax_amount, -deliveryTax.total, -deliveryTax.tax_amount_after_discount_amount, -deliveryTax.base_tax_amount,
                            -deliveryTax.base_total, -deliveryTax.base_tax_amount_after_discount_amount, modifyTaxDetail(deliveryTax.item_wise_tax_detail), deliveryTax.dont_recompute_tax, deliveryNoteName,
                            deliveryTax.parentfield, deliveryTax.parenttype
                        ]
                    );
        }catch(e){
            console.log("Error creating return delivery note",e);
        };
    };

    const handleReturn = () => {
        createDeliveryNoteReturn();
        navigation.navigate('LivraisonScreen');
    };

    // const handleComplete = () => {

    // };
    

    useEffect(() => {
        if(isFocused){
            const initialize = async() => {
                await getDeliveryNote();
            }
            initialize();
        }
    }, [isFocused]);

  return (
    <View>
      <Text>Livraison Status</Text>
      {!livraison ? (
        <Text>Loading...</Text>
      ) : (
        <View>
            <View style={{backgroundColor:'#FFF', margin:10, padding:10}}>
                <Text style={{fontSize:16, fontWeight:'bold'}}>{livraison.name}</Text>
                <Text>Customer: {livraison.customer}</Text>
                <Text>Quantity: {livraison.total_qty}</Text>
                <Text>Price: {livraison.total}</Text>
                <Text>Tax Applied: {livraison.tax_category}</Text>
                <Text>Transporter Name: {livraison.transporter_name}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
                <TouchableOpacity style={styles.button} onPress={handleReturn}>
                    <Text style={styles.buttonText}>Mark as Return</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Complete Delivery Note</Text>
                </TouchableOpacity>
            </View>
        </View>
      )}
    </View>
  );
}

export default LivraisonStatus;

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#E59135',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonText: {
        color: '#FFF', 
        fontSize: 16, 
        fontWeight: 'bold' 
    },
})