import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';

const Cart = ({navigation}) => {
    const route = useRoute();
    const { selectedItems, customerName } = route.params;

    const [cartItems, setCartItems] = useState(selectedItems);
    const [quantities, setQuantities] = useState({});
    const [taxes, setTaxes] = useState([]);
    const [selectedTax, setSelectedTax] = useState(null);

    console.log(selectedItems);

    const handleRemoveItem = (itemToRemove) => {
        setCartItems(cartItems.filter(item => item.name !== itemToRemove.name));
    };

    const handleQuantityChange = (item, change) => {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [item.name]: prevQuantities[item.name] + change
        }));
    };

    const calculateTotalPrice = () => {
        return cartItems.reduce((total, item) => total + item.last_purchase_rate , 0).toFixed(2);
    };

    useEffect(() => {
        const initialQuantities = {};
        selectedItems.forEach(item => {
            initialQuantities[item.name] = 1;
        });
        setQuantities(initialQuantities);
    }, [selectedItems]);

    const CartItem = ({ item, onRemove, onQuantityChange }) => {
      return (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1 }}>
                <Text>{item.item_name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => onQuantityChange(item, -1)}>
                        <Text style={{ fontSize: 20 }}>-</Text>
                    </TouchableOpacity>
                    <Text style={{ marginHorizontal: 10 }}>{quantities[item.name]}</Text>
                    <TouchableOpacity onPress={() => onQuantityChange(item, 1)}>
                        <Text style={{ fontSize: 20 }}>+</Text>
                    </TouchableOpacity>
                </View>
                <Text>${item.last_purchase_rate * quantities[item.name]}</Text>
                <TouchableOpacity onPress={() => onRemove(item)}>
                    <Text style={{ color: 'red' }}>Remove</Text>
                </TouchableOpacity>
            </View>
      );
    };

    return (
        <View style={{ flex: 1, padding: 10 }}>
            <FlatList
                data={cartItems}
                keyExtractor={item => item.name}
                renderItem={({ item }) => (
                    <CartItem 
                        item={item} 
                        onRemove={handleRemoveItem} 
                        onQuantityChange={handleQuantityChange} 
                    />
                )}
            />
            <View style={{ padding: 10 }}>
                <Text style={{ fontSize: 18 }}>Total: ${calculateTotalPrice()}</Text>
                <TouchableOpacity 
                    style={{ backgroundColor: '#284979', padding: 10, alignItems: 'center', marginTop: 10 }}
                    onPress={() => navigation.navigate('Checkout', { cartItems, customerName })}
                >
                    <Text style={{ color: '#FFF', fontSize: 18 }}>Proceed to Checkout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Cart;

const styles = StyleSheet.create({})