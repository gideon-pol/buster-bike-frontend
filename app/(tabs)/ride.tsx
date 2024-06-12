import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, View, Text, Pressable, TouchableWithoutFeedback, Modal } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect, useState, createContext, useCallback} from 'react';

import RideContext from '@/hooks/RideProvider';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { BikeState } from '.';
import Periodic from '@/components/Periodic';
import Capability from '@/components/Capability';
import { ServerInfo } from '@/constants/Server';

export default function TabTwoScreen() {
  const {currentRide, fetchCurrentRide, endCurrentRide} = useContext(RideContext);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [bikeCapabilities, setBikeCapabilities] = useState<BikeState>({
    tires: 0,
    light: 0,
    gears: 0,
    carrier: 0,
    crate: 0,
  });

  let view = null;

  const cycleState = (capability: string) => {
    setBikeCapabilities((prev) => {
      const n = {...prev, [capability]: ((prev[capability] ?? 0) + 1) % 4};
      currentRide.capabilities = n;
      return n;
    });
  };

  useEffect(() => {
    fetchCurrentRide();
  }, []);

  useEffect(() => {
    if(currentRide){
      setBikeCapabilities(currentRide.capabilities);
    }
  }, [currentRide]);

  if(currentRide){
    view = (
      <SafeAreaView style={styles.view}>
        <StatusBar style="dark" animated={true}/> 
        <Text style={styles.title}>Huidige Rit</Text>
        <Text style={styles.bikeName}>{currentRide?.name}</Text>
        <Text style={styles.superText}>Code:</Text>
        <Text style={styles.subText}>{currentRide?.code}</Text>
        <Text style={styles.superText}>Totale afstand gereden:</Text>
        <Periodic interval={30000}>
          {() => (
          <Text style={styles.subText}>10km</Text>
          )}
        </Periodic>

        <Text style={styles.superText}>In gebruik sinds:</Text>
        <Periodic interval={1000}>
        {() => (
          <Text style={styles.subText}>
            {currentRide?.last_used_on?.toDateString() ?? '-'} - {formatTime(Date.now() - (currentRide?.last_used_on?.getTime() ?? 0))}
          </Text>
        )}
        </Periodic>

        {/* <Image source={{uri: `http://${ServerInfo.ip}:${ServerInfo.port}/bikes/image/${currentRide?.id}`}} style={{ width: '20%', height: '20%' }} /> */}

        <Pressable style={styles.endRide} onPress={() => {setModalVisible(true); }}>
          <Text style={styles.endRideText}>Rit beeindigen</Text>
        </Pressable>

        <Modal
          animationType='slide'
          transparent={true}
          visible={modalVisible}
          pointerEvents={modalVisible ? 'auto' : 'none'}
          onRequestClose={() => {
            setModalVisible(false);
          }}>

          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.bottomView}>
              <TouchableWithoutFeedback>
                <View style={styles.modalView}>
                  <Text style={styles.modalTitle}>Werkt alles nog?</Text>
                  <View style={styles.rowView}>
                    <Capability type="tires" state={bikeCapabilities?.tires} style={styles.icon} onPress={()=>cycleState("tires")}/>
                    <Text style={styles.statusText}>
                      {["Band(en) is/zijn kapot",
                      "Band(en) is/zijn plat",
                      "Band(en) is/zijn zacht",
                      "Banden zijn hard"][bikeCapabilities?.tires]}
                    </Text>
                  </View>
                  <View style={styles.rowView}>
                    <Capability type="light" state={bikeCapabilities?.light} style={styles.icon} onPress={()=>cycleState("light")}/>
                    <Text style={styles.statusText}>
                      {["Lichten missen",
                      "Licht(en) is/zijn leeg",
                      "Licht(en) is/zijn zwak",
                      "Lichten zijn helder"][bikeCapabilities?.light]}
                    </Text>
                  </View>
                  <View style={styles.rowView}>
                    <Capability type="gears" state={bikeCapabilities?.gears} style={styles.icon} onPress={()=>cycleState("gears")}/>
                    <Text style={styles.statusText}>
                      {["Versnellingen missen",
                      "Versnellingen zijn kapot",
                      "Versnellingen zijn ...",
                      "Versnellingen werken",][bikeCapabilities?.gears]}
                    </Text>
                  </View>
                  <View style={styles.rowView}>
                    <Capability type="carrier" state={bikeCapabilities?.carrier} style={styles.icon} onPress={()=>cycleState("carrier")}/>
                    <Text style={styles.statusText}>Bagagedrager is goed</Text>
                  </View>
                  <View style={styles.rowView}>
                    <Capability type="crate" state={bikeCapabilities?.crate} style={styles.icon} onPress={()=>cycleState("crate")}/>
                    <Text style={styles.statusText}>Krat is goed</Text>
                  </View>

                  <Pressable style={[ styles.endRide, styles.endRideConfirm] } onPress={() => {setModalVisible(false); endCurrentRide();}}>
                    <Text style={[ styles.endRideText, styles.endRideConfirmText]}>Confirm</Text>
                  </Pressable>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>


      </SafeAreaView>
    );
  } else {
    view = (<SafeAreaView style={styles.view}>
        <StatusBar style="dark" animated={true}/> 
        <Text style={styles.title}>Geen Rit</Text>
    </SafeAreaView>);
  }

  return view;

  function formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const formattedTime = `${days}:${hours % 24}:${minutes % 60}:${seconds % 60}`;
    return formattedTime;
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    margin: 10,
  },

  bikeName: {
    fontSize: 40,
    fontWeight: 'bold',
    margin: 10,
    marginLeft: 20,
    color: 'teal',
  },

  subText: {
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
  },

  superText: {
    fontSize: 20,
    marginLeft: 20,
  },

  endRide: {
    display: 'flex',
    backgroundColor: 'teal',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 6,
    // margin: 20,

    position: 'absolute',
    bottom: 20,
    left: '5%',
  },

  endRideText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },

  endRideConfirm: {
    backgroundColor: 'white',
    width: '100%',
  },

  endRideConfirmText: {
    color: 'black',
  },

  bottomView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    display: 'flex',
    width: '98%',
    height: '60%',
    backgroundColor: "black",
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 20,
    paddingVertical: 20,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  modalTitle: {
    // flex: 2,
    fontWeight: 'bold',
    color: 'white',
    fontSize: 30,
    marginBottom: 10,
    marginRight: 10,
    textAlign: "left",
  },

  rowView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  statusText: {
    fontSize: 20,
    color: 'white',
    textAlignVertical: 'center'
  },

  icon: {
    fontSize: 50,
    margin: 2,
    // color: 'red',
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 20,
  },
});
