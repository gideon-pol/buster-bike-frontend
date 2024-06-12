import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RideProvider } from './explore';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <RideProvider>
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
        name="explore"
        options={{
          title: 'Rit',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'bicycle' : 'bicycle-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
    </RideProvider>
  );
}
