import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.100.234:3000/api/menu";

export default function MenuList() {
  const [menus, setMenus] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [menuName, setMenuName] = useState("");
  const [price, setPrice] = useState("");
  const [token, setToken] = useState("");
  const [editMenuId, setEditMenuId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMenus, setFilteredMenus] = useState([]);

  useEffect(() => {
    const fetchMenus = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        const { token } = JSON.parse(storedToken);
        setToken(token);
        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setMenus(data.data || []);
        setFilteredMenus(data.data || []);
      }
    };
    fetchMenus();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = menus.filter(
      (menu) =>
        menu.name.toLowerCase().includes(text.toLowerCase()) ||
        menu.price.toString().includes(text)
    );
    setFilteredMenus(filtered);
  };

  const handleAddMenu = async () => {
    if (!menuName || !price) {
      alert("Please fill in both fields.");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: menuName, price }),
      });

      const result = await response.json();
      if (response.ok) {
        const newMenus = [result.data, ...menus];
        setMenus(newMenus);
        setFilteredMenus(newMenus);
        setMenuName("");
        setPrice("");
        setShowForm(false);
      } else {
        alert(result.message || "Error adding menu");
      }
    } catch (error) {
      console.error("Error adding menu:", error);
      alert("Failed to add menu. Please try again.");
    }
  };

  const handleEditMenu = async () => {
    if (!menuName || !price) {
      alert("Please fill in both fields.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${editMenuId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: menuName, price }),
      });

      const result = await response.json();
      if (response.ok) {
        const updatedMenus = menus.map((menu) =>
          menu._id === editMenuId ? { ...menu, name: menuName, price } : menu
        );
        setMenus(updatedMenus);
        setFilteredMenus(updatedMenus);
        setMenuName("");
        setPrice("");
        setShowForm(false);
        setEditMenuId(null);
      } else {
        alert(result.message || "Error editing menu");
      }
    } catch (error) {
      console.error("Error editing menu:", error);
      alert("Failed to edit menu. Please try again.");
    }
  };

  const handleDeleteMenu = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedMenus = menus.filter((menu) => menu._id !== id);
        setMenus(updatedMenus);
        setFilteredMenus(updatedMenus);
      } else {
        alert("Error deleting menu");
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      alert("Failed to delete menu. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setMenuName("");
    setPrice("");
    setShowForm(false);
    setEditMenuId(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu List</Text>

      {showForm ? (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Menu Name"
            value={menuName}
            onChangeText={setMenuName}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={editMenuId ? handleEditMenu : handleAddMenu}
            >
              <Text style={styles.buttonText}>
                {editMenuId ? "Update Menu" : "Add Menu"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancelEdit}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.searchBar}
            placeholder="Search Menu"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <FlatList
            data={filteredMenus}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.menuItem}>
                <View>
                  <Text style={styles.menuName}>{item.name}</Text>
                  <Text style={styles.menuPrice}>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(item.price)}
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditMenuId(item._id);
                      setMenuName(item.name);
                      setPrice(item.price.toString());
                      setShowForm(true);
                    }}
                  >
                    <Icon
                      name="create"
                      size={24}
                      color="#6a11cb"
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteMenu(item._id)}>
                    <Icon
                      name="trash"
                      size={24}
                      color="#fc2575"
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
          >
            <Icon name="add" size={30} color="white" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f3e9",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#9b5932",
    textAlign: "center",
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d2b38c",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#f8f1e1",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#9b5932",
    padding: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
    marginLeft: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: "#d2b38c",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    backgroundColor: "#f8f1e1",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF5E1",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4.65,
    elevation: 7,
  },
  menuName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#9b5932",
  },
  menuPrice: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  actionButtons: {
    flexDirection: "row",
  },
  icon: {
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: "#f39c12",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
