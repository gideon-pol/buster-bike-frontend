import React, { useContext, useEffect, useState } from 'react';
import MapView, { Callout, Marker } from 'react-native-maps';
import { StyleSheet, View, Text, Modal, Button, TouchableWithoutFeedback, Pressable, KeyboardAvoidingView, FlatList, TouchableOpacity, Image } from 'react-native';

import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import RideContext from '@/hooks/RideProvider';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ServerInfo } from '@/app/fetch';
import Capability from '@/components/Capability';

export type BikeState = {
  light: number,
  gears: number,
  carrier: number,
  crate: number,
  tires: number,
}

export type BikeData = {
  id: string,
  name: string,
  code: number,
  latitude: string;
  longitude: string;
  is_available: boolean,
  is_in_use: boolean,
  last_used_by: string | null,
  last_used_on: Date | null,
  capabilities: BikeState;
  notes: string;
};

export default function App() {
  const [modalData, setModalVisible] = useState<BikeData | undefined>(undefined);
  const [markers, setMarkers] = useState<BikeData[]>([]);

  const { currentRide, fetchCurrentRide, endCurrentRide } = useContext(RideContext);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarkers();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchMarkers = async () => {
    try {
      const response = await fetch(`${ServerInfo.url}/bikes/list`);
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
        const newData = items.find(x => x.id == modalData?.id);
        if(newData && modalData){
          return newData;
        } else {
          return modalData;
        }
      });
      
    } catch (error) {
      console.error('Error fetching markers:', error);
    }
  };

  const attemptReserve = async (marker: BikeData) => {
    try {
      const response = await fetch(`${ServerInfo.url}/bikes/reserve/${marker.id}/`, {
        method: 'POST',
      });

      if (response.ok) {
        setModalVisible(undefined);

        Toast.show({
          type: 'success',
          text1: `Fiets ${marker.name} gereserveerd!`
        });

        fetchCurrentRide();
      } else {
        Toast.show({
          type: 'error',
          text1: `Fiets ${marker.name} kon niet gereserveerd worden!`
        });
        // console.error('Error reserving bike:', response.statusText, await response.text());
      }
    } catch (error) {
      console.error('Error reserving bike:', error);
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
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        region={{latitude: 52.370216, longitude: 4.895168, latitudeDelta: 0.3, longitudeDelta: 0.15}}
      >
        {markers.map((marker, index) => (
          <Marker
            key={marker.id + marker.is_in_use}
            coordinate={{ latitude: parseFloat(marker.latitude), longitude: parseFloat(marker.longitude) }}
            pinColor={marker.is_in_use ? 'purple' : 'teal'}
            onPress={() => {
              console.log("pressed")
              setModalVisible(marker);
            }}/>
        ))}
      </MapView>

      <Modal
        animationType='slide'
        transparent={true}
        visible={modalData !== undefined}
        pointerEvents={modalData ? 'auto' : 'none'}
        onRequestClose={() => {
          setModalVisible(undefined);
        }}>

        <TouchableWithoutFeedback onPress={() => setModalVisible(undefined)}>
          <View style={styles.bottomView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <View style={styles.rowView}>
                  <View style={{width: '50%', marginRight: 10}}>
                    <View style={styles.rowView}>
                      <Text style={styles.modalTitle}>{modalData?.name}</Text>
                      <FlatList
                        contentContainerStyle={{ flex: 1, alignItems: 'center'}}
                        horizontal={true}
                        data={["tires","light","gears","carrier","crate"]}
                        renderItem={({ item }) => (
                          <Capability type={item} state={modalData.capabilities[item]} style={styles.bikeIcon} />
                        )}
                      />
                    </View>

                    {/* <Text style={styles.superText}>Code:</Text>
                    <Text style={styles.subText}>{modalData?.code}</Text> */}
                  
                    <Text style={styles.superText}>Laatst gebruikt door:</Text>
                    <Text style={styles.subText}>{modalData?.last_used_by ?? '-'} : {modalData?.last_used_on?.toDateString() ?? '-'}</Text>
                    <Text style={styles.superText}>Totale afstand gereden:</Text>
                    <Text style={styles.subText}>10km</Text>
                  </View>
                  <View style={{flex: 1}}>
                    <Image source={{uri: `${ServerInfo.url}/bikes/image/${modalData?.id}`}} style={{ width: '100%', aspectRatio: 1, borderRadius: 10 }} />
                  </View>
                </View>

                <View>
                  <Text style={styles.notes}>{modalData?.notes}</Text>
                </View>
                
                <Pressable
                  style={modalData?.is_in_use ? [styles.reserveButtonBase, styles.reserveButtonDisabled] : styles.reserveButtonBase}
                  onPress={() => {
                    if (!modalData?.is_in_use) {
                      attemptReserve(modalData!);
                    }
                  }}
                >
                  <Text style={modalData?.is_in_use ? styles.reserveButtonTextDisabled : styles.reserveButtonText}>Reserveren</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
      <Toast/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
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
    height: '50%',
    backgroundColor: "white",
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

  rowView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
  },

  closeButton: {
    backgroundColor: 'teal',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '10%',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },

  superText: {
    color: 'teal',
  },
  subText: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
  
  reserveButtonBase: {
    width: '100%',
    height: 65,
    backgroundColor: 'teal',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },

  reserveButtonDisabled: {
    backgroundColor: 'grey',
  },

  reserveButtonTextDisabled: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    textDecorationLine: 'line-through',
  },

  reserveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },

  notificationView: {
    width: '95%',
    height: '20%',
    position: 'absolute',
    top: '5%',
    left: '2.5%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2
    },
  },

  notificationTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
  },

  notes: {
    marginTop: 10,
    fontStyle: 'italic',
    color: 'grey',
  }
});
