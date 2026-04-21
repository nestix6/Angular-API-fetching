/** DummyJSON wrapper response with pagination metadata. */
export interface DummyJsonUsersResponse {
  users: DummyJsonUser[];
  total: number;
  skip: number;
  limit: number;
}

/** User shape consumed from DummyJSON plus optional nested fields. */
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

/** Minimal identity persisted for authenticated session state. */
export interface AuthenticatedUser {
  id: number;
  firstName: string;
  lastName: string;
}

/** Genderize API response for first-name gender prediction. */
export interface GenderizeResponse {
  name: string;
  gender: string | null;
  probability: number;
  count: number;
}

/** Zippopotam API response for postal-code location details. */
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

/** Detail panel payload combining DummyJSON user and enrichment fields. */
export interface EnrichedUserDetail {
  user: DummyJsonUser;
  gender: string;
  homeState: string;
  homeCountry: string;
}

/** Single detail-open history record tracked per session. */
export interface DetailHistoryEntry {
  id: number;
  fullName: string;
  startAt: Date;
  endAt: Date | null;
}
