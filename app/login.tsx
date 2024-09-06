import { ServerInfo } from "@/constants/Server";
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ToastAndroid,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authenticatedFetch } from "@/app/fetch";
import { useNavigation } from "expo-router";
import { Colors, DefaultStyle } from "@/constants/Style";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import UserContext from "@/hooks/UserProvider";
import LoadingButton from "@/components/LoadingButton";

export default function LoginScreen() {
  const navigation = useNavigation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { fetchUserData } = useContext(UserContext);

  // State variable to track password visibility
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const gotoMainScreen = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "(tabs)" }],
    });
    navigation.navigate("(tabs)");
  };

  const attemptLogin = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await authenticatedFetch(
      `${ServerInfo.url}/users/login/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      }
    );

    if (response.ok) {
      const body = await response.json();
      await AsyncStorage.setItem("token", body["token"]);
      await fetchUserData();
      gotoMainScreen();
      // navigation.navigate('(tabs)');
    } else {
      ToastAndroid.showWithGravity(
        `Inloggegevens onjuist`,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    }
  };

  return (
    <SafeAreaView style={[DefaultStyle.view, { flex: 1 }]}>
      <Text style={[DefaultStyle.viewTitle, { color: Colors.text }]}>
        Buster Bike
      </Text>
      <View style={{ justifyContent: "center", flex: 1 }}>
        <Text style={styles.info}>Gebruikersnaam</Text>
        <TextInput
          placeholder="Gebruikersnaam"
          style={styles.input}
          autoCapitalize="none"
          onChangeText={setUsername}
        />
        <Text style={styles.info}>Wachtwoord</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            marginBottom: "1%",
            marginLeft: "4%",
          }}
        >
          <TextInput
            placeholder="Wachtwoord"
            style={styles.input}
            autoCapitalize="none"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
          />
          <Pressable
            style={{
              borderRadius: 10,
              width: "100%",
              height: 60,
              justifyContent: "center",
              marginLeft: "-9%",
              marginBottom: "2%",
            }}
            onPress={toggleShowPassword}
          >
            <MaterialCommunityIcons
              name={showPassword ? "eye-off" : "eye"}
              size={40}
              style={{
                color: Colors.accent,
                fontSize: 25,
              }}
            />
          </Pressable>
        </View>

        {/* <Pressable style={styles.button} onPress={attemptLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable> */}

        <LoadingButton style={styles.button} onPress={attemptLogin} spinnerColor="black">
          <Text style={styles.buttonText}>Login</Text>
        </LoadingButton>
        <Text
          style={{ textAlign: "center", marginTop: "2%", color: Colors.text }}
        >
          Nog geen account? Registreer{" "}
          <Text
            style={{ color: "blue" }}
            onPress={() => navigation.navigate("register")}
          >
            hier
          </Text>
        </Text>
      </View>
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

  button: {
    color: Colors.primary,
    backgroundColor: Colors.text,
    borderRadius: 10,
    width: "90%",
    left: "5%",
    height: 60,
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 20,
    textAlign: "center",
  },
  info: {
    color: Colors.accent,
    fontSize: 15,
    marginLeft: "10%",
    width: "80%",
    marginBottom: "1%",
    borderBottomColor: Colors.accent,
    borderBottomWidth: 2,
  },
});
