import { Tabs } from "expo-router";
import React, { useState } from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import RideContext from "@/hooks/RideProvider";
import { ServerInfo } from "@/constants/Server";

import { authenticatedFetch } from "@/app/fetch";
import { RideData, Settings, UserData } from "@/constants/Types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import UserContext from "@/hooks/UserProvider";
import SettingsContext from "@/hooks/SettingsProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarActiveBackgroundColor: Colors.accent,
        tabBarInactiveBackgroundColor: "black",
        tabBarItemStyle: {
          borderRadius: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "map" : "map-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ride"
        options={{
          title: "Rit",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "bicycle" : "bicycle-outline"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(user)"
        options={{
          title: "User",
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "account" : "account-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
