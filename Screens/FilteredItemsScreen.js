import { TouchableOpacity, FlatList, StyleSheet, Text, View } from 'react-native';
import React, { useState , useEffect} from 'react';
import { useIsFocused, useRoute } from '@react-navigation/native';

const FilteredItemsScreen = ({navigation}) => {
    const isFocused = useIsFocused();
    const route = useRoute();
    const { Item_group } = route.params;
    const Content = () => {
        const [items, setItems] = useState([]);

        const getFilteredItemsFromApi = async () => {
            try{
                const response = await fetch('http://195.201.138.202:8006/api/method/frappe.desk.reportview.get', 
                {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
                },
                body: JSON.stringify({
                    "doctype": "Item",
                    "fields": ["*"],
                    "filters": [
                    ["Item", "item_group", "in", `${Item_group}`]
                    ],
                    "order_by": "`tabItem`.`modified` desc",
                    "start": 0,
                    "page_length": 20,
                    "view": "List",
                    "group_by": "",
                    "with_comment_count": 1   
                }),
                });
  
            const json = await response.json();
            //console.log(json);
            setItems(json.message.values);
            //console.log(json.message.values);
            return json.message.values;
  
            }catch(e){
            console.log("Error retreiving filtered items",e);
            }
        };

        useEffect(() => {
            if(isFocused){
              getFilteredItemsFromApi();
            }
        }, [isFocused]);

        return (
            <View>
                {items.length === 0? (
                    <Text>No data yet.</Text>
                ) : (
                    <FlatList
                    data= {items}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item, index}) => (
                        <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:10, backgroundColor: "#FFF"}}>
                            <TouchableOpacity >
                                <Text style={{fontWeight:'bold'}}>{item[0]}</Text>
                                {/* <Text style={{fontWeight:'bold'}}>Parent Item Group</Text> */}
                                <Text>Item {item[9]}</Text>
                                <Text>Price {item[19]}DA</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{justifyContent:'flex-end', alignItems: 'center', backgroundColor:"#E59135", height:20, marginRight:10}}>
                                <Text style={{color:"#FFF"}}>Add to cart</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    />
                )}
            </View>
        );
    }
    return (
        <View>
            <Text style={{fontSize:24}}>Items Filtered by Item Group</Text>
            <View>
                <Content/>
            </View>
        </View>
    );
}

export default FilteredItemsScreen;

const styles = StyleSheet.create({})