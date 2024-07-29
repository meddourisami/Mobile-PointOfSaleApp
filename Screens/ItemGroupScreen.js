import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useIsFocused } from '@react-navigation/native'

const ItemGroupScreen = ({navigation}) => {
  const isFocused = useIsFocused();

  const Content = () => {
    const [item_groups, setItem_groups] = useState([]);

    const getItemGroupsFromApi = async () => {
      try{
        const response = await fetch('http://195.201.138.202:8006/api/method/frappe.desk.reportview.get', 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'token 24bc69a89bf17da:29ed338c3ace08c',
            },
            body: JSON.stringify({
              "doctype": "Item Group",
              "fields": [
              "`tabItem Group`.`name`",
              "`tabItem Group`.`owner`",
              "`tabItem Group`.`creation`",
              "`tabItem Group`.`modified`",
              "`tabItem Group`.`modified_by`",
              "`tabItem Group`.`_user_tags`",
              "`tabItem Group`.`_comments`",
              "`tabItem Group`.`_assign`",
              "`tabItem Group`.`_liked_by`",
              "`tabItem Group`.`docstatus`",
              "`tabItem Group`.`idx`",
              "`tabItem Group`.`item_group_name`",
              "`tabItem Group`.`parent_item_group`",
              "`tabItem Group`.`is_group`",
              "`tabItem Group`.`image`"
              ],
              "filters": [],
              "order_by": "`tabItem Group`.`modified` desc",
              "start": 0,
              "page_length": 20,
              "view": "List",
              "group_by": "",
              "with_comment_count": 1
            }),
          }
        );

      const json = await response.json();
      setItem_groups(json.message.values);
      return json.message.values;

      }catch(e){
        console.log("Error retreiving item groups",e);
      }
    };

    useEffect(() => {
      if(isFocused){
        getItemGroupsFromApi();
      }
    }, [isFocused]);

    return (
      <View style={styles.container}>
        {item_groups=== 0 ? (
          <Text>No data yet.</Text>
        ) : (
          <FlatList
          data= {item_groups}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          renderItem={({item, index}) => (
            <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('FilteredItemsScreen', {Item_group : item[0]})}>
              <View>
                {/* <Text style={{fontWeight:'bold'}}>Group Name</Text> */}
                <Text style={{fontWeight:'bold'}}>{item[0]}</Text>
                {/* <Text style={{fontWeight:'bold'}}>Parent Item Group</Text> */}
                <Text>{item[12]}</Text>
              </View>  
            </TouchableOpacity>
          )}
          />
        )}
      </View>
    );
  };

  return (
    <View style={{flex:1, justifyContent:"flex-start"}}>
      <View style={{marginTop:20, flex:1}}>
        <Text style={styles.header}>List of Group Items</Text>
        <Content style={styles.items}/>
      </View>
    </View>
  );
}

export default ItemGroupScreen;

const styles = StyleSheet.create({
  container:{
    flex:1,
    borderRadius:20,
    borderColor:'grey',
    marginLeft:20,
    marginRight:20
  },
  items: {
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,

  },
  item: {
    flex:1,
    widht:200,
    height:200,
    flexDirection:'row',
    backgroundColor:"#FFF",
    marginBottom:5,
    aspectRatio:1,
    margin:5,
    borderColor: 'grey',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
})