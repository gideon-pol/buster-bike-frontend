import React, { useContext, useEffect, useState } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  Pressable,
  FlatList,
  Image,
  Platform,
  ToastAndroid,
} from "react-native";

import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";

import RideContext from "@/hooks/RideProvider";

import { ServerInfo } from "@/constants/Server";
import Capability from "@/components/Capability";

import { authenticatedFetch } from "@/app/fetch";

import { BikeData } from "@/constants/Types";
import { useNavigation } from "expo-router";
import { Colors, MapStyle } from "@/constants/Style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { formatDate, formatTime } from "@/constants/Formatting";

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

const LOCATION_TASK = "LOCATION_TRACKING";

export default function App() {
  const navigation = useNavigation();

  const [modalData, setModalVisible] = useState<BikeData | undefined>(
    undefined
  );
  const [markers, setMarkers] = useState<BikeData[]>([]);
  const { currentRide, fetchCurrentRide } =
    useContext(RideContext);

  const [markerColorSetting, setMarkerColorSetting] = useState<boolean>(false);

  useEffect(() => {
    const getMarkerColorSetting = async () => {
      try {
        const value = await AsyncStorage.getItem("markerColorSetting");
        if (value !== null) {
          setMarkerColorSetting(value === "true");
        } else {
          AsyncStorage.setItem("markerColorSetting", "false");
        }
      } catch (error) {
        console.error("Error retrieving marker color setting:", error);
      }
    };

    const interval = setInterval(() => {
    getMarkerColorSetting();
  }, 5000);
  return () => {
    clearInterval(interval);
  };

  }, []);

  useEffect(() => {
    fetchCurrentRide();
    const interval = setInterval(() => {
      fetchMarkers();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const goToLocationBlockScreen = async () => {
      navigation.reset({
        index: 0,
        routes: [{ name: "location" }],
      });
      navigation.navigate("location");
    };

    const setupTracking = async () => {
      TaskManager.defineTask("LOCATION_TRACKING", ({data, error}) => {
        if(error) {
          console.error(error);
          return;
        }
      
        if(data && currentRide) {
          const location = data.locations[0];

          if(location.mocked) {
            goToLocationBlockScreen();
            return;
          }
      
          const oldLat = parseFloat(currentRide.last_latitude);
          const oldLon = parseFloat(currentRide.last_longitude);
          const distance = calculateDistance(
            oldLat,
            oldLon,
            location.coords.latitude,
            location.coords.longitude
          );

          if (distance >= 0.1) {
            currentRide.total_distance += distance;
            currentRide.last_latitude = location.coords.latitude.toFixed(6);
            currentRide.last_longitude = location.coords.longitude.toFixed(6);
          }
        }
      });

      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        foregroundService: {
          notificationTitle: `Huidige rit: ${currentRide!.bike.name}`,
          notificationBody: `${currentRide!.total_distance}km - ${formatTime(Date.now() - (currentRide!.bike.last_used_on?.getTime() ?? 0))}`,
          notificationColor: "teal",
        }
      });
    }

    if(currentRide) {
      const interval = setInterval(() => {
        setupTracking();
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    } else {
      (async () => await Location.stopLocationUpdatesAsync(LOCATION_TASK))();
    }
  }, [currentRide]);

  const fetchMarkers = async () => {
    try {
      const response = await authenticatedFetch(
        `${ServerInfo.url}/bikes/list/`
      );
      const data = await response.json();

      for (let i = 0; i < data.length; i++) {
        data[i].last_used_on = new Date(data[i].last_used_on);
        data[i].capabilities = {
          tires: data[i].capabilities.tires ?? 0,
          light: data[i].capabilities.light ?? 0,
          gears: data[i].capabilities.gears ?? 0,
          carrier: data[i].capabilities.carrier ?? 0,
          crate: data[i].capabilities.crate ?? 0,
        };
      }

      const items = data as BikeData[];

      setMarkers(items);

      setModalVisible((modalData) => {
        const newData = items.find((x) => x.id === modalData?.id);
        if (newData && modalData) {
          return newData;
        } else {
          return modalData;
        }
      });
    } catch (error) {
      console.error("Error fetching markers:", error);
    }
  };

  const attemptReserve = async (marker: BikeData) => {
    // make sure the distance is less than 100m
    let location = await Location.getCurrentPositionAsync({});
    const distance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      parseFloat(marker.latitude),
      parseFloat(marker.longitude)
    );

    if (distance > 0.05) {
      ToastAndroid.showWithGravity("Je bent te ver weg van de fiets!", ToastAndroid.LONG, ToastAndroid.CENTER);
      return;
    }
    try {
      const response = await authenticatedFetch(
        `${ServerInfo.url}/bikes/reserve/${marker.id}/`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setModalVisible(undefined);

        ToastAndroid.showWithGravity(`Fiets ${marker.name} gereserveerd!`, ToastAndroid.LONG, ToastAndroid.TOP);

        fetchCurrentRide();
      } else {
        ToastAndroid.showWithGravity(
          `Fiets ${marker.name} kon niet gereserveerd worden!`,
          ToastAndroid.LONG,
          ToastAndroid.TOP
        );
        // console.error('Error reserving bike:', response.statusText, await response.text());
      }
    } catch (error) {
      console.error("Error reserving bike:", error);
    }
  };

  const getPinColor = (marker: BikeData): string => {
    if (markerColorSetting) {
      if (marker.last_used_on === null) {
        return "purple";
      }
      const not_used_for = new Date().getTime() - marker.last_used_on.getTime();
      // red for 1 month
      if (not_used_for > 1000 * 60 * 60 * 24 * 30) {
        return "red";
        // orange for 2 weeks
      } else if (not_used_for > 1000 * 60 * 60 * 24 * 14) {
        return "orange";
        // teal for the rest
      } else {
        return "teal";
      }
    } else {
      return "teal";
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, [currentRide]);

  return (
    <View>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        showsMyLocationButton={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        region={{
          latitude: 52.370216,
          longitude: 4.895168,
          latitudeDelta: 0.3,
          longitudeDelta: 0.15,
        }}
        followsUserLocation={true}
        customMapStyle={MapStyle.dark}
      >
        {markers.map((marker, index) => (
          <Marker
            key={marker.id + marker.is_in_use + getPinColor(marker)}
            coordinate={{
              latitude: parseFloat(marker.latitude),
              longitude: parseFloat(marker.longitude),
            }}
            pinColor={getPinColor(marker)}
            onPress={() => {
              setModalVisible(marker);
            }}
          />
        ))}
      </MapView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalData !== undefined}
        pointerEvents={modalData ? "auto" : "none"}
        onRequestClose={() => {
          setModalVisible(undefined);
        }}
      >
        <LinearGradient
          colors={["rgba(1,1,1,0)", "rgba(255,255,255,1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.7 }}
          style={{ width: "100%", height: "100%" }}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(undefined)}>
            <View style={styles.bottomView}>
              <TouchableWithoutFeedback>
                <View style={styles.modalView}>
                  <View style={styles.rowView}>
                    <View style={{ width: "50%", marginRight: 10 }}>
                      <View style={styles.rowView}>
                        <Text style={styles.modalTitle}>{modalData?.name}</Text>
                      </View>
                      <FlatList
                        contentContainerStyle={{
                          flex: 1,
                          alignItems: "center",
                        }}
                        horizontal={true}
                        data={["tires", "light", "gears", "carrier", "crate"]}
                        renderItem={({ item }) => (
                          <Capability
                            type={item}
                            state={modalData.capabilities[item]}
                            style={styles.bikeIcon}
                          />
                        )}
                      />

                      {/* <Text style={styles.superText}>Code:</Text>
                      <Text style={styles.subText}>{modalData?.code}</Text> */}

                      <Text style={styles.superText}>
                        Laatst gebruikt door:
                      </Text>
                      <Text style={styles.subText}>
                        {modalData?.last_used_by ?? "-"} :{" "}
                        {modalData?.last_used_on ? formatDate(modalData?.last_used_on) : "-"}
                      </Text>
                      <Text style={styles.superText}>
                        Totale afstand gereden:
                      </Text>
                      <Text style={styles.subText}>{modalData?.total_distance.toFixed(1)}km</Text>
                        {/* {typeof modalData?.total_distance === 'number' ? modalData.total_distance.toFixed(2) : '-'} km */}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Image
                        source={{
                          uri: `${ServerInfo.url}/static/bikes/images/${modalData?.id}.png`,
                        }}
                        style={{
                          width: "100%",
                          aspectRatio: 1,
                          borderRadius: 10,
                        }}
                      />
                    </View>
                  </View>

                  <View>
                    <Text style={styles.notes}>{modalData?.notes}</Text>
                  </View>

                  <Pressable
                    style={
                      modalData?.is_in_use
                        ? [
                            styles.reserveButtonBase,
                            styles.reserveButtonDisabled,
                          ]
                        : styles.reserveButtonBase
                    }
                    onPress={() => {
                      if (!modalData?.is_in_use) {
                        attemptReserve(modalData!);
                      }
                    }}
                  >
                    <Text
                      style={
                        modalData?.is_in_use
                          ? styles.reserveButtonTextDisabled
                          : styles.reserveButtonText
                      }
                    >
                      Reserveren
                    </Text>
                  </Pressable>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </LinearGradient>
      </Modal>

      {/* <Modal
        animationType='fade'
        transparent={true}
        visible={notification !== undefined}
        onRequestClose={() => {
          setNotification(undefined);
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <TouchableWithoutFeedback onPress={() => setNotification(undefined)}>
            <KeyboardAvoidingView style={styles.notificationView}>
              <Text style={styles.notificationTitle}>Notificatie</Text>
              <Text>{notification}</Text>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </Modal> */}
      {currentRide && (
        <View style={styles.smallWindow}>
          <TouchableWithoutFeedback onPress={() => navigation.navigate("ride")}>
          <View>
            <Text style={styles.boldText}>
              Huidige rit:{" "}
              <Text style={[styles.boldText, {color: Colors.accent}]}>{currentRide.bike.name}</Text>
            </Text>
          </View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  smallWindow: {
    display: "flex",
    position: "absolute",
    right: "0%",
    bottom: "0%",
    padding: 10,
    margin: 5,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  bottomView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    display: "flex",
    width: "98%",
    height: "50%",
    backgroundColor: Colors.primary,
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 20,
    paddingVertical: 20,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  rowView: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  bikeIcon: {
    fontSize: 20,
    margin: 1,
  },

  modalTitle: {
    fontSize: 30,
    marginBottom: 10,
    marginRight: 5,
    textAlign: "left",
    color: Colors.text,
  },

  closeButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: "10%",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
  },

  boldText: {
    fontWeight: "bold",
    fontSize: 20,
    color: Colors.text,
  },

  superText: {
    color: Colors.accent,
  },
  subText: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 10,
    color: Colors.text,
  },

  reserveButtonBase: {
    width: "100%",
    height: 60,
    backgroundColor: Colors.accent,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },

  reserveButtonDisabled: {
    backgroundColor: "grey",
  },

  reserveButtonTextDisabled: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
    textDecorationLine: "line-through",
  },

  reserveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },

  notificationView: {
    width: "95%",
    height: "20%",
    position: "absolute",
    top: "5%",
    left: "2.5%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  notificationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  notes: {
    marginTop: 10,
    fontStyle: "italic",
    color: "grey",
  },
});
