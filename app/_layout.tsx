import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useNavigation } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import * as Location from 'expo-location';
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import UserContext from "@/hooks/UserProvider";
import SettingsContext from "@/hooks/SettingsProvider";
import RideContext from "@/hooks/RideProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authenticatedFetch } from "./fetch";
import { RideData, Settings, UserData } from "@/constants/Types";
import { ServerInfo } from "@/constants/Server";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if(loaded){
      loadSettings();
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const [currentRide, setCurrentRide] = useState<RideData | undefined>(
    undefined
  );

  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const [settings, setSettings] = useState<Settings>({
    MarkerColorSettingEnabled: false,
    OutOfRangeBikeEnabled: false
  });

  const fetchCurrentRide = async () => {
    const response = await authenticatedFetch(
      `${ServerInfo.url}/users/reserved/`
    );

    // TODO: Backend sometimes responds with 401 when user is not authenticated but still returns garbage data???
    if (!response.ok) {
      setCurrentRide(undefined);
      return;
    }

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
      setCurrentRide({
        total_distance: 0,
        last_latitude: data.latitude,
        last_longitude: data.longitude,
        bike: data,
      });
    } else {
      setCurrentRide(undefined);
    }
  };

  const endCurrentRide = async () => {
    if (!currentRide) throw new Error("No current ride");
    //HERE
    const location = await Location.getCurrentPositionAsync();
    currentRide.bike.latitude = location.coords.latitude.toString();
    currentRide.bike.longitude = location.coords.longitude.toString();

    const data = {
      ...currentRide.bike,
      driven_distance: currentRide.total_distance.toFixed(2),
    }

    const response = await authenticatedFetch(
      `${ServerInfo.url}/users/reserved/end/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      setCurrentRide(undefined);
    }
  };

  const fetchUserData = async () => {
    const response = await authenticatedFetch(`${ServerInfo.url}/users/me`);
    const data = await response.json();

    if (response.status === 200) {
      setUserData(data);
    } else {
      console.error(data);
    }
  }

  const assignSettings = async (settings: Settings) => {
    setSettings(settings);
    await AsyncStorage.setItem("settings", JSON.stringify(settings));
  }

  const loadSettings = async () => {
    const settings = await AsyncStorage.getItem("settings");
    if (settings) {
      setSettings(JSON.parse(settings));
    }
  }

  if (!loaded) {
    return null;
  }

  return (
    <UserContext.Provider value={{ userData: userData, fetchUserData }}>
      <SettingsContext.Provider value={{ settings, setSettings: assignSettings, loadSettings }}>
        <RideContext.Provider
          value={{ currentRide: currentRide, fetchCurrentRide, endCurrentRide }}
        >
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack initialRouteName="index">
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="location" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="disclaimer" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
        </RideContext.Provider>
      </SettingsContext.Provider>
    </UserContext.Provider>
  );
}
