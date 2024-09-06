export type RideData = {
  bike: BikeData;
  last_longitude: string;
  last_latitude: string;
  total_distance: number;
};

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
  total_distance: number;
  notes: string;
};

export type UserData = {
  id?: string;
  username: string;
  first_name: string;
  last_name?: string;
  email?: string;
  // referral_code?: string;
  referrer: string;
  can_refer: boolean,
  can_take_out_of_range: boolean,
  created_at?: string;
  updated_at?: string;
};

export type Settings = {
  MarkerColorSettingEnabled: boolean;
  OutOfRangeBikeEnabled: boolean; 
};