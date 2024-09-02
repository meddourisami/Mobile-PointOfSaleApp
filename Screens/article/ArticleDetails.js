import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused, useRoute } from '@react-navigation/native'
import { useSQLiteContext } from 'expo-sqlite';

const ArticleDetails = () => {
    const route= useRoute();
    const { article } = route.params;
    const db = useSQLiteContext();
    const isFocused = useIsFocused();

    const Content = () => {
        const [item, setItem] = useState([]);
        const defaultImage = "https://t3.ftcdn.net/jpg/04/84/88/76/360_F_484887682_Mx57wpHG4lKrPAG0y7Q8Q7bJ952J3TTO.jpg";
        const imageUrl = item.image ? item.image : defaultImage;

        const getItem = async () => {
            try{
                const items = await db.getFirstAsync(
                    `SELECT * FROM Item WHERE name = ?;`,
                    [article]
                );
                setItem(items);
            }catch(e){
                console.log("Error item from database",e);
            }
        };

        useEffect(() => {
            if(isFocused){
                const initialize = async () => {
                    getItem();
                };
            initialize();
            };
        },[isFocused]);

        return (
          <View style={styles.ItemContainer}>
            {!item ? (
              <Text style={styles.noDataText}>No data yet.</Text>
            ) : (
              <TouchableOpacity style={styles.card}>
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={styles.detailsContainer}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                    <View style={styles.infoContainer}>
                      <Text style={styles.itemText}>Name: {item.item_name}</Text>
                      <Text style={styles.itemText}>Group: {item.item_group}</Text>
                      <Text style={styles.priceText}>Price: {item.standard_rate} DA</Text>
                      <Text style={styles.itemText}>Country Of Origin: {item.country_of_origin}</Text>
                      <Text style={styles.itemText}>Expiration Date: {item.end_of_life}</Text>
                      <Text style={styles.itemText}>Quantity: {item.bal_qty}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        );
    
    };
    return(
      <View >
        <Text style={styles.title}>Détails de l'Article</Text>
        <Content />
      </View>
    )

}

export default ArticleDetails;

const styles = StyleSheet.create({
  ItemContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    marginVertical: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailsContainer: {
    flexDirection: 'row',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6347',
    marginBottom: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
})