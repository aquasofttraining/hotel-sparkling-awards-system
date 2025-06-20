import { Review } from './review';
import { HotelScoring } from './scoring';

export interface Hotel {
  GlobalPropertyID: number;
  GlobalPropertyName: string;
  PropertyAddress1: string;
  CityID?: number;
  PropertyStateProvinceID?: number;
  PropertyLatitude?: number;
  PropertyLongitude?: number;
  SabrePropertyRating?: number;
  HotelStars: number;
  DistanceToTheAirport?: number;
  FloorsNumber?: number;
  RoomsNumber?: number;
  sparkling_score?: number;
  last_updated?: string;
  scoring?: HotelScoring;
  reviews?: Review[];
}

export interface HotelFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  managedByUser?: number;
}

export interface CreateHotelRequest {
  GlobalPropertyName: string;
  PropertyAddress1: string;
  HotelStars: number;
  RoomsNumber?: number;
  FloorsNumber?: number;
  DistanceToTheAirport?: number;
}
