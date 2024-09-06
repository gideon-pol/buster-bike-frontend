import { Colors, DefaultStyle } from "@/constants/Style";
import { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authenticatedFetch } from "@/app/fetch";
import { ServerInfo } from "@/constants/Server";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from "expo-router";
import { Switch } from "react-native";
import { formatDate } from "@/constants/Formatting";
import UserContext from "@/hooks/UserProvider";
import SettingsContext from "@/hooks/SettingsProvider";
import LoadingButton from "@/components/LoadingButton";

export default function UserScreen() {
  const navigation = useNavigation();

  const {userData, fetchUserData} = useContext(UserContext);

  const { settings, setSettings } = useContext(SettingsContext);

  useEffect(() => {
    fetchUserData();
  }, []);

  const toggleMarkerColorSetting = async (value: boolean) => {
    setSettings({ ...settings, MarkerColorSettingEnabled: value });
  };

  const toggleOutOfRangeSetting = async (value: boolean) => {
    setSettings({ ...settings, OutOfRangeBikeEnabled: value });
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
      // setUserData(null);
      await AsyncStorage.removeItem("token");
  
      while (router.canGoBack()) {
        router.back();
      }
      router.replace("/login");
    } else {
      console.error("Error logging out:", response);
    }
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
        <Switch value={settings.MarkerColorSettingEnabled} onValueChange={toggleMarkerColorSetting} 
          thumbColor={settings.MarkerColorSettingEnabled ? Colors.accent : Colors.text}
          trackColor={{ false: "gray" }}
        />
        <Text style={{...styles.d, marginLeft: 10 }}>
        Markerkleuren voor duur van niet-gebruikte fiets.</Text>
      </View>

      { userData?.can_take_out_of_range && (
        <View style={{ ...styles.d, alignItems: "flex-start", flexDirection: "row" }}>
          <Switch value={settings.OutOfRangeBikeEnabled} onValueChange={toggleOutOfRangeSetting} 
            thumbColor={settings.OutOfRangeBikeEnabled ? Colors.accent : Colors.text}
            trackColor={{ false: "gray" }}
          />
          <Text style={{...styles.d, marginLeft: 10 }}>
          Fietsen buiten bereik toch pakken.</Text>
        </View>
        )
      }

      {
        userData?.can_refer && (
          <Button title="Referrals" onPress={() => navigation.navigate("referral")} />
        )
      }

      <LoadingButton style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Uitloggen</Text>
      </LoadingButton>

      <LoadingButton style={styles.deleteAccountButton} onPress={deletePopup}>
        <Text style={styles.deleteAccountButtonText}>Verwijder Account</Text>
      </LoadingButton>
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
                  // setUserData(null);
                  await AsyncStorage.removeItem("token");
                  await AsyncStorage.removeItem("token");
  
                  while (router.canGoBack()) {
                    router.back();
                  }
                  router.replace("/login");
                }
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
