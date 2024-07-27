import React, { useContext, useEffect, useState } from "react";
import MapView, { Callout, Marker } from "react-native-maps";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Button,
  TouchableWithoutFeedback,
  Pressable,
  KeyboardAvoidingView,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";

import Toast from "react-native-toast-message";

import * as Location from "expo-location";

import RideContext from "@/hooks/RideProvider";

import { ServerInfo } from "@/constants/Server";
import Capability from "@/components/Capability";

import { authenticatedFetch } from "@/app/fetch";

import { BikeData } from "@/constants/Types";
import { useNavigation } from "expo-router";
import { Colors, MapStyle } from "@/constants/Style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

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


export default function App() {
  const navigation = useNavigation();

  const [modalData, setModalVisible] = useState<BikeData | undefined>(
    undefined
  );
  const [markers, setMarkers] = useState<BikeData[]>([]);
  const { currentRide, fetchCurrentRide, endCurrentRide } =
    useContext(RideContext);

  // const [bStatus, requestPermission] = Location.useBackgroundPermissions();

  const [locationBlocked, setLocationBlocked] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarkers();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (locationBlocked) {
      return;
    }

    const goToLocationBlockScreen = async () => {
      navigation.reset({
        index: 0,
        routes: [{ name: "location" }],
      });
      navigation.navigate("location");
    };

    const interval = setInterval(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        // let bStatus = await Location.requestBackgroundPermissionsAsync();

        if (status !== "granted") {
          // if(!bStatus?.granted){
          setLocationBlocked(true);
          goToLocationBlockScreen();
          return;
        }

        let location = await Location.getCurrentPositionAsync({});

        if (currentRide) {

          if (currentRide) {
            const oldLat = parseFloat(currentRide.last_latitude);
            const oldLon = parseFloat(currentRide.last_longitude);
            const distance = calculateDistance(
              oldLat,
              oldLon,
              location.coords.latitude,
              location.coords.longitude
            );
            currentRide.total_distance += distance;
            console.log("Distance:", distance);
            currentRide.last_latitude = location.coords.latitude.toFixed(6);
            currentRide.last_longitude = location.coords.longitude.toFixed(6);
          }
        }
      })();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [currentRide, locationBlocked]);

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
        const newData = items.find((x) => x.id == modalData?.id);
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
        Toast.show({
          type: "error",
          text1: "Je bent te ver weg van de fiets!",
        });
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

        Toast.show({
          type: "success",
          text1: `Fiets ${marker.name} gereserveerd!`,
        });

        fetchCurrentRide();
      } else {
        Toast.show({
          type: "error",
          text1: `Fiets ${marker.name} kon niet gereserveerd worden!`,
        });
        // console.error('Error reserving bike:', response.statusText, await response.text());
      }
    } catch (error) {
      console.error("Error reserving bike:", error);
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
            key={marker.id + marker.is_in_use}
            coordinate={{
              latitude: parseFloat(marker.latitude),
              longitude: parseFloat(marker.longitude),
            }}
            pinColor={marker.is_in_use ? "purple" : "teal"}
            onPress={() => {
              console.log("pressed");
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
                      </View>

                      {/* <Text style={styles.superText}>Code:</Text>
                      <Text style={styles.subText}>{modalData?.code}</Text> */}

                      <Text style={styles.superText}>
                        Laatst gebruikt door:
                      </Text>
                      <Text style={styles.subText}>
                        {modalData?.last_used_by ?? "-"} :{" "}
                        {modalData?.last_used_on?.toDateString() ?? "-"}
                      </Text>
                      <Text style={styles.superText}>
                        Totale afstand gereden:
                      </Text>
                      <Text style={styles.subText}>10km</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Image
                        source={{
                          uri: `${ServerInfo.url}/bikes/image/${modalData?.id}`,
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
      <Toast />
      {currentRide && (
        <View style={styles.smallWindow}>
          <Text style={styles.subText}>Huidige rit:</Text>
          <Text style={styles.subText}>{currentRide.bike.name}</Text>
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  smallWindow: {
    position: "absolute",
    top: "88%",
    left: "67%",
    width: "30%",
    height: "10%",
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  container: {
    flex: 1,
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
    backgroundColor: "teal",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: "10%",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
  },

  superText: {
    color: "teal",
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
    backgroundColor: "teal",
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
