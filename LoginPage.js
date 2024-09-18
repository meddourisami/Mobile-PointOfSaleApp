import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, Camera } from "expo-camera";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const LoginPage = ({onLogin}) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [scannedData, setScannedData] = useState(null);
    const [hasPermission, setHasPermission] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationCodeVisible, setIsVerificationCodeVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

  
    const loginAuth = async () => {
      if (name && password) {
        try{
        // const response = await fetch('http://192.168.100.6:8002/api/method/login', {
        const response = await fetch('http://192.168.100.6:8002/api/method/login', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            "usr": name,
            "pwd": password,
          }),
        });
  
        if (response.ok) {
          const responseJson = await response.json();

          await AsyncStorage.setItem('reference', responseJson.reference);
          await AsyncStorage.setItem('user', name);
          Alert.alert("Login Successful", `Welcome, ${name}`);
          setIsLoggedIn(true);
        } else {
          Alert.alert("Error", "Invalid credentials");
        }
      } catch (error) {
        console.error('Login error:', error);
        Alert.alert("Error", "Something went wrong during login.");
      }
    } else {
      Alert.alert("Error", "Please enter both name and password");
    }
  };
  
    const handleLogin = async () => {
      await loginAuth();
    };
  
    const handleVerificationCode = async () => {
      if (verificationCode) {
        try {
          await AsyncStorage.setItem('verifCode', verificationCode);
          const reference= await AsyncStorage.getItem('reference');
          // const response = await fetch('http://192.168.100.6:8002/api/method/frappe.auth.get_logged_user',{
            const response = await fetch('http://192.168.100.6:8002/api/method/frappe.auth.get_logged_user',{ 
            method: 'GET',
            headers: {
              Authorization: `token ${reference}:${verificationCode}`,
            },
          })
          if (response.ok){
            Alert.alert("Verification Successful", "You will be redirected to the home screen.");
          onLogin();
          }else {
            Alert.alert('Invalid verification code');
          }
        } catch (error) {
          console.error('Verification error:', error);
          Alert.alert("Error", "Something went wrong during verification.");
        }
      } else {
        Alert.alert("Error", "Please enter the verification code.");
      }
    };

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      setHasPermission(status === 'granted');
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });
    console.log(result);

    console.log(result.assets[0].uri);

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri); 
      scanQrCodeFromImage(result.assets[0].uri);
    }
  };

  const scanQrCodeFromImage = async (uri) => {
    const barCodeScanner = await Camera.scanFromURLAsync(uri);
    if (barCodeScanner.length > 0) {
      setScannedData(barCodeScanner[0].data);
      setVerificationCode(barCodeScanner[0].data);
      Alert.alert("QR Code Found", `Data: ${barCodeScanner[0].data}`);
    } else {
      Alert.alert("No QR Code Found", "Please try another image.");
    }
  };

  if (hasCameraPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const scanQrCodeWithCamera = () => {
    console.log(scanned);
    return (
      <View>
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        style={{ flex: 1 }}
      />
    </View>
    );
  };
  
  const handleBarCodeScanned = ({ type, data }) => {
    console.log("handle");
    setScanned(true);
    setScannedData(data);
    // Alert.alert("QR Code Found", `Data: ${data}`);
    // setTimeout(() => setScanned(false), 2000);
  };
  

  const handleChooseMethod = () => {
    Alert.alert(
      'Choose an option',
      'Do you want to pick an image from the gallery or scan a QR code?',
      [
        { text: 'Pick Image', onPress: pickImage },
        { text: 'Scan QR Code', onPress: scanQrCodeWithCamera }
      ],
      { cancelable: true }
    );
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleVerificationCodeVisibility = () => {
    setIsVerificationCodeVisible(!isVerificationCodeVisible);
  };
  
    return (
      <View style={styles.container}>

        {!isLoggedIn && (
        <>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          value={name}
          onChangeText={(text) => setName(text)}
        />
  
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity style={styles.iconContainer} onPress={togglePasswordVisibility}>
          <Icon
            name={isPasswordVisible ? "eye-off" : "eye"}
            size={24}
            color="gray"
          />
          </TouchableOpacity>
        </View>
        </>
        )}

        {isLoggedIn && (
        <>
          <Text style={styles.title}>Login</Text>
          <AntDesign name="arrowleft" size={28} color="black" onPress={()=>setIsLoggedIn(false)}/>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Verification Code"
              value={verificationCode}
              onChangeText={(text) => setVerificationCode(text)}
              secureTextEntry={!isVerificationCodeVisible}
            />
            <TouchableOpacity style={styles.iconContainer} onPress={toggleVerificationCodeVisibility}>
              <Icon
              name={isVerificationCodeVisible ? "eye-off" : "eye"}
              size={24}
              color="gray"
              />
            </TouchableOpacity>
          </View>

          <Text style={{marginBottom:12, fontSize:18, fontWeight:'bold'}}>OR</Text>
          <TouchableOpacity style={styles.imagePickerButton} onPress={handleChooseMethod}>
            <Text style={styles.buttonText}>Pick OR scan Verification QR Code</Text>
          </TouchableOpacity>
          {hasCameraPermission === false ? (
            <Text>No access to camera</Text>
          ) : (
            scanned && scanQrCodeWithCamera()
          )}

          <TouchableOpacity style={styles.button} onPress={handleVerificationCode}>
            <Text style={styles.buttonText}>Submit Verification Code</Text>
          </TouchableOpacity>
        </>
        )}

        {!isLoggedIn && (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        )}
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    paddingRight: 40
  },
  iconContainer: {
    position: 'absolute', 
    right: 10,
    padding: 10,
    paddingBottom:20,
  },
  imagePickerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#ff9800',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 20,
  },
  qrText: {
    fontSize: 16,
    color: 'green',
    marginBottom: 20,
  },
})