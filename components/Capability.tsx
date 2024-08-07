import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

function Capability({ type, state, style, onPress }: { type: string, state: number, style?: StyleProp<TextStyle>, onPress?: () => void }) {
    const iconNameMapping: {[key: string]: string} = {
        "tires": "tire",
        "light": "flashlight",
        "gears": "cog",
        "carrier": "weight-kilogram",
        "crate": "package-variant"
    }

  return (
    <MaterialCommunityIcons name={iconNameMapping[type]} 
        style={[
        // styles.bikeIcon,
        [styles.bikeIconStateDisabled, styles.bikeIconStateBad, styles.bikeIconStateMid, styles.bikeIconStateGood]
        [state ?? 0],
        style
        ]}
        onPress={onPress}
    />
  )
}


const styles = {
    bikeIconStateGood: {
        color: '#06C100',
    },
    bikeIconStateMid: {
        color: '#FFEB3B'
    },
    bikeIconStateBad: {
        color: '#FF5722',
    },
    bikeIconStateDisabled: {
        color: 'gray',
    },
}


export default Capability;