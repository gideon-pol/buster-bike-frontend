import React, { useCallback, useContext, useEffect, useState } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";
import { Colors, DefaultStyle } from "@/constants/Style";
import * as SplashScreen from "expo-splash-screen";
import * as Location from "expo-location";
import * as Notifications from 'expo-notifications';
import * as TaskManager from "expo-task-manager";
import UserContext from "@/hooks/UserProvider";

SplashScreen.preventAutoHideAsync();

export default function SplashView() {
  const navigation = useNavigation();

  const [appIsReady, setAppIsReady] = useState(false);

  const { fetchUserData } = useContext(UserContext);
  
  useEffect(() => {
    const checkToken = async () => {
      const accepted = await AsyncStorage.getItem("disclaimerAccepted");
      if (!accepted) {
        navigation.reset({
          index: 0,
          routes: [{ name: "(tabs)" }, { name: "disclaimer" }],
        });
        navigation.navigate("disclaimer");
        return;
      }
      
      const token = await AsyncStorage.getItem("token");
      if (token) {
        navigation.reset({
          index: 0,
          routes: [{ name: "(tabs)" }],
        });
        navigation.navigate("(tabs)");
        await fetchUserData();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "(tabs)" }, { name: "login" }],
        });
        navigation.navigate("login");
      }
    };

    const askPermissions = async () => {
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();

      if (notificationStatus !== "granted") {
        navigation.reset({
          index: 0,
          routes: [{ name: "location" }],
        });
        navigation.navigate("location");
        return;
      }

      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== "granted") {
        navigation.reset({
          index: 0,
          routes: [{ name: "location" }],
        });
        navigation.navigate("location");
        return;
      }
      
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        navigation.reset({
          index: 0,
          routes: [{ name: "location" }],
        });
        navigation.navigate("location");
        return;
      }
    }
    
    (async () => {
      await checkToken();
      await askPermissions();
      setAppIsReady(true);
    })();
  }, [navigation]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaView
      style={[
        DefaultStyle.view,
        { flex: 1, justifyContent: "center", alignItems: "center" },
      ]}
      onLayout={onLayoutRootView}>
      <Text
        style={[
          DefaultStyle.viewTitle,
          { color: Colors.text, fontStyle: "italic", fontSize: 100 },
        ]}
      >
        BB
      </Text>
    </SafeAreaView>
  );
}
