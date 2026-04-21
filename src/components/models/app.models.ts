export interface DummyJsonUsersResponse {
  users: DummyJsonUser[];
  total: number;
  skip: number;
  limit: number;
}

export interface DummyJsonUser {
  id: number;
  firstName: string;
  lastName: string;
  maidenName?: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  username: string;
  birthDate: string;
  image: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  eyeColor: string;
  hair?: {
    color?: string;
    type?: string;
  };
  ip: string;
  address?: {
    address?: string;
    city?: string;
    state?: string;
    stateCode?: string;
    postalCode?: string;
    coordinates?: {
      lat?: string;
      lng?: string;
    };
    country?: string;
  };
  macAddress: string;
  university: string;
}

export interface AuthenticatedUser {
  id: number;
  firstName: string;
  lastName: string;
}

export interface GenderizeResponse {
  name: string;
  gender: string | null;
  probability: number;
  count: number;
}

export interface ZippopotamResponse {
  postCode: string;
  country: string;
  countryAbbreviation: string;
  places: Array<{
    placeName: string;
    longitude: string;
    latitude: string;
    state: string;
    stateAbbreviation: string;
  }>;
}

export interface EnrichedUserDetail {
  user: DummyJsonUser;
  gender: string;
  homeState: string;
  homeCountry: string;
}

export interface DetailHistoryEntry {
  id: number;
  fullName: string;
  startAt: Date;
  endAt: Date | null;
}
