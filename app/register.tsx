import { ServerInfo } from "@/constants/Server";
import { Colors, DefaultStyle } from "@/constants/Style";
import { useNavigation } from "expo-router";
import { useState } from "react";
import React, {
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");

  const navigation = useNavigation();

  const register = async () => {
    console.log(
      "Registering with username: " +
        username +
        " and password: " +
        password +
        " and referral code: " +
        referral
    );

    const response = await fetch(`${ServerInfo.url}/users/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        referral_code: referral,
      }),
    });

    if (response.status === 200) {
      console.log("Registered successfully");
      navigation.navigate("index");
    } else {
      console.log("Failed to register", response.body);
    }
  };

  return (
    <SafeAreaView style={DefaultStyle.view}>
      <Text style={DefaultStyle.viewTitle}>Buster Bike</Text>
      <View style={{ justifyContent: "center", flex: 1 }}>
        <Text style={styles.info}>Referral code</Text>
        <TextInput
          placeholder="Referral code"
          placeholderTextColor={"gray"}
          style={[styles.input, { marginBottom: "10%" }]}
          autoCapitalize="none"
          onChangeText={setReferral}
          maxLength={6}
        />
        <Text style={styles.info}>Gebruikersnaam</Text>
        <TextInput
          placeholder="Gebruikersnaam"
          style={styles.input}
          autoCapitalize="none"
          onChangeText={setUsername}
        />
        <Text style={styles.info}>Wachtwoord</Text>
        <TextInput
          placeholder="Wachtwoord"
          style={styles.input}
          autoCapitalize="none"
          secureTextEntry={true}
          onChangeText={setPassword}
        />
        <Pressable style={styles.button} onPress={register}>
          <Text style={styles.buttonText}>Registreer</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "white",
    width: "90%",
    left: "5%",
    height: 60,
    marginBottom: "2%",
    padding: "2%",
    borderRadius: 10,
  },

  button: {
    backgroundColor: "white",
    borderRadius: 10,
    width: "90%",
    left: "5%",
    height: 60,
    justifyContent: "center",
  },
  buttonText: {
    color: "black",
    fontSize: 20,
    textAlign: "center",
  },

  inputDark: {
    color: "white",
    backgroundColor: "black",
    borderWidth: 1,
    borderColor: "white",
    width: "90%",
    left: "5%",
    height: 60,
    marginBottom: "2%",
    padding: "2%",
    borderRadius: 10,
  },

  info: {
    color: "teal",
    fontSize: 15,
    marginLeft: "10%",
    width: "80%",
    marginBottom: "1%",
    borderBottomColor: "teal",
    borderBottomWidth: 2,
  },
});
