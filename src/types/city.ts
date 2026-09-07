export interface BackendCityItem {
  city?: string | null;
  [key: string]: unknown;
}

export interface CityRegion {
  id?: number;
  name?: string;
  region?: string;
  [key: string]: unknown;
}
