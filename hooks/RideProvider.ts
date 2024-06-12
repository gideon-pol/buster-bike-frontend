import { MarkerData } from '@/app/(tabs)';
import { createContext } from 'react';

const RideContext = createContext({
  currentRide: undefined as MarkerData | undefined,
  fetchCurrentRide: async () => {},
  endCurrentRide: async () => {},
});

export default RideContext;