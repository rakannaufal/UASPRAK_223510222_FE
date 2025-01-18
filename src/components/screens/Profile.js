import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen({ onLogout }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const tokenData = await AsyncStorage.getItem("token");
        if (!tokenData) throw new Error("No token found");

        const { token } = JSON.parse(tokenData);
        const response = await fetch(
          "http://192.168.100.234:3000/api/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const { data } = await response.json();
        setUserData(data);
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6A4E23" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.header}>
            <Image
              source={{
                uri: userData.avatar || "https://via.placeholder.com/150",
              }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{userData.username}</Text>
            <Text style={styles.email}>{userData.email}</Text>
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.detailsLabel}>Dibuat Sejak:</Text>
            <Text style={styles.detailsValue}>
              {new Date(userData.createdAt).toLocaleDateString()}
            </Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4E1D2",
    paddingTop: 30,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: "#FFF5E1",
    borderRadius: 15,
    padding: 25,
    width: "100%",
    maxWidth: 350,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: "#F4E1D2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#6A4E23",
    marginBottom: 5,
  },
  email: {
    fontSize: 18,
    color: "#A45B39",
    marginBottom: 20,
  },
  detailsContainer: {
    marginVertical: 15,
  },
  detailsLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
  },
  detailsValue: {
    fontSize: 16,
    color: "#212529",
  },
  logoutButton: {
    backgroundColor: "#FF7F50",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  errorText: {
    fontSize: 18,
    color: "#dc3545",
  },
});
