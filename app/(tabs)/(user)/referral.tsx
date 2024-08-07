import { ServerInfo } from "@/constants/Server";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, Button, ScrollView, ToastAndroid } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authenticatedFetch } from "@/app/fetch";
import { Colors, DefaultStyle } from "@/constants/Style";
import * as Clipboard from "expo-clipboard";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Referral = {
  code: string,
  referrer: string,
  referred: string | null,
  created_at: Date
}

export default function ReferralScreen() {
  const [referrals, setReferrals] = useState<Referral[]>([]);

  const fetchReferrals = async () => {
    const response = await authenticatedFetch(`${ServerInfo.url}/users/referral/`);
    const data = await response.json();

    if (response.status === 200) {
      const referrals = data.map((referral: any) => {
        return {
          code: referral.code,
          referrer: referral.referrer,
          referred: referral.referred,
          created_at: new Date(referral.created_at),
        };
      });

      referrals.sort((a, b) => {
        if (a.referred === null && b.referred !== null) {
          return 1; // a is not referred, b is referred
        } else if (a.referred !== null && b.referred === null) {
          return -1; // a is referred, b is not referred
        } else {
          return 0; // both a and b are either referred or not referred
        }
      });

      setReferrals(referrals);
    } else {
      console.error(data);
    }
  };

  const createReferral = async () => {
    const response = await authenticatedFetch(`${ServerInfo.url}/users/referral/create/`, {
      method: "POST",
    });

    if (response.status === 201) {
      fetchReferrals();
    } else {
      console.error("Failed to create referral");
    }
  }

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    ToastAndroid.show("Copied to clipboard!", ToastAndroid.SHORT);
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  return (
    <SafeAreaView style={[DefaultStyle.view, { flex: 1 }]}>
      <Text style={[DefaultStyle.viewTitle, { color: Colors.text }]}>
        Referrals
      </Text>
      
      <ScrollView style={{display: "flex"}}>
        {
          referrals.map((referral) => {
            return (
              <View key={referral.code} style={styles.listItem}>
                <Text style={{ color: Colors.text }} onPress={() => copyToClipboard(referral.code)}>
                  <MaterialCommunityIcons name="content-copy" size={16} color={Colors.text} />
                  {referral.code}
                </Text>
                <Text style={{ color: Colors.text }}>{referral.referrer}</Text>
                <Text style={{ color: Colors.text }}>{referral.referred}</Text>
                <Text style={{ color: Colors.text }}>{referral.created_at.toDateString()}</Text>
              </View>
            );
          })
        }
      </ScrollView>

      <Pressable style={styles.createButton} onPress={createReferral}>
        <Text style={styles.createButtonText}>Create Referral</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: Colors.text,
    color: Colors.text,
    width: "90%",
    left: "5%",
    height: 60,
    marginBottom: "2%",
    padding: "2%",
    borderRadius: 10,
  },

  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "2%",
    borderBottomColor: Colors.text,
    borderBottomWidth: 1,
  },

  createButton: {
    backgroundColor: Colors.accent,
    width: "90%",
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    left: "5%",
    elevation: 2,
    padding: 10,
    margin: 10,
  },
  createButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
});
