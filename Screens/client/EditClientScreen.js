import { Text, TextInput, StyleSheet, View ,Alert, ScrollView, TouchableOpacity} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useRoute } from '@react-navigation/native';


const EditClientScreen = ({navigation}) => {
  const db = useSQLiteContext();
  const route = useRoute();
  const { customerName } = route.params;
  const [client, setClient] = useState({
    name: '',
    customer_name: '',
    customer_type: '',
    customer_group: '',
    territory: '',
    custom_code: '',
    custom_address: '',
    custom_phone: ''
  });
  const [clients, setClients] = useState([]);

  const getClient = async () => {
    try{
    const selectedClient = await db.getFirstAsync(`SELECT * FROM Customers WHERE name = ?;`, [customerName]);
    if(selectedClient.custom_code=== null || selectedClient.custom_address=== null || selectedClient.custom_phone=== null){
      selectedClient.custom_code='';
      selectedClient.custom_address='';
      selectedClient.custom_phone='';
    }

    setClient(selectedClient);
    }catch(e){
      console.log("error retreiving client",e);
    }
  };

  const getClients = async () => {
    try{
        const allClients = await db.getAllAsync(`SELECT * FROM Customers;`);
        setClients(allClients);
    }catch(e){
        console.log("error retreiving clients",e);
    }
  };

  const updateClient = async () => {
    try{
      await db.runAsync('UPDATE Customers SET name = ?, customer_name=?, customer_type = ?, customer_group = ?, territory = ?,  custom_code = ?, custom_address = ?, custom_phone = ? WHERE name = ?',
        [client.name, client.customer_name, client.customer_type, client.customer_group, client.territory, client.custom_code, client.custom_address, client.custom_phone, client.name]
      );


      // await db.runAsync(
      //   `INSERT INTO CustomerLocalLogs (customer_name, action, data) VALUES (?, ?, ?)`,
      //   [client.name, 'UPDATE', JSON.stringify(client)]
      // );

      await getClient();
      await getClients();


      console.log(client);
      Alert.alert('client updated successfully');
      navigation.goBack();
    }catch(e){
      console.log("Error updating client ", e);
    }
  };

  const handleSave = () => {
    Alert.alert(
      'Confirmer mofication',
      'T\'es sur de modifier ce client',
      [
        {text: 'Yes', onPress: () => updateClient()}, 
        {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
      ],
      {cancelable: true}
    );
  };

  const deleteClient = async () => {
    try{
      await db.runAsync('DELETE FROM Customers WHERE name = ?', [client.name]);

      // await db.runAsync(
      //   `INSERT INTO CustomerLocalLogs (customer_name, action, data) VALUES (?, ?, ?)`,
      //   [client.name, 'DELETE', JSON.stringify(client)]
      // );

      Alert.alert('client deleted successfully');
      navigation.goBack();
    }catch(e){
      console.log("Error deleting client ", e);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmer suppression',
      'T\'es sur de supprimer ce client',
      [
        {text: 'Yes', onPress: () => deleteClient()}, 
        {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
      ],
      {cancelable: true}
    );
  };

  useEffect(() => {
    getClient();
  }, [customerName]);

  useEffect(() => {
    getClients();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text>Custom Code</Text>
      <TextInput
        placeholder="Custom Code"
        value={client.custom_code}
        onChangeText={(text) => setClient({ ...client, custom_code: parseInt(text) })}
        style={styles.input}
      />
      <Text>Name</Text>
      <TextInput
        placeholder="Name"
        value={client.customer_name}
        onChangeText={(text) => setClient({ ...client, name: text , customer_name: text})}
        style={styles.input}
      />
      <Text>Customer Type</Text>
      <TextInput
        placeholder="Customer Type"
        value={client.customer_type}
        onChangeText={(text) => setClient({ ...client, customer_type: text })}
        style={styles.input}
      />
      <Text>Customer Group</Text>
      <TextInput
        placeholder="Customer Group"
        value={client.customer_group}
        onChangeText={(text) => setClient({ ...client, customer_group: text })}
        style={styles.input}
      />
      <Text>Territory</Text>
      <TextInput
        placeholder="Territory"
        value={client.territory}
        onChangeText={(text) => setClient({ ...client, territory: text })}
        style={styles.input}
      />
      <Text>Custom Adresse</Text>
      <TextInput
        placeholder="Custom Adresse"
        value={client.custom_address}
        onChangeText={(text) => setClient({ ...client, custom_address: text })}
        style={styles.input}
      />
      <Text>Custom Phone</Text>
      <TextInput
        placeholder="Custom Phone"
        value={client.custom_phone.toString()}
        onChangeText={(text) => setClient({ ...client, custom_phone: text })}
        style={styles.input}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
        <TouchableOpacity style={styles.button} onPress={handleDelete}>
          <Text style={styles.buttonText}>Supprimer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Modifier</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default EditClientScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'transparent',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    marginLeft:10,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#E59135',
    borderRadius: 10,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});