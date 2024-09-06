// import { MarkerData } from '@/app/(tabs)';
import { UserData } from '@/constants/Types';
import { createContext } from 'react';

const UserContext = createContext({
  userData: undefined as UserData | undefined,
  fetchUserData: async () => {},
});

export default UserContext;