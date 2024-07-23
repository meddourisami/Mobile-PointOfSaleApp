import { ScrollView, StyleSheet, Text, TextInput, View , Button, Alert, TouchableOpacity} from 'react-native';
import React, {useState, useEffect} from 'react';
import { useSQLiteContext } from 'expo-sqlite';


const AddClientScreen = ({navigation}) => {
  const db = useSQLiteContext();

  const [client, setClient] = useState({
    name:'',
    customer_name:'',
    customer_type:'',
    customer_group:'',
    territory:'',
    custom_code:'',
    custom_address:'',
    custom_phone:''
  });

  const [clients, setClients] = useState([]);

  useEffect(() => {
    getClients();
  }, []);

  const getClients = async () => {
    try{
        const allClients = await db.getAllAsync(`SELECT * FROM Customers;`);
        setClients(allClients);
    }catch(e){
        console.log(e);
    }
  };

  const addClient = async (newClient) => {
    if (
      newClient.name === '' || 
      newClient.customer_type === '' || 
      newClient.customer_group === '' || 
      newClient.territory === '' ||
      newClient.custom_code === '' || 
      newClient.custom_address === '' || 
      newClient.custom_phone === ''
    ) {
      Alert.alert('Entrer toutes les données');
      return;
    }
    try {
      await db.runAsync('INSERT INTO Customers (name, customer_name, customer_type, customer_group, territory, custom_code, custom_address, custom_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [newClient.name, newClient.customer_name, newClient.customer_type, newClient.customer_group, newClient.territory, newClient.custom_code, newClient.custom_address, newClient.custom_phone]
      );

      await db.runAsync(
        `INSERT INTO CustomerLocalLogs (customer_name, action, data) VALUES (?, ?, ?)`,
        [newClient.name, 'INSERT', JSON.stringify(newClient)]
      );
      await getClients();
      Alert.alert('Client added successfully');
      navigation.goBack();
    } catch (e) {
      console.log("Error adding client", e);
    }
  };

  const handleSave = () => {
    addClient(client);
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        placeholder="Name"
        value={client.name}
        onChangeText={(text) => setClient({ ...client, name: text , customer_name: text})}
        style={styles.input}
      />
      <TextInput
        placeholder="Customer Type"
        value={client.customer_type}
        onChangeText={(text) => setClient({ ...client, customer_type: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Customer Group"
        value={client.customer_group}
        onChangeText={(text) => setClient({ ...client, customer_group: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Territory"
        value={client.territory}
        onChangeText={(text) => setClient({ ...client, territory: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Customer Code"
        value={client.custom_code}
        onChangeText={(text) => setClient({ ...client, custom_code: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Customer Adresse"
        value={client.custom_address}
        onChangeText={(text) => setClient({ ...client, custom_address: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Customer Phone"
        value={client.custom_phone}
        onChangeText={(text) => setClient({ ...client, custom_phone: text })}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Valider</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
export default AddClientScreen;

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
    padding: 20,
    backgroundColor: '#E59135',
    borderRadius: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: 'bold',
  },
});