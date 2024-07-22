import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import { FontAwesome6 } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

const HomeScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity style={styles.budgetButton} title="Budget">
          <Text style={styles.budgetText}>Budget</Text>
          <View style={styles.budgetRow}>
            <TouchableOpacity activeOpacity={"#E59135"} style={{backgroundColor:'#FFFFFF', height:50, width:100, marginRight:20, borderRadius:10, alignItems:'center', justifyContent:'center'}}>
              <Text style={{alignItems:'center', justifyContent:'center'}}>Bon de Commande</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{backgroundColor:"#FFFFFF", height:50, width:100, borderRadius:10, alignItems:'center', justifyContent:'center'}}>
              <Text>Bon de Livraison</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} title="Client" onPress={() => navigation.navigate('ClientScreen')}>
            <FontAwesome6 name="people-group" size={50} color="white" />
            <Text style={styles.buttonText}>Clients</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} title="Bon de Commande" onPress={() => navigation.navigate('CommandeScreen')}>
          <FontAwesome6 name="file-invoice-dollar" size={50} color="white" />
          <Text style={styles.buttonText}>Bon de Commande</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} title="Article" onPress={() => navigation.navigate('ArticleScreen')}>
          <FontAwesome6 name="box-open" size={50} color="white" />
          <Text style={styles.buttonText}>Article</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} title="Stock" onPress={() => navigation.navigate('StockScreen')}>
          <MaterialCommunityIcons name="truck-cargo-container" size={50} color="white" />
          <Text style={styles.buttonText}>Stock</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} title="Livraison" onPress={() => navigation.navigate('LivraisonScreen')}>
          <AntDesign name="filetext1" size={50} color="white" />
          <Text style={styles.buttonText}>Bon de Livraison</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} title="Bon de Paiment" onPress={() => navigation.navigate('PaimentScreen')}>
          <FontAwesome5 name="donate" size={50} color="white" />
          <Text style={styles.buttonText}>Paiment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingLeft: 20,
  },
  row: {
    marginLeft: 25,
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-between'
  },
  buttonContainer: {
    flex: 1,
    margin: 5,
  },
  button:{
    backgroundColor: '#284979',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
  },
  buttonText:{
    color: '#fff',
    fontWeight: 'bold',
    justifyContent: 'center',
  },
  budgetButton:{
    backgroundColor: '#284979',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    marginLeft: 30,
    marginBottom: 10,
    marginRight: 47,
  },
  budgetText:{
    color:'#FFFFFF',
    fontWeight:'bold',
  },
  budgetRow:{
    flexDirection: 'row',
    justifyContent:'space-between',
    marginTop: 10,
    borderRadius: 10,
    padding: 10,
  },
})