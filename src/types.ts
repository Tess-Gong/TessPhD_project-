export interface SurveyResponse {
  participant_id: string;
  primary_colour: string;
  secondary_colour: string;
  tertiary_colour: string;
  canberra_postcode: string;
  gender: string;
  country_background: string;
  years_of_residency: number;
  age: number;
  recognising_correct_canberra_city_branding: number;
  promote_city_using_current_branding: number;
}

export type ViewMode = 'primary' | 'secondary' | 'tertiary';

export interface FilterState {
  postcode: string;
  gender: string;
  ageRange: [number, number];
  residencyRange: [number, number];
  country: string;
  viewMode: ViewMode;
}

export interface SuburbStats {
  postcode: string;
  suburbName: string;
  responses: number;
  avgRecognition: number;
  avgPromotion: number;
  avgAge: number;
  avgResidency: number;
  dominantPrimaryFamily: string;
  dominantSecondaryFamily: string;
  dominantTertiaryFamily: string;
  primaryFamilyBreakdown: Record<string, number>;
  secondaryFamilyBreakdown: Record<string, number>;
  tertiaryFamilyBreakdown: Record<string, number>;
  representativeColor: string;
  topHexColors: { hex: string; count: number }[];
  dominantColorFamily: string;
  dominantFamilyDescription: {
    title: string;
    tones: string;
    cluster: string;
  };
  topPrimaryColours: string[];
  topSecondaryColours: string[];
  topTertiaryColours: string[];
  allColours: string[];
  genderBreakdown: Record<string, number>;
  ageBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  ageRange: [number, number];
  residencyRange: [number, number];
}
