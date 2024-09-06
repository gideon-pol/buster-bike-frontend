import { useState } from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingButtonProps {
  onPress: (setLoading: (loading: boolean) => void) => Promise<void>;
  disabled?: boolean;
  style: any;
  disabledStyle?: any;
  children: React.ReactNode;
  spinnerColor?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ onPress, disabled, style, disabledStyle, children, spinnerColor="white" }) => {
  const [loadingState, setLoadingState] = useState(false);

  const handlePress = async () => {
    if(!loadingState){
      setLoadingState(true);
      await onPress((l) => {
        setLoadingState(l);
      }); 

      setLoadingState(false);
    }
  }

  return (
    <Pressable
      style={disabled ? disabledStyle : style}
      onPress={handlePress}
      disabled={disabled || loadingState}
    >
      {loadingState ? (
        <ActivityIndicator size="large" color={spinnerColor} />
      ) : (
        children
      )}
    </Pressable>
  );
};

export default LoadingButton;