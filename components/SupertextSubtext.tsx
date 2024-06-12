import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

type Props = {
    superText: string;
    subText: string;
};

export default function SupertextSubtext({
    superText,
    subText,
    }: Props) {
    return (
        <View style={styles.container}>
        <Text style={styles.superText}>{superText}</Text>
        <Text style={styles.subText}>{subText}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    superText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    subText: {
        fontSize: 16,
    },
});
