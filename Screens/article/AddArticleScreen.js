import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

const AddArticleScreen = ({navigation}) => {
    const db = useSQLiteContext();

    const [item, setItem] = useState({
        name:'',
        item_name:'',
        standard_rate:'',
        item_group:'',
        country_of_origin:'',
        item_code:'',
        opening_stock:'',
        description:''
    });

    const [items, setItems] = useState([]);

    const getItems = async () => {
        try{
            const allItems = await db.getAllAsync(`SELECT * FROM Item;`);
            setItems(allItems);
        }catch(e){
            console.log(e);
        }
    };
    
    useEffect(() => {
        getItems();
    }, []);
    
    const addItem = async (newItem) => {
        if (
          newItem.name === '' || 
          newItem.item_name === '' || 
          newItem.item_group === '' || 
          newItem.country_of_origin === '' ||
          newItem.item_code === '' || 
          newItem.opening_stock === '' || 
          newItem.description === '' ||
          newItem.standard_rate === ''
        ) {
          Alert.alert('Entrer toutes les données');
          return;
        }
        try {
            await db.runAsync('INSERT INTO Item (name, item_name, item_group, country_of_origin, item_code, opening_stock, description, standard_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [newItem.name, newItem.item_name, newItem.item_group, newItem.country_of_origin, newItem.item_code, newItem.opening_stock, newItem.description, newItem.standard_rate]
            );
            await getItems();
            Alert.alert('Item added successfully');
            navigation.goBack();
        }catch (e) {
            console.log("error adding new item",e);
        }
    };

    const handleSave = () => {
        addItem(item);
      };

    return (
        <ScrollView style={styles.container}>
            <TextInput
            placeholder="Item Name"
            value={item.name}
            onChangeText={(text) => setItem({ ...item, name: text })}
            style={styles.input}
            />
            <TextInput
            placeholder="Item Name"
            value={item.item_name}
            onChangeText={(text) => setItem({ ...item, item_name: text })}
            style={styles.input}
            />
            <TextInput
            placeholder="Item Group"
            value={item.item_group}
            onChangeText={(text) => setItem({ ...item, item_group: text })}
            style={styles.input}
            />
            <TextInput
            placeholder="Country of origin"
            value={item.country_of_origin}
            onChangeText={(text) => setItem({ ...item, country_of_origin: text })}
            style={styles.input}
            />
            <TextInput
            placeholder="Item Code"
            value={item.item_code}
            onChangeText={(text) => setItem({ ...item, item_code: text })}
            style={styles.input}
            />
            <TextInput
            placeholder="Item Stock"
            value={item.opening_stock}
            onChangeText={(text) => setItem({ ...item, opening_stock: text })}
            style={styles.input}
            />
            <TextInput
            placeholder="Item Description"
            value={item.description}
            onChangeText={(text) => setItem({ ...item, description: text })}
            style={styles.input}
            />
            <TextInput
            placeholder="Item Price"
            value={item.standard_rate}
            onChangeText={(text) => setItem({ ...item, standard_rate: text })}
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

export default AddArticleScreen;

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