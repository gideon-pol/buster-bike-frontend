import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, View, Text, Pressable } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useState, createContext, useCallback} from 'react';

import { MarkerData } from '.';

export const RideContext = createContext({
  currentRideHandler: undefined as (() => void) | undefined,
  setCurrentRideHandler: (ride: (() => void) | undefined) => {},
});

export function RideProvider({ children }: { children: React.ReactNode }) {
  const [currentRideHandler, setCurrentRideHandler] = useState<(() => void) | undefined>(undefined);

  return (
    <RideContext.Provider value={{ setCurrentRideHandler, currentRideHandler }}>
      {children}
    </RideContext.Provider>
  );
}

export default function TabTwoScreen() {
  const { currentRideHandler, setCurrentRideHandler } = useContext(RideContext);

  const [currentRide, setCurrentRide] = useState<MarkerData | undefined>(undefined);

  const fetchCurrentRide = useCallback(async () => {
    const response = await fetch('http://10.0.8.104:8000/users/reserved');
    const data = await response.json();

    data.last_used_on = new Date(data.last_used_on);
    
    if(data){
      setCurrentRide(data);
    }
  }, []);

  useEffect(() => {
    fetchCurrentRide();
    setCurrentRideHandler(fetchCurrentRide);
  }, [fetchCurrentRide, setCurrentRideHandler, setCurrentRide]);

  return (
    <SafeAreaView style={styles.view}>
      <StatusBar style="dark" animated={true}/> 
      <Text style={styles.title}>Huidige Rit</Text>
      <Text style={styles.bikeName}>{currentRide?.name}</Text>
      <Text style={styles.superText}>Code:</Text>
      <Text style={styles.subText}>{currentRide?.code}</Text>
      <Text style={styles.superText}>Laatst gebruikt door:</Text>
      <Text style={styles.subText}>{currentRide?.last_used_by ?? '-'} : {currentRide?.last_used_on?.toDateString() ?? '-'}</Text>
      <Text style={styles.superText}>Totale afstand gereden:</Text>
      <Text style={styles.subText}>10km</Text>

      <Text style={styles.superText}>In gebruik sinds:</Text>
      <Text style={styles.subText}>27 Jun 2024 - 2:06:32:15</Text>

      <Pressable style={styles.endRide} onPress={fetchCurrentRide}>
        <Text style={styles.endRideText}>Rit beeindigen</Text>
      </Pressable>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    margin: 10,
  },

  bikeName: {
    fontSize: 40,
    fontWeight: 'bold',
    margin: 10,
    marginLeft: 20,
    color: 'teal',
  },

  subText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
  },

  superText: {
    fontSize: 20,
    marginLeft: 20,
  },

  endRide: {
    display: 'flex',
    backgroundColor: 'teal',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 6,
    // margin: 20,

    position: 'absolute',
    bottom: 20,
    left: '5%',
  },

  endRideText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});
