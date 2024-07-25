import { ServerInfo } from '@/constants/Server';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function NoLocationAccessScreen() {
const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openURL(`app-settings://settings/`);
    }
  };
  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.title}>Locatie</Text>
      <Text style={styles.text}>We kregen geen toegang tot je locatie dus jij mag lekker niet meespelen</Text>
      <Text style={styles.text}>Ga naar settings en geef BusterBike rechten om altijd je locatie te mogen zien</Text>
      {/* <Pressable style={styles.button} onPress={openSettings}>
        <Text style={styles.buttonText}>
          Open instellingen
        </Text>
      </Pressable> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white'
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    margin: '2%',
  },

  text: {
    fontSize: 25,
    // fontWeight: 'bold',
    margin: '2%',
    marginLeft: '5%',
  },
});