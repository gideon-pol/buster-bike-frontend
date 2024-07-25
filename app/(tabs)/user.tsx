import { Colors, DefaultStyle } from "@/constants/Style";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authenticatedFetch } from "../fetch";
import { ServerInfo } from "@/constants/Server";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from "expo-router";

type UserData = {
  id?: string;
  username: string;
  first_name: string;
  last_name?: string;
  email?: string;
  referral_code?: string;
  referrer?: string;
  created_at?: string;
  updated_at?: string;
};

export default function UserScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigation = useNavigation();

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
    const interval = setInterval(() => {
      fetchUserData();
    }, 1000);

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

  return (
    <SafeAreaView style={DefaultStyle.view}>
      <Text style={DefaultStyle.viewTitle}>
        Welkom, <Text style={{ color: "teal" }}>{userData?.username}</Text>
      </Text>
      <Text style={styles.d}>
        Email: <Text style={{ color: "teal" }}>{userData?.email}</Text>
      </Text>
      <Text style={styles.d}>
        Referral code:{" "}
        <Text style={{ color: "teal" }}>{userData?.referral_code}</Text>
      </Text>
      <Text style={styles.d}>
        Referrer: <Text style={{ color: "teal" }}>{userData?.referrer}</Text>
      </Text>
      <Text style={styles.d}>
        Lid sinds:{" "}
        <Text style={{ color: "teal" }}>
          {userData && userData.created_at
            ? new Date(userData?.created_at).toLocaleDateString("nl-NL", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })
            : ""}
        </Text>
      </Text>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Uitloggen</Text>
      </Pressable>
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
    backgroundColor: "teal",
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

  logoutButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
});
