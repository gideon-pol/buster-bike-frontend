import { Tabs } from "expo-router";
import React, { useState } from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import RideContext from "@/hooks/RideProvider";
import { ServerInfo } from "@/constants/Server";

import { authenticatedFetch } from "@/app/fetch";
import { RideData } from "@/constants/Types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // const [currentBike, setCurrentBike] = useState<BikeData | undefined>(undefined);
  const [currentRide, setCurrentRide] = useState<RideData | undefined>(
    undefined
  );

  const fetchCurrentRide = async () => {
    const response = await authenticatedFetch(
      `${ServerInfo.url}/users/reserved/`
    );
    const data = await response.json();

    data.last_used_on = new Date(data.last_used_on);
    data.capabilities = {
      tires: data.capabilities?.tires ?? 0,
      light: data.capabilities?.light ?? 0,
      gears: data.capabilities?.gears ?? 0,
      carrier: data.capabilities?.carrier ?? 0,
      crate: data.capabilities?.crate ?? 0,
    };

    if (data) {
      // setCurrentBike(data);
      setCurrentRide({
        total_distance: 0,
        last_latitude: data.latitude,
        last_longitude: data.longitude,
        bike: data,
      });
    }
  };

  const endCurrentRide = async () => {
    if (!currentRide) throw new Error("No current ride");

    currentRide.bike.latitude = currentRide.last_latitude;
    currentRide.bike.longitude = currentRide.last_longitude;

    const response = await authenticatedFetch(
      `${ServerInfo.url}/users/reserved/end/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentRide.bike),
      }
    );

    if (response.ok) {
      setCurrentRide(undefined);
    }
  };

  return (
    <RideContext.Provider
      value={{ currentRide: currentRide, fetchCurrentRide, endCurrentRide }}
    >
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
              <TabBarIcon
                name={focused ? "map" : "map-outline"}
                color={color}
              />
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
    </RideContext.Provider>
  );
}
