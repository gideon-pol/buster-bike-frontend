import { Colors, DefaultStyle } from "@/constants/Style";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authenticatedFetch } from "@/app/fetch";
import { ServerInfo } from "@/constants/Server";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from "expo-router";
import { Switch } from "react-native";
import { formatDate } from "@/constants/Formatting";

type UserData = {
  id?: string;
  username: string;
  first_name: string;
  last_name?: string;
  email?: string;
  // referral_code?: string;
  referrer: string;
  can_refer: boolean,
  created_at?: string;
  updated_at?: string;
};

export default function UserScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigation = useNavigation();

  const [markerColorSettingEnabled, setMarkerColorSettingEnabled] = useState(false);


  useEffect(() => {
    const getMarkerColorSetting = async () => {
      try {
        const value = await AsyncStorage.getItem("markerColorSetting");
        if (value !== null) {
          setMarkerColorSettingEnabled(value === "true");
        } else {
          AsyncStorage.setItem("markerColorSetting", "false");
        }
      } catch (error) {
        console.error("Error retrieving marker color setting:", error);
      }
    };

    getMarkerColorSetting();
  }, []);


  const toggleSetting = async (value: boolean) => {
    setMarkerColorSettingEnabled(value);
    await AsyncStorage.setItem("markerColorSetting", value? "true" : "false");
  };

  const fetchUserData = async () => {
    const response = await authenticatedFetch(`${ServerInfo.url}/users/me`);
    const data = await response.json();

    if (response.status === 200) {
      setUserData(data);
    } else {
      console.error(data);
    }
  };

  useEffect(() => {
    fetchUserData();
    const interval = setInterval(() => {
      fetchUserData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const logout = async () => {
    const response = await authenticatedFetch(
      `${ServerInfo.url}/users/logout/`,
      {
        method: "POST",
      }
    );

    if (response.ok) {
      setUserData(null);
      await AsyncStorage.removeItem("token");
    }

    await AsyncStorage.removeItem("token");

    while (router.canGoBack()) {
      router.back();
    }
    router.replace("/login");
  };

  const [deletePopupVisible, setDeletePopupVisible] = useState(false);

  const deletePopup = async () => {
    setDeletePopupVisible(true);
  };

  return (
    <SafeAreaView style={DefaultStyle.view}>
      <Text style={DefaultStyle.viewTitle}>
        Welkom, <Text style={{ color: Colors.accent }}>{userData?.username}</Text>
      </Text>
      {/* <Text style={styles.d}>
        Referral code:{" "}
        <Text style={{ color: Colors.accent }}>{userData?.referral_code}</Text>
      </Text> */}
      <Text style={styles.d}>
        Referrer: <Text style={{ color: Colors.accent }}>{userData?.referrer}</Text>
      </Text>
      <Text style={styles.d}>
        Lid sinds:{" "}
        <Text style={{ color: Colors.accent }}>
          {userData && userData.created_at
            ? formatDate(new Date(userData?.created_at))
            : ""}
        </Text>
      </Text>
      
      <View style={{ ...styles.d, alignItems: "flex-start", flexDirection: "row" }}>
        <Switch value={markerColorSettingEnabled} onValueChange={toggleSetting} 
          thumbColor={markerColorSettingEnabled ? Colors.accent : Colors.text}
          trackColor={{ false: "gray" }}
        />
        <Text style={{...styles.d, marginLeft: 10 }}>
        Markerkleuren voor duur van niet-gebruikte fiets.</Text>
      </View>

      {
        userData?.can_refer && (
          <Button title="Referrals" onPress={() => navigation.navigate("referral")} />
        )
      }

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Uitloggen</Text>
      </Pressable>
      <Pressable style={styles.deleteAccountButton} onPress={deletePopup}>
        <Text style={styles.deleteAccountButtonText}>Verwijder Account</Text>
      </Pressable>
      <Modal
        animationType="slide"
        transparent={true}
        visible={deletePopupVisible}
        onRequestClose={() => {
          setDeletePopupVisible(false);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              width: "90%",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}
            >
              Weet je zeker dat je je account wilt verwijderen?
            </Text>
            <Pressable
              style={{
                backgroundColor: "red",
                borderRadius: 10,
                padding: 10,
                elevation: 2,
                width: "90%",
                height: 60,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
              onPress={async () => {
                const response = await authenticatedFetch(
                  `${ServerInfo.url}/users/delete/`,
                  {
                    method: "POST",
                  }
                );

                if (response.ok) {
                  setUserData(null);
                  await AsyncStorage.removeItem("token");
                }

                await AsyncStorage.removeItem("token");

                while (router.canGoBack()) {
                  router.back();
                }
                router.replace("/login");
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "white" }}
              >
                Verwijder Account
              </Text>
            </Pressable>
            <Pressable
              style={{
                backgroundColor: Colors.accent,
                borderRadius: 10,
                padding: 10,
                elevation: 2,
                width: "90%",
                height: 60,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                setDeletePopupVisible(false);
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "white" }}
              >
                Annuleren
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  d: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginLeft: "5%",
    marginBottom: "2%",
  },
  logoutButton: {
    display: "flex",
    backgroundColor: Colors.accent,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: "90%",
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 80,
    left: "5%",
  },
  logoutButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  deleteAccountButton: {
    display: "flex",
    backgroundColor: "red",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: "90%",
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    left: "5%",
  },
  deleteAccountButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
});
