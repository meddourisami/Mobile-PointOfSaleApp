import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SyncContext } from '../Contexts/SyncContext';

const ManualSyncButton = () => {
    const { syncOption } = useContext(SyncContext);

    const handleSync = () => {
        if (syncOption === 'manual') {
            // Implement the synchronization logic
            console.log('Manual synchronization triggered.');
            // Example: Fetch data from API and update state
        }
    };

    const syncSaleOrderWithServer = async(log) => {
        setIsSalesOrderSyncing(true)
      try{
        const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
        // const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
          {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': token
              },
              body: JSON.stringify({
                  "doc": log.data,  
                  "action": "Save"
              })
          }
        );
      
        if(response.ok){
          response.json().then(async (data) => {
              console.log("saved to draft sale order", data.docs[0].name);
              await db.runAsync(`UPDATE sales_order_logs SET state= ? WHERE id = ?;`, ["Draft", log.id]);
              console.log(
                  {
                      "doc": JSON.stringify(data.docs[0]),  
                      "action": "Submit"
                  }
              );
              try{
                  const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
                  // const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
                  {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': token
                      },
                      body: JSON.stringify({
                          "doc": JSON.stringify(data.docs[0]),  
                          "action": "Submit"
                      })
                  })
                  console.log("Submitting sale order...", data.docs[0].name);
                  if(response.ok){
                      const data =await response.json();
  
                          await db.runAsync(`UPDATE payment_entry_logs SET associatedSaleOrder=? WHERE associatedSaleOrder=?`, [data.docs[0].name, log.name]);
  
                          const orderTosync = await db.getFirstAsync(`SELECT * FROM Sales_Order WHERE name= ?`,[log.name]);
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
                                  data.docs[0].name, orderTosync.owner,
                                  orderTosync.docstatus, orderTosync.title, orderTosync.naming_series, orderTosync.customer,
                                  orderTosync.customer_name, orderTosync.order_type, orderTosync.transaction_date, orderTosync.delivery_date,
                                  orderTosync.company, orderTosync.skip_delivery_note, orderTosync.currency, orderTosync.selling_price_list,
                                  orderTosync.set_warehouse,
                                  orderTosync.total_qty, orderTosync.total_net_weight, orderTosync.base_total, orderTosync.base_net_total,
                                  orderTosync.total, orderTosync.net_total, orderTosync.tax_category, orderTosync.taxes_and_charges,
                                  orderTosync.base_total_taxes_and_charges, orderTosync.total_taxes_and_charges, orderTosync.base_grand_total,
                                  orderTosync.base_rounding_adjustment, orderTosync.base_rounded_total, orderTosync.base_in_words, orderTosync.grand_total, orderTosync.rounding_adjustment,
                                  orderTosync.rounded_total, orderTosync.in_words, orderTosync.advance_paid, orderTosync.disable_rounded_total, orderTosync.apply_discount_on,
                                  orderTosync.base_discount_amount, orderTosync.discount_amount,
                                  orderTosync.customer_address, orderTosync.customer_group, orderTosync.territory,
                                  orderTosync.status, orderTosync.delivery_status,
                                  orderTosync.billing_status,
                                  orderTosync.amount_eligible_for_commission,
                                  orderTosync.group_same_items,
                                  orderTosync.language, orderTosync.is_internal_customer,
                                  orderTosync.party_account_currency
                              ]
                          );
                          await db.runAsync(`DELETE FROM Sales_Order WHERE name = ?`, [log.name]);
                          await db.runAsync(`UPDATE Sales_Order_Item SET parent=? WHERE parent=?`,[data.docs[0].name, log.name]);
                          await db.runAsync(`UPDATE Sales_Taxes_and_Charges SET parent=? WHERE parent=?`,[data.docs[0].name, log.name]);
                          await db.runAsync(`UPDATE sales_order_logs SET state= ? WHERE id = ?;`, ["Submitted", log.id]);
                          await db.runAsync(`UPDATE Payment_Reference_Entry SET reference_name= ? WHERE reference_name= ?;`, [data.docs[0].name ,log.name]);
                          await db.runAsync(`DELETE FROM sales_order_logs WHERE id = ?;`, [log.id]);
                      setIsSalesOrderSyncing(true)
                          console.log("Synced sale order succesfully and deleted from local logs", data.docs[0].name);
                  }else{
                      setIsSalesOrderSyncing(true)
                      console.log("Failed to sync sale order with server", await response.text());
                      return "data.docs[0].name";
                  }
              }catch(e){
                  setIsSalesOrderSyncing(true)
                  console.log("Failed to submit sale order", e);
                    return "data.docs[0].name";
                }
          });
        }else{
            setIsSalesOrderSyncing(false)
          console.log("Error from the server sale order", await response.text());
        }
      }catch(e){
          setIsSalesOrderSyncing(true)
        console.log('Error syncing sale orders with server', e);
      }
    };
  
    const syncPaymentEntryWithServer = async(log) => {
      try{
        const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
        // const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
          {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': token
              },
              body: JSON.stringify({
                  "doc": log.data,  
                  "action": "Save"
              })
          }
        );
        console.log(JSON.stringify({
          "doc": log.data,  
          "action": "Save"
        }));
      
      console.log(response.ok);
        if(response.ok){
          response.json().then(async (data) => {
            console.log("saved payment entry to draft", data.docs[0].name);
              await db.runAsync(`UPDATE payment_entry_logs SET state= ? WHERE id = ?;`, ["Draft", log.id]);
              console.log(
                  {
                      "doc": JSON.stringify(data.docs[0]),  
                      "action": "Submit"
                  }
              );
              try{
                  const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
                  // const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
                  {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': token
                      },
                      body: JSON.stringify({
                          "doc": JSON.stringify(data.docs[0]),  
                          "action": "Submit"
                      })
                  });
                  console.log("Submitting payment entry...", data.docs[0].name);
                  if(response.ok){
                      const data =await response.json();
                          paymentTosync= await db.getFirstAsync(`SELECT * FROM Payment_Entry WHERE name= ?`,[log.name]);
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
                            data.docs[0].name, paymentTosync.owner,
                            paymentTosync.docstatus, paymentTosync.idx, paymentTosync.naming_series, paymentTosync.payment_type, paymentTosync.payment_order_status,
                            paymentTosync.posting_date, paymentTosync.company, paymentTosync.mode_of_payment, paymentTosync.party_type, paymentTosync.party,                     
                            paymentTosync.party_name, paymentTosync.book_advance_payments_in_separate_party_account, paymentTosync.reconcile_on_advance_payment_date,                   
                            paymentTosync.paid_from,
                            paymentTosync.paid_from_account_currency, paymentTosync.paid_from_account_balance, paymentTosync.paid_to, paymentTosync.paid_to_account_type, paymentTosync.paid_to_account_currency,                         
                            paymentTosync.paid_amount, paymentTosync.paid_amount_after_tax, paymentTosync.source_exchange_rate, paymentTosync.base_paid_amount,                        
                            paymentTosync.base_paid_amount_after_tax, paymentTosync.received_amount, paymentTosync.received_amount_after_tax, paymentTosync.target_exchange_rate, paymentTosync.base_received_amount,                        
                            paymentTosync.base_received_amount_after_tax, paymentTosync.total_allocated_amount, paymentTosync.base_total_allocated_amount, paymentTosync.unallocated_amount, paymentTosync.difference_amount,                         
                            paymentTosync.apply_tax_withholding_amount, paymentTosync.base_total_taxes_and_charges,                         
                            paymentTosync.total_taxes_and_charges, paymentTosync.reference_date,                          
                            paymentTosync.status, paymentTosync.custom_remarks,                       
                            paymentTosync.is_opening
                          ]
                        );
                        await db.runAsync(`DELETE FROM Payment_Entry WHERE name = ?`, [log.name]);
                        await db.runAsync(`UPDATE Payment_Reference_Entry SET parent= ? WHERE parent= ?`, [data.docs[0].name, log.name]);
                        await db.runAsync(`UPDATE payment_entry_logs SET state= ? WHERE id = ?;`, ["Submitted", log.id]);
                        await db.runAsync(`DELETE FROM payment_entry_logs WHERE id = ?;`, [log.id]);
                        console.log("Synced payment entry success", data.docs[0].name);
                  }else{
                      console.log("Failed to sync payment entry with server", await response.text());
                  }
              }catch(e){
                  console.log("Failed to submit payment entry", e);
              }
          });
        }else{
          console.log("Error from the server payment entry", await response.text());
        }
      }catch(e){
        console.log('Error syncing payment entry with server', e);
      }
    }
  
    const syncDeliveryWithServer = async(log) => {
      try{
        const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
        // const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
          {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': token
              },
              body: JSON.stringify({
                  "doc": log.data,  
                  "action": "Save"
              })
          }
        );
        console.log(JSON.stringify({
          "doc": log.data,  
          "action": "Save"
        }));
      
      // const response = await fetch(
      //     'http://195.201.138.202:8006/api/method/frappe.desk.form.save.savedocs',
      //     {
      //         method: 'POST',
      //         headers: {
      //             'Content-Type': 'application/json',
      //             'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c'
      //         },
      //         body: JSON.stringify({
      //             "doc": JSON.stringify(log.data),  
      //             "action": "Save"
      //         })
      //     }
      // );
      console.log(response.ok);
        if(response.ok){
          response.json().then(async (data) => {
            console.log("saved delivery return to draft", data.docs[0].name);
              await db.runAsync(`UPDATE delivery_note_logs SET state= ? WHERE id = ?;`, ["Draft", log.id]);
              console.log(
                  {
                      "doc": JSON.stringify(data.docs[0]),  
                      "action": "Submit"
                  }
              );
              try{
                  const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
                  // const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
                  {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          'Authorization': token
                      },
                      body: JSON.stringify({
                          "doc": JSON.stringify(data.docs[0]),  
                          "action": "Submit"
                      })
                  })
                  console.log("Submitting delivery note...", data.docs[0].name);
                  if(response.ok){
                      const data =await response.json();
                          deliveryTosync= await db.getFirstAsync(`SELECT * FROM Deliveries WHERE name= ?`,[log.name]);
                          await db.runAsync(`INSERT INTO Deliveries(
                            name, modified, modified_by, owner,
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
                            data.docs[0].name, deliveryTosync.modified, deliveryTosync.modified_by, deliveryTosync.owner,
                            deliveryTosync.docstatus, deliveryTosync.idx, deliveryTosync.title, deliveryTosync.naming_series, deliveryTosync.customer,
                            deliveryTosync.tax_id, deliveryTosync.customer_name, deliveryTosync.posting_date, deliveryTosync.posting_time, deliveryTosync.set_posting_time,
                            deliveryTosync.company, deliveryTosync.amended_from, deliveryTosync.is_return, deliveryTosync.issue_credit_note, deliveryTosync.return_against,
                            deliveryTosync.cost_center, deliveryTosync.project, deliveryTosync.currency, deliveryTosync.conversion_rate, deliveryTosync.selling_price_list,
                            deliveryTosync.price_list_currency, deliveryTosync.plc_conversion_rate, deliveryTosync.ignore_pricing_rule, deliveryTosync.scan_barcode, deliveryTosync.pick_list,
                            deliveryTosync.set_warehouse, deliveryTosync.set_target_warehouse, deliveryTosync.total_qty, deliveryTosync.total_net_weight, deliveryTosync.base_total,
                            deliveryTosync.base_net_total, deliveryTosync.total, deliveryTosync.net_total, deliveryTosync.tax_category, deliveryTosync.taxes_and_charges,
                            deliveryTosync.shipping_rule, deliveryTosync.incoterm, deliveryTosync.named_place, deliveryTosync.base_total_taxes_and_charges, deliveryTosync.total_taxes_and_charges,
                            deliveryTosync.base_grand_total, deliveryTosync.base_rounding_adjustment, deliveryTosync.base_rounded_total, deliveryTosync.base_in_words, deliveryTosync.grand_total,
                            deliveryTosync.rounding_adjustment, deliveryTosync.rounded_total, deliveryTosync.in_words, deliveryTosync.disable_rounded_total, deliveryTosync.apply_discount_on,
                            deliveryTosync.base_discount_amount, deliveryTosync.additional_discount_percentage, deliveryTosync.discount_amount, deliveryTosync.other_charges_calculation, deliveryTosync.customer_address,
                            deliveryTosync.address_display, deliveryTosync.contact_person, deliveryTosync.contact_display, deliveryTosync.contact_mobile, deliveryTosync.contact_email,
                            deliveryTosync.shipping_address_name, deliveryTosync.shipping_address, deliveryTosync.dispatch_address_name, deliveryTosync.dispatch_address, deliveryTosync.company_address,
                            deliveryTosync.company_address_display, deliveryTosync.tc_name, deliveryTosync.terms, deliveryTosync.per_billed, deliveryTosync.status,
                            deliveryTosync.per_installed, deliveryTosync.installation_status, deliveryTosync.per_returned, deliveryTosync.transporter, deliveryTosync.driver,
                            deliveryTosync.lr_no, deliveryTosync.vehicle_no, deliveryTosync.transporter_name, deliveryTosync.driver_name, deliveryTosync.lr_date,
                            deliveryTosync.po_no, deliveryTosync.po_date, deliveryTosync.sales_partner, deliveryTosync.amount_eligible_for_commission, deliveryTosync.commission_rate,
                            deliveryTosync.total_commission, deliveryTosync.auto_repeat, deliveryTosync.letter_head, deliveryTosync.print_without_amount, deliveryTosync.group_same_items,
                            deliveryTosync.select_print_heading, deliveryTosync.language, deliveryTosync.is_internal_customer, deliveryTosync.represents_company, deliveryTosync.inter_company_reference,
                            deliveryTosync.customer_group, deliveryTosync.territory, deliveryTosync.source, deliveryTosync.campaign, deliveryTosync.excise_page,
                            deliveryTosync.instructions, deliveryTosync._user_tags, deliveryTosync._comments, deliveryTosync._assign, deliveryTosync._liked_by,
                            deliveryTosync._seen, deliveryTosync.custom_solde, deliveryTosync.custom_total_unpaid, deliveryTosync.custom_delivery_details, deliveryTosync.custom_driver,
                            deliveryTosync.custom_driver_name, deliveryTosync.custom_vehicle
                          ]
                        );
                        await db.runAsync(`DELETE FROM Deliveries WHERE name = ?`, [log.name]);
                        await db.runAsync(`UPDATE delivery_note_logs SET state= ? WHERE id = ?;`, ["Submitted", log.id]);
                        await db.runAsync(`DELETE FROM delivery_note_logs WHERE id = ?;`, [log.id]);
                        console.log("Synced delivery note return successfully", data.docs[0].name);
                  }else{
                      console.log("Failed to sync delivery note with server", await response.text());
                  }
              }catch(e){
                  console.log("Failed to submit delivery note", e);
              }
          });
        }else{
          console.log("Error from the server delivery note", await response.text());
        }
      }catch(e){
        console.log('Error syncing delivery note with server', e);
      }
    };
  
  
    const syncDraftDeliverywithServer = async (log) => {
      try{
        console.log("started sync");
        const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.save.savedocs',
          {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': token
              },
              body: JSON.stringify({
                  "doc": log.data,  
                  "action": "Submit"
              })
          })
          console.log(JSON.stringify({
            "doc": log.data,  
            "action": "Submit"
        }))
          console.log("Submitting delivery note...", log.name);
          console.log(response);
          if(response.ok){
            await db.runAsync(`DELETE FROM delivery_note_logs WHERE id = ?;`, [log.id]);
            console.log("Successfully submitted delivery note and deleted from log", log.name);
          }
      }catch(e){
        console.log("Error submitting delivery note",e);
      }
    };
  
  
    const syncState = async() => {
      try{
        setIsSyncing(true);
        setDisabledButton(true);
        console.log('Syncing ...');
        if(deliveryLogs) {
          await Promise.all(deliveryLogs.map(async(log) => {
            if(log.state === "Draft" ){
              console.log("submitting draft to server", log.name);
              console.log(JSON.parse(log.data));
              await syncDraftDeliverywithServer(log);
            }else{
              console.log("starting syncronizing", log.name);
              await syncDeliveryWithServer(log);
            }
          }));
        } 
        if (saleOrderLogs) {
            await Promise.all(saleOrderLogs.map(async(log) => {
              if(log.state === "Submitted" ){
  
                console.log("already submitted to server", log.name);
              }else{
                console.log("starting syncronizing", log.name);
                await syncSaleOrderWithServer(log);
              }
          }));
        };
        if (paymentEntryLogs) {
          await Promise.all(paymentEntryLogs.map(async(paymentLog) => {
            if(paymentLog.state === "Submitted"){
              console.log("already submitted to server", paymentLog.name);
              return;
            }else {
              let logData= JSON.parse(paymentLog.data);
              let associatedSaleOrderName= await db.getFirstAsync(`SELECT associatedSaleOrder FROM payment_entry_logs WHERE name=?;`,[paymentLog.name]);
              
              if (associatedSaleOrderName?.associatedSaleOrder?.includes("SAL-ORD-")) {
                console.log("name", associatedSaleOrderName);
  
                logData.references = logData.references.map((item) => {
                  return {
                    ...item, 
                    reference_name: associatedSaleOrderName.associatedSaleOrder,
                  };
                });
  
                console.log("updated stringified logdata", JSON.stringify(logData));
                try {
                  // paymentLog.data = JSON.stringify(logData);
                  console.log("paymentLog before update", paymentLog.data);
              
                  await db.runAsync(`UPDATE payment_entry_logs SET data=? WHERE name=?`, [JSON.stringify(logData), paymentLog.name]);
                  
                  const updatedPaymentLog = await db.runAsync(`SELECT * FROM payment_entry_logs WHERE name=?`, [paymentLog.name]);
                  // console.log(updatedPaymentLog);
              
                  console.log("starting syncing payment entry", paymentLog.name, "data after update", paymentLog.data);
                  
                  syncPaymentEntryWithServer(paymentLog);
                } catch (error) {
                  console.error("Error syncing payment entry:", error);
                }
              } else {
                console.log("Failed to get associated sale order name");
              }
            }
          })); 
        };
      }catch(e){
        console.log('Error syncing data with server', e);
      }finally {
        setIsSyncing(false);
        // setDisabledButton(false);
      }
    };

    return (
        syncOption === 'manual' && (
            <TouchableOpacity style={styles.button} onPress={handleSync}>
                <Text style={styles.buttonText}>Sync Now</Text>
            </TouchableOpacity>
        )
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default ManualSyncButton;
