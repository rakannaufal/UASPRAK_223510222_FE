import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

export default function RegisterScreen({}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  const navigation = useNavigation();
  const buttonScale = new Animated.Value(1);

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      showAlert("All fields are required.", "error");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      showAlert("Please enter a valid email address.", "error");
      return;
    }

    try {
      const response = await fetch(
        "http://192.168.100.234:3000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showAlert("Registration successful!", "success");
        navigation.navigate("Login");
      } else {
        showAlert(data.message || "Registration failed.", "error");
      }
    } catch (error) {
      showAlert(
        "Failed to connect to server. Please try again later.",
        "error"
      );
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
  };

  return (
    <LinearGradient colors={["#FF5733", "#FF8C00"]} style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Register</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              animateButton();
              handleRegister();
            }}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.registerText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom Alert Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={alertVisible}
        onRequestClose={closeAlert}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.alertBox,
              alertType === "success" ? styles.success : styles.error,
            ]}
          >
            <Text style={styles.alertText}>{alertMessage}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeAlert}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 15,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  button: {
    backgroundColor: "#FF5733",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerText: {
    color: "#FF5733",
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alertBox: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  success: {
    backgroundColor: "#4caf50",
  },
  error: {
    backgroundColor: "#f44336",
  },
  alertText: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10,
    padding: 30,
  },
  closeButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
});
