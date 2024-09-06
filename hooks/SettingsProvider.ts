// import { MarkerData } from '@/app/(tabs)';
import { Settings } from '@/constants/Types';
import { createContext } from 'react';

const SettingsContext = createContext({
  settings: {
    MarkerColorSettingEnabled: false,
    OutOfRangeBikeEnabled: false
  } as Settings,
  setSettings: async (settings: Settings) => {},
  loadSettings: async () => {}
});

export default SettingsContext;