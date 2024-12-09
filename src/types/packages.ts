export interface Package {
  id: string;
  name: string;
  speed: number;
  price: number;
  salePrice?: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  description: string;
  compatibleSpeeds: number[];
}