import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native'
import { useSQLiteContext } from 'expo-sqlite';

const LivraisonStatus = () => {
    const route = useRoute();
    const { deliveryId } = route.params;
    const db = useSQLiteContext();
    const [livraison, setLivraison] = useState(null);

    const getDeliveryNote = async() 
  return (
    <View>
      <Text>LivraisonStatus</Text>
    </View>
  )
}

export default LivraisonStatus

const styles = StyleSheet.create({})