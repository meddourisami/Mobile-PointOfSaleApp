import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSQLiteContext } from 'expo-sqlite'


const AddStockScreen = ({navigation}) => {
    const db = useSQLiteContext();

    const [stock, setStock] = useState({
        name:'',
        warehouse_name:'',
        company:'',
    });

    const [stocks, setStocks] = useState([]);

    const getStocks = async () => {
        try{
            const allStocks = await db.getAllAsync(`SELECT * FROM Warehouse;`);
            setStocks(allStocks);
        }catch(e){
            console.log(e);
        }
    };
    
    useEffect(() => {
        getStocks();
    }, []);
    
    const addStock = async (newStock) => {
        if (
          newStock.name === '' || 
          newStock.warehouse_name === '' || 
          newStock.company === ''
        ) {
          Alert.alert('Entrer toutes les données');
          return;
        }
        try {
            await db.runAsync('INSERT INTO Warehouse (name, warehouse_name, company) VALUES (?, ?, ?)',
                [newStock.name, newStock.warehouse_name, newStock.company]
            );
            await getStocks();
            Alert.alert('Stock added successfully');
            navigation.goBack();
        }catch (e) {
            console.log("error adding new stock",e);
        }
    };

    const handleSave = () => {
        addStock(stock);
    };

    return (
        <ScrollView style={styles.container}>
            <TextInput
            placeholder="Stock Name"
            value={stock.name}
            onChangeText={(text) => setStock({ ...stock, name: text })}
            style={styles.input}
            />
            <TextInput
            placeholder="Stock Name"
            value={stock.warehouse_name}
            onChangeText={(text) => setStock({ ...stock, warehouse_name: text })}
            style={styles.input}
            />
            <TextInput
            placeholder="Company"
            value={stock.company}
            onChangeText={(text) => setStock({ ...stock, company: text })}
            style={styles.input}
            />
            <View style={{marginBottom:50}}>
                <TouchableOpacity style={styles.button} onPress={handleSave}>
                    <Text style={styles.buttonText}>Valider</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

export default AddStockScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
    },
    button: {
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#E59135',
        borderRadius: 15,
        marginBottom:20,
        marginTop:20,
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: 'bold',
    },
})