import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { List, Text, Button, Title } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ORDER_API_URL = "http://192.168.100.234:3000/api/orders";

const OrderSummaryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      if (!storedToken) {
        Alert.alert("Error", "Token tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }

      const { token } = JSON.parse(storedToken);

      const response = await fetch(ORDER_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Pesanan diterima dari API:", data.orders);

        setOrders(data.orders || []);
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          errorData.message || "Gagal mengambil data pesanan."
        );
      }
    } catch (error) {
      console.error("Error fetching orders:", error.message);
      Alert.alert("Error", "Terjadi kesalahan saat mengambil data pesanan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Ringkasan Pesanan</Title>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#6A4E23"
          style={styles.loading}
        />
      ) : orders.length === 0 ? (
        <Text style={styles.emptyText}>
          Tidak ada pesanan untuk pengguna ini.
        </Text>
      ) : (
        <ScrollView>
          {orders.map((order) => (
            <View key={order.orderNumber} style={styles.orderCard}>
              <Text style={styles.orderNumber}>
                Pesanan #{order.orderNumber}
              </Text>
              {order.items.map((item, index) => (
                <List.Item
                  key={index}
                  title={`${item.name} (x${item.quantity})`}
                  description={`Rp ${item.totalPrice.toLocaleString()}`}
                  left={(props) => <List.Icon {...props} icon="food" />}
                />
              ))}
              <Text style={styles.total}>
                Total:{" "}
                <Text style={styles.totalPrice}>
                  Rp {order.totalAmount.toLocaleString()}
                </Text>
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
      <Button
        mode="contained"
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        Kembali ke Menu
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F4E1D2",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6A4E23",
    textAlign: "center",
    marginBottom: 16,
  },
  loading: {
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#A45B39",
    textAlign: "center",
    marginTop: 20,
  },
  orderCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#FFF5E1",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#6A4E23",
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "right",
  },
  totalPrice: {
    color: "#FF7F50",
  },
  backButton: {
    marginTop: 20,
    borderRadius: 8,
    paddingVertical: 10,
    backgroundColor: "#FF7F50",
  },
});

export default OrderSummaryScreen;
