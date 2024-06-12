import { Tabs } from 'expo-router';
import React, { useState } from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import RideContext from '@/hooks/RideProvider';
import { BikeData } from '.';
import { ServerInfo } from '@/constants/Server';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [currentRide, setCurrentRide] = useState<BikeData | undefined>(undefined);

  const fetchCurrentRide = async () => {
    const response = await fetch(`http://${ServerInfo.ip}:${ServerInfo.port}/users/reserved`);
    const data = await response.json();

    data.last_used_on = new Date(data.last_used_on);
    data.capabilities = {
      tires: data.capabilities.tires ?? 0,
      light: data.capabilities.light ?? 0,
      gears: data.capabilities.gears ?? 0,
      carrier: data.capabilities.carrier ?? 0,
      crate: data.capabilities.crate ?? 0,
    };

    if(data){
      setCurrentRide(data);
    }
  };

  const endCurrentRide = async () => {
    console.log(currentRide)
    const response = await fetch(`http://${ServerInfo.ip}:${ServerInfo.port}/users/reserved/end`, {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentRide),
    });

    if(response.ok){
      setCurrentRide(undefined);
    }
  };

  return (
    <RideContext.Provider value={{ currentRide, fetchCurrentRide, endCurrentRide }}>

    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'map' : 'map-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ride"
        options={{
          title: 'Rit',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'bicycle' : 'bicycle-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
    </RideContext.Provider>
  );
}
