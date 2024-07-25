import { Colors, DefaultStyle } from "@/constants/Style";
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authenticatedFetch } from "../fetch";
import { ServerInfo } from "@/constants/Server";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Capability from "../../components/Capability";
import { BikeState } from "../../constants/Types";

type UserData = {
  id?: string;
  username: string;
  first_name: string;
  last_name?: string;
  email?: string;
  referral_code?: string;
  referrer?: string;
  created_at?: string;
  updated_at?: string;
};
export type BikeData = {
  id: string;
  name: string;
  code: number;
  latitude: string;
  longitude: string;
  is_available: boolean;
  is_in_use: boolean;
  last_used_by: string | null;
  last_used_on: Date | null;
  capabilities: BikeState;
  notes: string;
};
export default function UserScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigation = useNavigation();

  const fetchUserData = async () => {
    const response = await authenticatedFetch(`${ServerInfo.url}/users/me`);
    const data = await response.json();

    if (response.status === 200) {
      setUserData(data);
    } else {
      console.error(data);
    }
  };

  useEffect(() => {
    fetchUserData();

    const interval = setInterval(() => {
      fetchUserData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const logout = async () => {
    const response = await authenticatedFetch(
      `${ServerInfo.url}/users/logout/`,
      {
        method: "POST",
      }
    );

    if (response.ok) {
      setUserData(null);
      await AsyncStorage.removeItem("token");
    }

    await AsyncStorage.removeItem("token");

    while (router.canGoBack()) {
      router.back();
    }
    router.replace("/login");
  };

  const [addBike, setAddBike] = useState<JSX.Element | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const textInputRef = useRef(null);
  const [modalUp, setModalUp] = useState<boolean>(false);
  const NewBike: BikeData = {
    id: "",
    name: "",
    code: 0,
    latitude: "",
    longitude: "",
    is_available: false,
    is_in_use: false,
    last_used_by: "",
    last_used_on: null,
    capabilities: {
      tires: 0,
      light: 0,
      gears: 0,
      carrier: 0,
      crate: 0,
    },
    notes: "",
  };
  useEffect(() => {
    if (userData?.username === "Milan") {
      setAddBike(
        <Pressable
          style={styles.addBikeButton}
          onPress={() => {
            setModalUp(false);
            setModalVisible(true);
          }}
        >
          <Text style={styles.logoutButtonText}>Voeg fiets toe</Text>
        </Pressable>
      );
    } else {
      setAddBike(null);
    }
  }, [userData]);

  return (
    <SafeAreaView style={DefaultStyle.view}>
      <Text style={DefaultStyle.viewTitle}>
        Welkom, <Text style={{ color: "teal" }}>{userData?.username}</Text>
      </Text>
      <Text style={styles.d}>
        Email: <Text style={{ color: "teal" }}>{userData?.email}</Text>
      </Text>
      <Text style={styles.d}>
        Referral code:{" "}
        <Text style={{ color: "teal" }}>{userData?.referral_code}</Text>
      </Text>
      <Text style={styles.d}>
        Referrer: <Text style={{ color: "teal" }}>{userData?.referrer}</Text>
      </Text>
      <Text style={styles.d}>
        Lid sinds:{" "}
        <Text style={{ color: "teal" }}>
          {userData && userData.created_at
            ? new Date(userData?.created_at).toLocaleDateString("nl-NL", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })
            : ""}
        </Text>
      </Text>
      {addBike}
      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Uitloggen</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        pointerEvents={modalVisible ? "auto" : "none"}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <LinearGradient
          colors={["rgba(1,1,1,0)", "rgba(255,255,255,1)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.7 }}
          style={{ width: "100%", height: "100%" }}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <GestureHandlerRootView style={styles.bottomView}>
              <TouchableWithoutFeedback
                onPress={() => textInputRef?.current?.blur()}
              >
                <View
                  style={[
                    styles.modalView,
                    modalUp ? { height: "100%" } : null,
                  ]}
                >
                  <TextInput
                    placeholderTextColor={"gray"}
                    ref={textInputRef}
                    maxLength={400}
                    multiline={true}
                    style={styles.notes}
                    onFocus={() => setModalUp(true)}
                    onBlur={() => setModalUp(false)}
                    onChangeText={(e) => (currentRide.bike.notes = e)}
                  >
                    {currentRide?.notes}
                  </TextInput>

                  <Text style={styles.modalTitle}>Werkt alles nog?</Text>
                  <Text style={styles.modalSubTitle}>Klik de icoontjes</Text>
                  <View style={styles.rowView}>
                    <Capability
                      type="tires"
                      state={bikeCapabilities?.tires}
                      style={styles.icon}
                      onPress={() => cycleState("tires")}
                    />
                    <Text style={styles.statusText}>
                      {
                        [
                          "Band(en) is/zijn kapot",
                          "Band(en) is/zijn plat",
                          "Band(en) is/zijn zacht",
                          "Banden zijn hard",
                        ][bikeCapabilities?.tires]
                      }
                    </Text>
                  </View>
                  <View style={styles.rowView}>
                    <Capability
                      type="light"
                      state={bikeCapabilities?.light}
                      style={styles.icon}
                      onPress={() => cycleState("light")}
                    />
                    <Text style={styles.statusText}>
                      {
                        [
                          "Lichten missen",
                          "Licht(en) is/zijn leeg",
                          "Licht(en) is/zijn zwak",
                          "Lichten zijn helder",
                        ][bikeCapabilities?.light]
                      }
                    </Text>
                  </View>
                  <View style={styles.rowView}>
                    <Capability
                      type="gears"
                      state={bikeCapabilities?.gears}
                      style={styles.icon}
                      onPress={() => cycleState("gears")}
                    />
                    <Text style={styles.statusText}>
                      {
                        [
                          "Versnellingen missen",
                          "Versnellingen zijn kapot",
                          "Versnellingen werken half",
                          "Versnellingen werken",
                        ][bikeCapabilities?.gears]
                      }
                    </Text>
                  </View>
                  <View style={styles.rowView}>
                    <Capability
                      type="carrier"
                      state={bikeCapabilities?.carrier}
                      style={styles.icon}
                      onPress={() => cycleState("carrier")}
                    />
                    <Text style={styles.statusText}>
                      {
                        [
                          "Bagagedrager mist",
                          "Bagagedrager is kapot",
                          "Bagagedrager is gammel",
                          "Bagagedrager is stevig",
                        ][bikeCapabilities?.carrier]
                      }
                    </Text>
                  </View>
                  <View style={styles.rowView}>
                    <Capability
                      type="crate"
                      state={bikeCapabilities?.crate}
                      style={styles.icon}
                      onPress={() => cycleState("crate")}
                    />
                    <Text style={styles.statusText}>
                      {
                        [
                          "Krat mist",
                          "Krat is kapot",
                          "Krat is gammel",
                          "Krat is stevig",
                        ][bikeCapabilities?.crate]
                      }
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                      width: "100%",
                      marginTop: 5,
                      marginBottom: 20,
                      backgroundColor: "#1c1c1c",
                      padding: 5,
                      borderRadius: 10,
                    }}
                  >
                    <TextInput
                      placeholderTextColor={"gray"}
                      ref={textInputRef}
                      maxLength={400}
                      multiline={true}
                      style={styles.notes}
                      onFocus={() => setModalUp(true)}
                      onBlur={() => setModalUp(false)}
                      onChangeText={(e) => (currentRide.bike.notes = e)}
                    >
                      {currentRide?.notes}
                    </TextInput>
                  </View>

                  <Pressable
                    style={[styles.endRideButton, styles.endRideConfirm]}
                    onPress={() => {
                      setModalVisible(false);
                      endCurrentRide();
                    }}
                  >
                    <Text
                      style={[styles.endRideText, styles.endRideConfirmText]}
                    >
                      Confirm
                    </Text>
                  </Pressable>
                </View>
              </TouchableWithoutFeedback>
            </GestureHandlerRootView>
          </TouchableWithoutFeedback>
        </LinearGradient>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  d: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginLeft: "5%",
    marginBottom: "2%",
  },
  logoutButton: {
    display: "flex",
    backgroundColor: "teal",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: "90%",
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    left: "5%",
  },
  addBikeButton: {
    display: "flex",
    backgroundColor: "teal",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: "90%",
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 80,
    left: "5%",
  },

  logoutButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  bikeName: {
    fontSize: 40,
    fontWeight: "bold",
    margin: "2%",
    marginLeft: "5%",
    color: "teal",
  },

  subText: {
    fontSize: 25,
    fontWeight: "bold",
    marginLeft: "5%",
    marginBottom: 10,
    color: Colors.text,
  },

  superText: {
    fontSize: 20,
    marginLeft: "5%",
    color: Colors.text,
  },

  endRideButton: {
    display: "flex",
    backgroundColor: "teal",
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: "90%",
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    left: "5%",
  },

  endRideText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },

  endRideConfirm: {
    position: "relative",
    backgroundColor: "white",
    width: "100%",
    left: 0,
  },

  endRideConfirmText: {
    color: "black",
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
    height: "70%",
    backgroundColor: "black",
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 20,
    paddingVertical: 20,
    alignItems: "flex-start",
  },

  shadow: {
    shadowColor: "purple",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 20,
  },

  modalTitle: {
    // flex: 2,
    fontWeight: "bold",
    color: "white",
    fontSize: 30,
    marginRight: 10,
    textAlign: "left",
  },

  modalSubTitle: {
    color: "gray",
    fontSize: 15,
    fontStyle: "italic",
    marginTop: -2,
    // marginLeft: 12,
    marginBottom: 10,
  },

  rowView: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  statusText: {
    fontSize: 20,
    color: "white",
    textAlignVertical: "center",
  },

  icon: {
    fontSize: 50,
    margin: 2,
    // color: 'red',
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 20,
  },

  notes: {
    color: "gray",
    fontSize: 15,
    width: "100%",
    height: "100%",
    textAlignVertical: "top",
  },
});
