import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Colors, DefaultStyle } from "../constants/Style";
import { useNavigation } from "expo-router";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DisclaimerScreen() {
  const navigation = useNavigation();

  const accept = async () => {
    await AsyncStorage.setItem("disclaimerAccepted", "true");
    navigation.navigate("index");
  };

  return (
    <SafeAreaView style={DefaultStyle.view}>
      <View style={styles.padding} />
      <Text style={DefaultStyle.viewTitle}>Buster Bike</Text>
      <View
        style={{
          marginLeft: "5%",
          marginRight: "5%",
          justifyContent: "center",
          flex: 1,
        }}
      >
        <Text style={styles.info}>Enkele dingen voordat je kunt beginnen:</Text>
        <Text style={styles.info}>
          • De app is gebouwd op het vertrouwen van de gebruikers. Zorg er daarom voor 
          dat je altijd netjes aangeeft waar je de fiets achterlaat in de app.
        </Text>
        <Text style={styles.info}>
          • De fiets heeft altijd een roze slot, zodat ze makkelijk te herkennen zijn.
        </Text>
        <Text style={styles.info}>
          • Zet de fiets altijd goed op slot (ergens aan vast of door een wiel), en op een plek 
          waar hij niet kan worden weggehaald. Dus in een vak, rek of stalling.
        </Text>
        <Text style={styles.info}>
          • Buster Bike is niet verantwoordelijk voor schade of letsel dat voortkomt uit het 
          gebruik van deze app. De fietsen zijn vaak niet in de beste staat, dus zorg ervoor 
          dat je goed oplet, bijvoorbeeld of de remmen werken.
        </Text>
        <Text style={styles.info}>
          • Gebruik deze app niet tijdens het fietsen (want boete).
        </Text>
        <Text style={styles.info}>
          • Je kunt het slot makkelijk over je stuur hangen om het mee te nemen.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            accept();
          }}
        >
          <Text style={styles.buttonText}>Accepteer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  info: {
    color: Colors.text,
    fontSize: 16,
    marginBottom: 10,
  },
  padding: {
    height: 50,
  },
  button: {
    backgroundColor: Colors.accent,
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    marginLeft: "5%",
    marginRight: "5%",
  },
  buttonText: {
    color: Colors.text,
    fontSize: 16,
    textAlign: "center",
  },
});
