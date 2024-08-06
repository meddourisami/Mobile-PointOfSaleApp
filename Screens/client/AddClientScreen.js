import { ScrollView, StyleSheet, Text, TextInput, View , Button, Alert, TouchableOpacity} from 'react-native';
import React, { useState, useEffect} from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';


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
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);

  // useEffect(() => {
  //   fetch("https://restcountries.com/v3.1/all")
  //   .then(response => response.json())
  //   .then(data => {
  //     let areaData = data.map(item=>{
  //       return{
  //         code: item.alpha2Code,
  //         item: item.name,
  //         callingCode: `+${item.callingCodes[0]}`,
  //         flag: `https://coutryflagsapi.com/png/${item.name}`
  //       }
  //     });
  //     setAreas(areaData);
  //     if(areaData.length > 0) {
  //       let defaultData = areaData.filter(a=>a.code == "DZ");
  //       if(defaultData.length > 0) {
  //         setSelectedArea(defaultData[0])
  //       }
  //     }
  //   });
  // }, [])

  const getClients = async () => {
    try{
        const allClients = await db.getAllAsync(`SELECT * FROM Customers;`);
        setClients(allClients);
    }catch(e){
        console.log(e);
    }
  };

  useEffect(() => {
    getClients();
  }, []);

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

      //await db.runAsync(
      //  `INSERT INTO CustomerLocalLogs (customer_name, action, data) VALUES (?, ?, ?)`,
      //  [newClient.name, 'INSERT', JSON.stringify(newClient)]
      //);
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
        placeholder="Customer Code"
        value={client.custom_code}
        onChangeText={(text) => setClient({ ...client, custom_code: text })}
        style={styles.input}
      />
      <TextInput
        placeholder="Name"
        value={client.name}
        onChangeText={(text) => setClient({ ...client, name: text , customer_name: text})}
        style={styles.input}
      />
      <View style={styles.input}>
        <Picker
          selectedValue={client.customer_type}
          style={styles.input}
          onValueChange={(itemValue) =>
            setClient({ ...client, customer_type: itemValue })
          }>
          <Picker.Item label="Company" value="Company" />
          <Picker.Item label="Individual" value="Individual" />
        </Picker>
      </View>
      <View style={styles.input}>
        <Picker
          selectedValue={client.customer_group}
          style={styles.input}
          onValueChange={(itemValue) =>
            setClient({ ...client, customer_group: itemValue })
          }>
          <Picker.Item label="Individuel" value="Individuel" />
          <Picker.Item label="detail" value="detail" />
        </Picker>
      </View>
      <View style={styles.input}>
        <Picker
          selectedValue={client.territory}
          style={{paddingBottom:10}}
          onValueChange={(itemValue) =>
            setClient({ ...client, territory: itemValue })
          }>
          <Picker.Item label="Algeria" value="Algeria"/>
          <Picker.Item label="MSILA" value="MSILA" />
          <Picker.Item label="MARCHé" value="MARCHé" />
          <Picker.Item label="BATNA" value="BATNA" />
          <Picker.Item label="RUE PRINCIPALE" value="RUE PRINCIPALE" />
        </Picker>
      </View>
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
      <View style={{marginBottom:50}}>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Valider</Text>
        </TouchableOpacity>
      </View>
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
});