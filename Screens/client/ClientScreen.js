import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState , useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import * as CryptoJS from 'crypto-js';
import { FontAwesome5 } from '@expo/vector-icons';

const ClientScreen = () => {
    const db = useSQLiteContext();

    const navigation = useNavigation();
    const isFocused = useIsFocused();

    const Content =  () => {
        const [clients , setClients] = useState([]);
        const [customers , setCustomers] = useState([]);
        //const [displayData , setDisplayData] = useState([]);

        const getHash = (data) => {
            return CryptoJS.MD5(JSON.stringify(data)).toString();
        };

        const createMetadataTable = async () => {
            await db.runAsync(`
                CREATE TABLE IF NOT EXISTS CustomerMetadata (
                    id INTEGER PRIMARY KEY,
                    data_hash TEXT
                );
            `);
            const rowCount = await db.runAsync('SELECT COUNT(*) as count FROM CustomerMetadata;');
            if (rowCount.count === 0) {
                await db.runAsync('INSERT INTO CustomerMetadata (id, data_hash) VALUES (1, "");');
            }
        };

        // const createLocalChangesTable = async () => {
        //     //await db.runAsync(`DELETE FROM CustomerLocalLogs`);
        //     await db.runAsync(`
        //         CREATE TABLE IF NOT EXISTS CustomerLocalLogs (
        //             id INTEGER PRIMARY KEY AUTOINCREMENT,
        //             customer_name TEXT,
        //             action TEXT,
        //             data TEXT
        //         );
        //     `);
        // };

        const getCustomersfromAPI = async () => {
            try{
                // const response = await fetch('http://195.201.138.202:8006/api/resource/Customer?fields=["*"]', {
                //     method: 'GET',
                //     headers: {
                //         'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
                //     },
                // });
                const response = await fetch('http://195.201.138.202:8006/api/resource/Customer?fields=["*"]', {
                    method: 'GET',
                    headers: {
                        'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
                    },
                });
                const json = await response.json();
                
                const newHash = getHash(json.data);

                const existingHash = await db.runAsync('SELECT data_hash FROM CustomerMetadata WHERE id = 1;');
                if (existingHash !== newHash) {

                    await Promise.all(customers.map(async (customer) => {
                        const syncedCustomer = await db.runAsync(`SELECT synced FROM Customers WHERE name = ?;`, [customer.name]);
                        if (syncedCustomer && syncedCustomer.synced === 1) {

                            return;
                        }
                        await db.runAsync(`DELETE FROM Customers WHERE name = ?;`, [customer.name]);
                    }));

                    await saveInLocalCustomers(json.data);
                    await db.runAsync('UPDATE CustomerMetadata SET data_hash = ? WHERE id = 1;', [newHash]);
                    setCustomers(json.data);
                }
                return json.data;
            } catch (error){
                console.log('error fetching customers',error);
            }
        };

        const saveInLocalCustomers = async (customers) => {
            try{
                await Promise.all(customers.map(async (customer) => {
                    let customer_synced = 1;
                    await db.runAsync(`INSERT OR REPLACE INTO Customers 
                            (
                                name, creation, modified, modified_by, owner,
                                docstatus, idx, naming_series, salutation, customer_name, customer_type,
                                customer_group, territory, gender, lead_name, opportunity_name,
                                account_manager, image, default_price_list, default_bank_account, default_currency,
                                is_internal_customer, represents_company, market_segment, industry, customer_pos_id,
                                website, language, customer_details, customer_primary_contact, mobile_no,
                                email_id, customer_primary_address, primary_address, tax_id, tax_category,
                                tax_withholding_category, payment_terms, loyalty_program, loyalty_program_tier, default_sales_partner,
                                default_commission_rate, so_required, dn_required, is_frozen, disabled,
                                _user_tags, _comments, _assign, _liked_by, custom_nrc,
                                custom_nic, custom_nai, custom_code, custom_address, custom_phone,
                                custom_nif, custom_stateprovince, custom_fax, custom_activity, custom_email_address,
                                custom_credit_limit, custom_register, custom_deadlines_to_max_in_nb_day, custom_total_unpaid, custom_capital_stock,
                                custom_item, synced
                            ) VALUES (
                                ?, ?, ?, ?, ?,
                                ?, ?, ?, ?, ?, ?,
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
                                customer.name, customer.creation, customer.modified, customer.modified_by, customer.owner,
                                customer.docstatus, customer.idx, customer.naming_series, customer.salutation, customer.customer_name, customer.customer_type,
                                customer.customer_group, customer.territory, customer.gender, customer.lead_name, customer.opportunity_name,
                                customer.account_manager, customer.image, customer.default_price_list, customer.default_bank_account, customer.default_currency,
                                customer.is_internal_customer, customer.represents_company, customer.market_segment, customer.industry, customer.customer_pos_id,
                                customer.website, customer.language, customer.customer_details, customer.customer_primary_contact, customer.mobile_no,
                                customer.email_id, customer.customer_primary_address, customer.primary_address, customer.tax_id, customer.tax_category,
                                customer.tax_withholding_category, customer.payment_terms, customer.loyalty_program, customer.loyalty_program_tier, customer.default_sales_partner,
                                customer.default_commission_rate, customer.so_required, customer.dn_required, customer.is_frozen, customer.disabled,
                                customer._user_tags, customer._comments, customer._assign, customer._liked_by, customer.custom_nrc,
                                customer.custom_nic, customer.custom_nai, customer.custom_code, customer.custom_address, customer.custom_phone,
                                customer.custom_nif, customer.custom_stateprovince, customer.custom_fax, customer.custom_activity, customer.custom_email_address,
                                customer.custom_credit_limit, customer.custom_register, customer.custom_deadlines_to_max_in_nb_day, customer.custom_total_unpaid, customer.custom_capital_stock,
                                customer.custom_item, customer_synced
                            ]
                        );
                }));
            }catch(e){
                console.log('Error saving customers to local database', e);
            }
        };

        const syncDataWithServer = async (client) => {
            try {
                const {
                    name,
                    customer_name,
                    customer_type,
                    customer_group,
                    territory,
                    custom_code,
                    custom_address,
                    custom_phone
                } = client;

                console.log(name);

                const data = {
                    name,
                    customer_name,
                    customer_type,
                    customer_group,
                    territory,
                    custom_code,
                    custom_address,
                    custom_phone,
                    doctype: "Customer",
                    __islocal: 1,
                    owner: "Administrator",
                };

                console.log("data", JSON.stringify({
                    "doc": JSON.stringify(data),  
                    "action": "Save"
                }));

                const response = await fetch(
                    'http://195.201.138.202:8006/api/method/frappe.desk.form.save.savedocs',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c'
                            },
                            body: JSON.stringify({
                                "doc": JSON.stringify(data),  
                                "action": "Save"
                            })
                        }
                    );
                if(response.ok){
                    console.log("Synced successfully");
                    let customer_synced = 1;
                    await db.runAsync(`UPDATE Customers SET synced = 1 WHERE name = ?`, [name]);
                }else{
                    console.log("Error from the server", await response.text());
                }

            }catch(e){
                console.log('Error saving data to server', e);
            }
        };

        const getClients = async () => {
            try{
                const allClients = await db.getAllAsync(`SELECT * FROM Customers;`);
                setClients(allClients);
                //setDisplayData(allClients);
            }catch(e){
                console.log("error retreiving clients", e);
            }
        };

        useEffect(() => {   
            if(isFocused){
                const initialize = async () => {
                    getCustomersfromAPI();
                    getClients();

                    //NetInfo.fetch().then((state) => {
                      //  if (state.isConnected) {
                            //console.log("Connection established")
                            //syncDataWithServer();
                        //} else {
                            //console.log("No internet connection")
                        //}
                    //});
                };
                initialize();
            }
        }, [isFocused]);

        useEffect(() => {
            if (clients) {
                getClients();
            }
        }, [clients]);

        return (
            <View>
                    {clients.length=== 0 ? (
                        <Text>No data yet.</Text>
                    ) : (
                        <FlatList 
                            data ={clients}
                            keyExtractor={(item) => item.name}
                            renderItem={({item}) => (
                                <TouchableOpacity style={{backgroundColor:'#fff' , marginBottom:10, borderRadius:15, margin:5}} onPress={() => navigation.navigate('ItemGroupScreen', { customer: item })}>
                                    <View style={{marginBottom:10, marginStart:10}}>
                                        <Text style={{fontWeight:'bold'}}>{item.name}</Text>
                                        <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10}}>
                                            <View>
                                                <Text>{item.name}</Text>
                                                <Text style={{fontWeight:'semibold'}}>Adresse:{item.custom_address}</Text>
                                                <Text>Phone: {item.custom_phone}</Text>
                                            </View>
                                            <View style={{flexDirection:'column', marginEnd:20 , paddingLeft:20, marginLeft:10}}>
                                                <AntDesign name="edit" size={24} style={{paddingBottom:10}} color="black" onPress={() => navigation.navigate('EditClientScreen', { customerName: item.name })} />
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <FontAwesome5 name="sync" size={24} color="black"  onPress={() => syncDataWithServer(item)} />
                                                    <Text style={{width: 15,height: 15, borderRadius: 5, backgroundColor: item.synced === 1 ? 'green' : 'red', marginLeft: 5}} />
                                                </View>
                                            </View>
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
            <View>
                <Text style={styles.header}>List of Clients</Text>
                <Content style={styles.items}/>
            </View>
            <AntDesign 
                name="pluscircle" 
                size={35} 
                color="#284979" 
                style={styles.iconAdd} 
                onPress={() => navigation.navigate('AddClientScreen')}
            />
        </View>
    );
}

export default ClientScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    header: {
        fontSize: 24,
    },
    iconAdd: {
        position: 'absolute',
        bottom: 30,
        right: 30,
    },
    iconEdit: {
        position: 'absolute',
        bottom: 30,
        left: 30,
    },
    iconDelete: {
        position: 'absolute',
        bottom: 30,
        
    },
    items: {
        backgroundColor: '#fff',
    },
})