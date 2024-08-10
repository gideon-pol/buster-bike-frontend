import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TouchableWithoutFeedback,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

import RideContext from "@/hooks/RideProvider";

import Periodic from "@/components/Periodic";
import Capability from "@/components/Capability";
import { BikeState } from "@/constants/Types";

import {
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { DefaultStyle } from "@/constants/Style";
import { Colors } from "@/constants/Style";
import { formatDate, formatTime } from "../../constants/Formatting";

export default function TabTwoScreen() {
  const { currentRide, fetchCurrentRide, endCurrentRide } =
    useContext(RideContext);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [bikeCapabilities, setBikeCapabilities] = useState<BikeState>({
    tires: 0,
    light: 0,
    gears: 0,
    carrier: 0,
    crate: 0,
  });

  const [modalUp, setModalUp] = useState<boolean>(false);

  let view = null;

  const cycleState = (capability: string) => {
    setBikeCapabilities((prev) => {
      const n = { ...prev, [capability]: ((prev[capability] ?? 0) + 3) % 4 };
      currentRide.bike.capabilities = n;
      return n;
    });
  };

  useEffect(() => {
    fetchCurrentRide();
  }, []);

  const textInputRef = useRef(null);
  // useEffect(() => {
  //   const backAction = () => {
  //     textInputRef.current.blur();
  //     return true; // This will prevent the app from closing
  //   };

  //   const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

  //   return () => backHandler.remove();
  // }, []);

  useEffect(() => {
    if (currentRide) {
      setBikeCapabilities(currentRide.bike.capabilities);
    }
  }, [currentRide]);

  if (currentRide) {
    view = (
      <SafeAreaView style={DefaultStyle.view}>
        {/* <StatusBar style="dark" animated={true} /> */}
        <Text style={DefaultStyle.viewTitle}>Huidige Rit</Text>
        <Text style={styles.bikeName}>{currentRide?.bike.name}</Text>
        <Text style={styles.superText}>Code:</Text>
        <Text style={styles.subText}>{currentRide?.bike.code}</Text>
        <Text style={styles.superText}>Totale afstand gereden:</Text>
        <Periodic interval={30000}>
          {() => (
            <Text style={styles.subText}>
              {currentRide.total_distance.toFixed(1)}km
            </Text>
          )}
        </Periodic>

        <Text style={styles.superText}>In gebruik sinds:</Text>
        <Periodic interval={1000}>
          {() => (
            <Text style={styles.subText}>
              {currentRide?.bike.last_used_on ? formatDate(currentRide?.bike.last_used_on) : "-"} -{" "}
              {formatTime(
                Date.now() - (currentRide?.bike.last_used_on?.getTime() ?? 0)
              )}
            </Text>
          )}
        </Periodic>

        {/* <Image source={{uri: `${ServerInfo.url}/bikes/image/${currentRide?.id}`}} style={{ width: '20%', height: '20%' }} /> */}

        <Pressable
          style={styles.endRideButton}
          onPress={() => {
            setModalUp(false);
            setModalVisible(true);
          }}
        >
          <Text style={styles.endRideText}>Rit beeindigen</Text>
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
                            "Versnellingen werken slecht",
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
                        // onBlur={() => setModalUp(false)}
                        onChangeText={(e) => (currentRide.bike.notes = e)}
                      >
                        {currentRide?.bike.notes}
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
                        Bevestig
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
  } else {
    view = (
      <SafeAreaView style={DefaultStyle.view}>
        {/* <StatusBar style="dark" animated={true} /> */}
        <Text style={DefaultStyle.viewTitle}>Geen Rit</Text>
      </SafeAreaView>
    );
  }

  return view;

  
}

const styles = StyleSheet.create({
  bikeName: {
    fontSize: 40,
    fontWeight: "bold",
    marginLeft: "5%",
    color: Colors.accent,
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
    backgroundColor: Colors.accent,
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
