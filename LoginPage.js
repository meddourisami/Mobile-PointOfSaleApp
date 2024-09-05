import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const LoginPage = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
  
    const handleLogin = () => {
      // Replace this with your actual login logic (e.g., API call)
      if (name && password) {
        Alert.alert("Login Successful", `Welcome, ${name}`);
      } else {
        Alert.alert("Error", "Please enter both name and password");
      }
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
  
        <TextInput
          style={styles.input}
          placeholder="Enter Name"
          value={name}
          onChangeText={(text) => setName(text)}
        />
  
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={true}
        />
  
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
}

export default LoginPage;

const styles = StyleSheet.create({
    container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#284979',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})