import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused, useRoute } from '@react-navigation/native'
import { useSQLiteContext } from 'expo-sqlite';

const LivraisonStatus = () => {
    const route = useRoute();
    const { deliveryName } = route.params;
    const isFocused= useIsFocused();
    const db = useSQLiteContext();
    const [livraison, setLivraison] = useState(null);

    const getDeliveryNote = async() =>{
        try{
            const delivery =await db.getFirstAsync(`SELECT * FROM Deliveries WHERE name = ?`,[deliveryName]);
            setLivraison(delivery);
        }catch(e){
            console.log("Error getting delivery note from local database",e);
        }
    };

    const ChangeDeliveryNoteStatus = async(state) => {
        try{
            await db.runAsync(`UPDATE Deliveries SET status =? WHERE name =?`,[state, livraison.name]);
        }catch(e){
            console.log("Error updating delivery note status",e);
        };
    };

    const getDeliveryDetailsfromAPI = async() =>{
        try{
            const response = await fetch('http://192.168.100.6:8002/api/method/frappe.desk.form.load.getdoc',
                {
                    method: 'POST',
                    headers: {
                        Authorization: 'token 94c0faa6066a7c0:982654458dc9011',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "doctype": "Delivery Note",
                        "name": deliveryName,
                        "_": Date.now(),
                    })
                }
            );
            const json = await response.json();
            console.log("items",json);
        }catch(e){
            console.log("Error getting delivery details",e);
        };
    }

    const saveToLocalLogs = async () => {
        const logs = await db.getAllAsync(`SELECT name FROM delivery_note_logs;`);
        const names = logs.map(log => log.name);

        const Orders = await db.getAllAsync(`SELECT * FROM Deliveries;`);
        Deliveries.map(async (delivery)=> {
            console.log(delivery.name);
            
            // if(delivery.name.includes("MAT-DN")){
            //     return;
            // }else{
                const deliveryData= {
                    ...delivery,
                    doctype: "Delivery Note",
                    __islocal: 1,
                    __unsaved: 1,
                }
                const deliveryItems = await db.getAllAsync(`SELECT * FROM Delivery_Note_Item WHERE parent =?`, [delivery.name]);
                const deliveryItemsData = [];
                const updatedItems= deliveryItems.map(item =>({
                    ...item,
                    __islocal: 1,
                    __unsaved: 1,
                    doctype: "Delivery Note Item"
                }));

                const deliveryTaxes = await db.getFirstAsync(`SELECT * FROM Sales_Taxes_and_Charges WHERE parent=?`, [delivery.name]);
                const deliveryTaxesData = {
                    ...deliveryTaxes,
                    __islocal: 1,
                    __unsaved: 1,
                    doctype: "Sales Taxes and Charges"
                }

                const data = {
                    ...deliveryData,
                    items: updatedItems,
                    taxes: [deliveryTaxesData],
                }

                if (!names.includes(delivery.name)) {
                    await db.runAsync(
                        `INSERT INTO delivery_note_logs (action, name, state, data) VALUES (?, ?, ?, ?)`,
                        ["INSERT", delivery.name, "local", JSON.stringify(data)]
                    );
                }
            //}
        });
    }
    


    useEffect(() => {
        if(isFocused){
            const initialize = async() => {
                await getDeliveryNote();
                await getDeliveryDetailsfromAPI();
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
                <TouchableOpacity style={styles.button}>
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