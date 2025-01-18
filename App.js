import React, { useState, useEffect } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";

// Import screens
import MenuList from "./src/components/screens/InputMenuScreen"; // Updated to MenuList
import ProfileScreen from "./src/components/screens/Profile";
import LoginScreen from "./src/components/auth/Login";
import RegisterScreen from "./src/components/auth/Register";
import BerandaScreen from "./src/components/screens/Beranda";
import OrderSummaryScreen from "./src/components/screens/OrderSummaryScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TOKEN_EXPIRATION_DAYS = 2;

// Helper function to get icon name
const getIconName = (routeName) => {
  switch (routeName) {
    case "Beranda":
      return "home";
    case "Menu":
      return "menu";
    case "Order":
      return "restaurant";
    case "Profil":
      return "person";
    default:
      return "home";
  }
};

// MainTabNavigator
function MainTabNavigator({ handleLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Icon name={getIconName(route.name)} size={size} color={color} />
        ),
        tabBarActiveTintColor: "#fff", // White color for active tab icon
        tabBarInactiveTintColor: "#b0b0b0", // Light gray for inactive tab icon
        tabBarStyle: {
          backgroundColor: "#d8583c", // Set a blue background for the tab bar
          borderTopWidth: 0, // Remove the default top border
          height: 60, // Set the height of the tab bar
          paddingBottom: 10, // Add padding for better spacing
          elevation: 10, // Add shadow for elevation
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "600", // Bold label text
        },
        tabBarItemStyle: {
          paddingTop: 5, // Add padding to space out the icon and label
        },
      })}
    >
      <Tab.Screen
        name="Beranda"
        component={BerandaScreen}
        options={{ headerShown: false, tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Menu" // Changed from Todos to Menu
        component={MenuList} // Updated to MenuList
        options={{ headerShown: false, tabBarLabel: "Menu" }}
      />
      <Tab.Screen
        name="Order" // Changed from Todos to Menu
        component={OrderSummaryScreen} // Updated to MenuList
        options={{ headerShown: false, tabBarLabel: "Order" }}
      />
      <Tab.Screen
        name="Profil"
        options={{ headerShown: false, tabBarLabel: "Profile" }}
      >
        {(props) => <ProfileScreen {...props} onLogout={handleLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const tokenData = await AsyncStorage.getItem("token");
        if (tokenData) {
          const parsedTokenData = JSON.parse(tokenData);
          const { token, expiry } = parsedTokenData;
          const now = new Date();
          if (new Date(expiry) > now) {
            setLoggedIn(true);
          } else {
            await AsyncStorage.removeItem("token");
          }
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async (token) => {
    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + TOKEN_EXPIRATION_DAYS);
      await AsyncStorage.setItem(
        "token",
        JSON.stringify({ token, expiry: expiry.toISOString() })
      );
      setLoggedIn(true);
    } catch (error) {
      console.error("Error handling login:", error);
      Alert.alert("Error", "Failed to login. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setLoggedIn(false);
    } catch (error) {
      console.error("Error handling logout:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2464EC" barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "#2464EC" },
            headerTintColor: "#fff",
          }}
        >
          {isLoggedIn ? (
            <>
              <Stack.Screen name="Home" options={{ headerShown: false }}>
                {(props) => (
                  <MainTabNavigator {...props} handleLogout={handleLogout} />
                )}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen name="Login" options={{ headerShown: false }}>
                {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
              </Stack.Screen>
              <Stack.Screen
                options={{ headerShown: false }}
                name="Register"
                component={RegisterScreen}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF5733",
  },
});
