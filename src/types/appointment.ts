import { Package, Addon } from './packages';

export type AppointmentType = 'lead' | 'revisit';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';
export type Temperature = 'cold' | 'warm' | 'hot';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  contactType: 'phone' | 'email';
  contactValue: string;
  address: string;
  postcode: string;
}

export interface TVPackage {
  id: string;
  name: string;
  type: 'entertainment' | 'sports' | 'movies' | 'kids';
  description: string;
}

export interface ProviderDetails {
  name: string;
  price: number;
  speed: number;
  estimatedSpeed?: number;
  contractEnd: Date;
  products: {
    tv: boolean;
    tvPackages: TVPackage[];
    usesServices: boolean | null;
    mobile: boolean;
    landline: 'none' | 'incoming' | 'outgoing' | 'both';
  };
}

export interface Appointment {
  id: string;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledFor: Date;
  customerInfo: CustomerInfo;
  providerDetails: ProviderDetails;
  selectedPackage?: Package;
  selectedAddons: Addon[];
  painPoints: string[];
  temperature: Temperature;
  score: number;
  maxScore: number;
  createdAt: Date;
  updatedAt: Date;
}