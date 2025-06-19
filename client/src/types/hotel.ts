import { Review } from './review';
import { HotelScoring } from './scoring';

export interface Hotel {
  GlobalPropertyID: number;
  GlobalPropertyName: string;
  PropertyAddress1: string;
  PropertyCity: string;
  PropertyState: string;
  PropertyPostalCode: string;
  PropertyCountry: string;
  PropertyPhone: string;
  PropertyFax: string;
  PropertyLatitude: number;
  PropertyLongitude: number;
  HotelStars: number;
  RoomsNumber: number;
  FloorsNumber: number;
  DistanceToTheAirport: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  scoring?: HotelScoring;
  reviews?: Review[];
}

export interface HotelFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
