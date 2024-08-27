import { FlatList, TouchableOpacity, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import * as CryptoJS from 'crypto-js';
import NetInfo from '@react-native-community/netinfo';
import { useSQLiteContext } from 'expo-sqlite';

const LivraisonScreen = () => {
  const db = useSQLiteContext();

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const Content =  () => {
      const [deliveries , setDeliveries] = useState([]);
      const [livraisons, setLivraisons] = useState([]);
      const [displayData , setDisplayData] = useState([]);

      const getHash = (data) => {
        return CryptoJS.MD5(JSON.stringify(data)).toString();
      };

      const createMetadataTable = async () => {
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS DeliveryMetadata (
                id INTEGER PRIMARY KEY,
                data_hash TEXT
            );
        `);
        const rowCount = await db.runAsync('SELECT COUNT(*) as count FROM DeliveryMetadata;');
        if (rowCount.count === 0) {
            await db.runAsync('INSERT INTO DeliveyMetadata (id, data_hash) VALUES (1, "");');
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

      const getDeliveriesfromAPI = async () => {
          try{
            const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.reportview.get', {
                method: 'POST',
                headers: {
                  'Authorization': 'token 94c0faa6066a7c0:982654458dc9011',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  "doctype": "Delivery Note",
                  "fields": [
                    "*"
                  ],
                  "filters": [
                    ["Delivery Note", "set_warehouse", "=", "Magasin Fille 1 - ICD"]
                  ],
                  "order_by": "`tabDelivery Note`.`modified` desc",
                  "start": 0,
                  "page_length": 20,
                  "view": "List",
                  "group_by": "",
                  "with_comment_count": 1
                }),
            });
            //   const response = await fetch('http://195.201.138.202:8006/api/resource/Delivery Note?fields=["*"]', {
            //       method: 'GET',
            //       headers: {
            //           'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
            //       },
            //   });
              const data = await response.json();
              console.log(data);
              const selectedDeliveries = transformJson(data);
              console.log("data",selectedDeliveries);
              const newHash = getHash(data);

                const existingHash = await db.runAsync('SELECT data_hash FROM DeliveryMetadata WHERE id = 1;');
                if (existingHash !== newHash) {
                    setDeliveries(selectedDeliveries);
                    await saveInLocalDeliveries(selectedDeliveries);
                    await db.runAsync('UPDATE DeliveryMetadata SET data_hash = ? WHERE id = 1;', [newHash]);
                }
              return selectedDeliveries;
          }catch (error){
            console.log('error fetching data',error);
          }
      };

      const saveInLocalDeliveries = async (deliveries) => {
        try{
            await Promise.all(deliveries.map(async (delivery) => {
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
                    delivery.name, delivery.creation, delivery.modified, delivery.modified_by, delivery.owner,
                    delivery.docstatus, delivery.idx, delivery.title, delivery.naming_series, delivery.customer,
                    delivery.tax_id, delivery.customer_name, delivery.posting_date, delivery.posting_time, delivery.set_posting_time,
                    delivery.company, delivery.amended_from, delivery.is_return, delivery.issue_credit_note, delivery.return_against,
                    delivery.cost_center, delivery.project, delivery.currency, delivery.conversion_rate, delivery.selling_price_list,
                    delivery.price_list_currency, delivery.plc_conversion_rate, delivery.ignore_pricing_rule, delivery.scan_barcode, delivery.pick_list,
                    delivery.set_warehouse, delivery.set_target_warehouse, delivery.total_qty, delivery.total_net_weight, delivery.base_total,
                    delivery.base_net_total, delivery.total, delivery.net_total, delivery.tax_category, delivery.taxes_and_charges,
                    delivery.shipping_rule, delivery.incoterm, delivery.named_place, delivery.base_total_taxes_and_charges, delivery.total_taxes_and_charges,
                    delivery.base_grand_total, delivery.base_rounding_adjustment, delivery.base_rounded_total, delivery.base_in_words, delivery.grand_total,
                    delivery.rounding_adjustment, delivery.rounded_total, delivery.in_words, delivery.disable_rounded_total, delivery.apply_discount_on,
                    delivery.base_discount_amount, delivery.additional_discount_percentage, delivery.discount_amount, delivery.other_charges_calculation, delivery.customer_address,
                    delivery.address_display, delivery.contact_person, delivery.contact_display, delivery.contact_mobile, delivery.contact_email,
                    delivery.shipping_address_name, delivery.shipping_address, delivery.dispatch_address_name, delivery.dispatch_address, delivery.company_address,
                    delivery.company_address_display, delivery.tc_name, delivery.terms, delivery.per_billed, delivery.status,
                    delivery.per_installed, delivery.installation_status, delivery.per_returned, delivery.transporter, delivery.driver,
                    delivery.lr_no, delivery.vehicle_no, delivery.transporter_name, delivery.driver_name, delivery.lr_date,
                    delivery.po_no, delivery.po_date, delivery.sales_partner, delivery.amount_eligible_for_commission, delivery.commission_rate,
                    delivery.total_commission, delivery.auto_repeat, delivery.letter_head, delivery.print_without_amount, delivery.group_same_items,
                    delivery.select_print_heading, delivery.language, delivery.is_internal_customer, delivery.represents_company, delivery.inter_company_reference,
                    delivery.customer_group, delivery.territory, delivery.source, delivery.campaign, delivery.excise_page,
                    delivery.instructions, delivery._user_tags, delivery._comments, delivery._assign, delivery._liked_by,
                    delivery._seen, delivery.custom_solde, delivery.custom_total_unpaid, delivery.custom_delivery_details, delivery.custom_driver,
                    delivery.custom_driver_name, delivery.custom_vehicle
                  ]
                );
              }));
          }catch(e){
            console.log('Error saving data to local database', e);
          }
    };

    // const syncDataWithServer = async (data) => {
    //   const request = await fetch("");
    // };

      const getLivraisons = async () => {
          try{
              const allLivraisons= await db.getAllAsync(`SELECT * FROM Deliveries;`);
              setLivraisons(allLivraisons);
              setDisplayData(allLivraisons);
          }catch(e){
              console.log(e);
          }
      };

      useEffect(() => {
          if(isFocused){
            const initialize = async () => {
              await createMetadataTable();
              NetInfo.fetch().then((state) => {
                  if (state.isConnected) {
                      getDeliveriesfromAPI();
                  } else {
                      getLivraisons();
                  }
              });
          };
          initialize();
          }
      }, [isFocused]);

      return (
          <View>
                  {deliveries.length=== 0 ? (
                      <Text>No data yet.</Text>
                  ) : (
                      <FlatList 
                          data ={deliveries}
                          keyExtractor={(item) => (item.name).toString()}
                          renderItem={({item}) => (
                              <TouchableOpacity onPress={() => navigation.navigate('LivraisonStatus', { deliveryId: item.name })}>
                                  <View style={{marginBottom:10}}>
                                      <Text style={{fontWeight:'bold'}}>{item.name}</Text>
                                      <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                                          <Text>Customer: {item.customer_name}</Text>
                                          <Text>Delivery Date: {item.posting_time}</Text>
                                          <Text style={{fontWeight:'semibold'}}>Adresse: {item.set_warehouse}</Text>
                                          <Text>Delivery Price: {item.total}</Text>
                                      </View>
                                  </View>
                              </TouchableOpacity>
                          )}
                      />
                  )}  
          </View>
      );
  };

  return (
    <View style={styles.container}>
      <View >
        <Text style={styles.header}>List of Deliveries</Text>
        <Content style={styles.items}/>
      </View>
      <AntDesign 
        name="pluscircle" 
        size={30} 
        color="#284979" 
        style={styles.icon} 
        onPress={() => navigation.navigate('AddLivraisonScreen')}
        />
      </View>
  );
}

export default LivraisonScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    header: {
        fontSize: 24,
    },
    icon: {
        position: 'absolute',
        bottom: 30,
        right: 30,

    },
    items: {
        backgroundColor: '#fff',
    },
});