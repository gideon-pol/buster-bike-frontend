// import { MarkerData } from '@/app/(tabs)';
import { RideData } from '@/app/(tabs)';
import { createContext } from 'react';

const RideContext = createContext({
  currentRide: undefined as RideData | undefined,
  fetchCurrentRide: async () => {},
  endCurrentRide: async () => {},
});

export default RideContext;