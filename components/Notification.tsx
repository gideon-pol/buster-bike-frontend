import React from 'react';
import { StyleSheet, View, Text, Modal } from 'react-native';

type Props = {
    text: string;
    onTimeout: () => void;
};

export default function Notification({ 
        text,
        onTimeout
    }: Props) {

    React.useEffect(() => {
        const timer = setTimeout(() => {
            onTimeout();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Modal
        animationType='slide'
        transparent={true}
      >
        <View style={styles.notificationView}>
          <Text style={styles.notificationTitle}>Notificatie</Text>
          <Text>{text}</Text>
        </View>
      </Modal>
    );
}
const styles = StyleSheet.create({
    notificationView: {
        display: 'flex',
        width: '95%',
        height: '20%',
        position: 'absolute',
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

export default function Notification(
    { text }: Props) {

    React.useEffect(() => {
        const timer = setTimeout(() => {
            // Destroy the notification here
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Modal
            animationType='slide'
            transparent={true}
        >
            <View style={styles.notificationView}>
                <Text style={styles.notificationTitle}>Notificatie</Text>
                <Text>{text}</Text>
            </View>
        </Modal>
    );
}
