export interface BackendCityItem {
  city?: string | null;
  name_sv?: string | null;
  company_count?: number;
  [key: string]: unknown;
}

/** A municipality in the company filter, biggest first. */
export interface CityOption {
  name: string;
  nameSv?: string | null;
  count: number;
}

export interface CityRegion {
  id?: number;
  name?: string;
  region?: string;
  [key: string]: unknown;
}
