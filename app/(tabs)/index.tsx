import React, { useContext, useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View, Text, Modal, Button, TouchableWithoutFeedback, Pressable, KeyboardAvoidingView, FlatList } from 'react-native';

import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

import { RideContext } from './explore';

export type MarkerData = {
  id: string,
  name: string,
  code: number,
  latitude: string;
  longitude: string;
  is_available: boolean,
  is_in_use: boolean,
  last_used_by: string | null,
  last_used_on: Date | null,
  capabilities: string[],
};

export default function App() {
  const [[modalVisible, modalData], setModalVisible] = useState<[boolean, MarkerData | undefined]>([false, undefined]);
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const { currentRideHandler, setCurrentRideHandler } = useContext(RideContext);

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
      const response = await fetch('http://10.0.8.104:8000/bikes/list');
      const data = await response.json();

      for (let i = 0; i < data.length; i++) {
        data[i].last_used_on = new Date(data[i].last_used_on);
      }

      const items = data as MarkerData[];

      setMarkers(items);

      setModalVisible(([modalVisible, modalData]) => {
        const newData = items.find(x => x.id == modalData?.id);
        if(newData && modalVisible && modalData){
          return [modalVisible, newData];
        } else {
          return [modalVisible, modalData];
        }
      });
      
    } catch (error) {
      console.error('Error fetching markers:', error);
    }
  };

  const attemptReserve = async (marker: MarkerData) => {
    try {
      const response = await fetch(`http://10.0.8.104:8000/bikes/reserve/${marker.id}/`, {
        method: 'POST',
      });

      if (response.ok) {
        setModalVisible([false, undefined]);

        Toast.show({
          type: 'success',
          text1: `Fiets ${marker.name} gereserveerd!`
        });

        console.log(currentRideHandler);

        currentRideHandler?.();
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

  return (
    <View>
      <MapView 
        style={styles.map}
      >
        {markers.map((marker, index) => (
          <Marker
            key={marker.id + marker.is_in_use}
            coordinate={{ latitude: parseFloat(marker.latitude), longitude: parseFloat(marker.longitude) }}
            pinColor={marker.is_in_use ? 'purple' : 'teal'}
            onPress={() => {
              setModalVisible([true, marker]);
            }}
          />
        ))}
      </MapView>

      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        pointerEvents={modalVisible ? 'auto' : 'none'}
        onRequestClose={() => {
          setModalVisible([false, undefined]);
        }}>

        <TouchableWithoutFeedback onPress={() => setModalVisible([false, undefined])}>
          <View style={styles.bottomView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <View style={styles.rowView}>
                  <Text style={styles.modalTitle}>{modalData?.name}</Text>
                  <FlatList
                    contentContainerStyle={{ flex: 1, alignItems: 'center'}}
                    horizontal={true}
                    data={[
                      ["light", "flashlight"],
                      ["gears", "cog"],
                      ["crate", "basket"],
                      ["carrier", "logo-dropbox"]]}
                    renderItem={({ item }) => (
                      <Ionicons name={item[1]} style={modalData?.capabilities.find(x => x == item[0]) ? styles.bikeIcon : styles.bikeIconDisabled}/>
                    )}
                  />
                </View>
                <Text style={styles.superText}>Code:</Text>
                <Text style={styles.subText}>{modalData?.code}</Text>
                <Text style={styles.superText}>Laatst gebruikt door:</Text>
                <Text style={styles.subText}>{modalData?.last_used_by ?? '-'} : {modalData?.last_used_on?.toDateString() ?? '-'}</Text>
                <Text style={styles.superText}>Totale afstand gereden:</Text>
                <Text style={styles.subText}>10km</Text>

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
    height: '40%',
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
    color: 'teal',
  },
  bikeIconDisabled: {
    fontSize: 20,
    color: 'gray',
  },
  modalTitle: {
    // flex: 2,
    fontSize: 30,
    marginBottom: 10,
    marginRight: 10,
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
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    position: 'absolute',
    bottom: 0,
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
});
