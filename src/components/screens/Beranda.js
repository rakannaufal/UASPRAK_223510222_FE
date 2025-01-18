import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Card, Button, Title, IconButton, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.100.234:3000/api/menu";
const ORDER_API_URL = "http://192.168.100.234:3000/api/orders";

const Beranda = ({ navigation }) => {
  const [order, setOrder] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  const fetchMenus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        const { token } = JSON.parse(storedToken);
        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.data) {
          setMenuItems(data.data || []);
        } else {
          console.error("Gagal memuat menu.");
        }
      } else {
        console.error("Token tidak ditemukan.");
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat mengambil menu:", error);
    }
  };

  useEffect(() => {
    fetchMenus();
    const intervalId = setInterval(() => {
      fetchMenus();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const addToOrder = (item) => {
    const existingItem = order.find((orderItem) => orderItem._id === item._id);
    if (existingItem) {
      setOrder(
        order.map((orderItem) =>
          orderItem._id === item._id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        )
      );
    } else {
      setOrder([...order, { ...item, quantity: 1 }]);
    }
  };

  const removeFromOrder = (item) => {
    const existingItem = order.find((orderItem) => orderItem._id === item._id);
    if (existingItem && existingItem.quantity > 1) {
      setOrder(
        order.map((orderItem) =>
          orderItem._id === item._id
            ? { ...orderItem, quantity: orderItem.quantity - 1 }
            : orderItem
        )
      );
    } else {
      setOrder(order.filter((orderItem) => orderItem._id !== item._id));
    }
  };

  const calculateTotalAmount = () => {
    return order.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const submitOrder = async () => {
    const storedToken = await AsyncStorage.getItem("token");
    if (!storedToken) {
      Alert.alert("Error", "Token tidak ditemukan. Silakan login kembali.");
      return;
    }

    const { token } = JSON.parse(storedToken);
    const orderPayload = {
      items: order.map((item) => ({
        menuId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity,
      })),
      totalAmount: calculateTotalAmount(),
    };

    try {
      const response = await fetch(ORDER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert("Sukses", "Pesanan berhasil dibuat.");
        console.log("Data terkirim:", data);
        setOrder([]);
        navigation.navigate("Order", { order: data });
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Gagal membuat pesanan.");
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat membuat pesanan:", error);
      Alert.alert("Error", "Terjadi kesalahan saat membuat pesanan.");
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Menu Kafe</Title>
      <View style={styles.menuContainer}>
        {menuItems.length > 0 ? (
          menuItems.map((item, index) => (
            <Card key={item._id || index} style={styles.card}>
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>{item.name}</Text>
              </View>
              <Card.Actions style={styles.actions}>
                <IconButton
                  icon="minus"
                  size={20}
                  onPress={() => removeFromOrder(item)}
                  style={styles.iconButton}
                />
                <Text style={styles.quantity}>
                  {order.find((orderItem) => orderItem._id === item._id)
                    ?.quantity || 0}
                </Text>
                <IconButton
                  icon="plus"
                  size={20}
                  onPress={() => addToOrder(item)}
                  style={styles.iconButton}
                />
              </Card.Actions>
            </Card>
          ))
        ) : (
          <Text>Loading menu...</Text>
        )}
      </View>
      <Button
        style={styles.orderButton}
        buttonColor="#FF5733"
        textColor="#fff"
        onPress={submitOrder}
      >
        Buat Pesanan
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF3E0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#8B4513",
    textAlign: "center",
    marginBottom: 16,
  },
  menuContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#FFF8E1",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardTitleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#D2691E",
    textAlign: "center",
    width: "100%",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    marginRight: 20,
  },
  iconButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  quantity: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },
  orderButton: {
    marginTop: 20,
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: "#FF5733",
  },
});

export default Beranda;
