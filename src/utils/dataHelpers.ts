import Papa from 'papaparse';
import { SurveyResponse, FilterState, SuburbStats } from '../types';

export const parseSurveyData = (csvString: string): SurveyResponse[] => {
  const { data } = Papa.parse(csvString, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return data as SurveyResponse[];
};

export const filterData = (data: SurveyResponse[], filters: FilterState): SurveyResponse[] => {
  return data.filter((item) => {
    const matchesPostcode = !filters.postcode || item.canberra_postcode.toString() === filters.postcode;
    const matchesGender = !filters.gender || item.gender === filters.gender;
    const matchesAge = item.age >= filters.ageRange[0] && item.age <= filters.ageRange[1];
    const matchesResidency = item.years_of_residency >= filters.residencyRange[0] && item.years_of_residency <= filters.residencyRange[1];
    const matchesCountry = !filters.country || item.country_background === filters.country;

    return matchesPostcode && matchesGender && matchesAge && matchesResidency && matchesCountry;
  });
};

export const getColorFamily = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  const hue = h * 360;
  const sat = s * 100;
  const lum = l * 100;

  // Classification logic
  if (lum < 15) return 'Black';
  if (lum > 85) return 'White';
  if (sat < 15) return 'Grey';

  // Brown is low-luminance orange/red
  if (lum < 40 && (hue < 40 || hue > 340)) return 'Brown';

  if (hue < 15 || hue >= 345) return 'Red';
  if (hue >= 15 && hue < 45) return 'Orange';
  if (hue >= 45 && hue < 75) return 'Yellow';
  if (hue >= 75 && hue < 165) return 'Green';
  if (hue >= 165 && hue < 255) return 'Blue';
  if (hue >= 255 && hue < 315) return 'Purple';
  if (hue >= 315 && hue < 345) return 'Pink';
  
  return 'Grey';
};

export const getRepresentativeColor = (hexCodes: string[]): string => {
  if (hexCodes.length === 0) return '#888888';
  
  let totalR = 0, totalG = 0, totalB = 0;
  hexCodes.forEach(hex => {
    totalR += parseInt(hex.slice(1, 3), 16);
    totalG += parseInt(hex.slice(3, 5), 16);
    totalB += parseInt(hex.slice(5, 7), 16);
  });
  
  const avgR = Math.round(totalR / hexCodes.length).toString(16).padStart(2, '0');
  const avgG = Math.round(totalG / hexCodes.length).toString(16).padStart(2, '0');
  const avgB = Math.round(totalB / hexCodes.length).toString(16).padStart(2, '0');
  
  return `#${avgR}${avgG}${avgB}`;
};

const familyDescriptions: Record<string, { tones: string; cluster: string }> = {
  'Red': { tones: 'vibrant crimsons and warm scarlets', cluster: 'bold, energetic red tones' },
  'Orange': { tones: 'earthy ochres and bright ambers', cluster: 'warm, sunset-inspired orange tones' },
  'Yellow': { tones: 'sunny golds and pale lemons', cluster: 'bright, optimistic yellow tones' },
  'Green': { tones: 'deep forests and fresh mints', cluster: 'natural, organic green tones' },
  'Blue': { tones: 'deep navies and sky azures', cluster: 'calm, professional blue tones' },
  'Purple': { tones: 'muted lavenders and rich plums', cluster: 'creative, sophisticated purple tones' },
  'Pink': { tones: 'soft rose and vibrant fuchsias', cluster: 'expressive, dynamic pink tones' },
  'Brown': { tones: 'earthy umbers and warm terracottas', cluster: 'grounded, natural brown tones' },
  'Black': { tones: 'deep charcoals and matte onyx', cluster: 'stark, minimalist dark tones' },
  'White': { tones: 'clean ivories and bright snows', cluster: 'pure, spacious light tones' },
  'Grey': { tones: 'muted silvers and slate grays', cluster: 'neutral, balanced gray tones' },
};

const postcodeToSuburb: Record<string, string> = {
  "2600": "Barton / Yarralumla",
  "2601": "City / Acton",
  "2602": "Ainslie / Dickson",
  "2603": "Griffith / Red Hill",
  "2604": "Kingston / Narrabundah",
  "2605": "Curtin / Hughes",
  "2606": "Lyons / Phillip",
  "2607": "Farrer / Isaacs",
  "2609": "Fyshwick / Symonston",
  "2611": "Weston Creek",
  "2612": "Braddon / Reid",
  "2614": "Aranda / Cook",
  "2615": "Belconnen / Florey",
  "2617": "Bruce / Kaleen",
  "2618": "Hall / Wallaroo",
  "2620": "Queanbeyan / Jerrabomberra",
  "2900": "Greenway",
  "2902": "Kambah",
  "2903": "Wanniassa",
  "2904": "Fadden / Gowrie",
  "2905": "Calwell / Theodore",
  "2906": "Conder / Gordon",
  "2911": "Crace",
  "2912": "Gungahlin",
  "2913": "Ngunnawal",
  "2914": "Amaroo",
};

export const getSuburbStats = (data: SurveyResponse[]): Record<string, SuburbStats> => {
  const stats: Record<string, SuburbStats> = {};
  const primaryCounts: Record<string, Record<string, number>> = {};
  const secondaryCounts: Record<string, Record<string, number>> = {};
  const tertiaryCounts: Record<string, Record<string, number>> = {};
  const allColoursSet: Record<string, Set<string>> = {};
  const allColoursList: Record<string, string[]> = {};
  const primaryFamilyCounts: Record<string, Record<string, number>> = {};
  const secondaryFamilyCounts: Record<string, Record<string, number>> = {};
  const tertiaryFamilyCounts: Record<string, Record<string, number>> = {};

  data.forEach((item) => {
    const pc = item.canberra_postcode.toString();
    if (!stats[pc]) {
      stats[pc] = {
        postcode: pc,
        suburbName: postcodeToSuburb[pc] || "Canberra Suburb",
        responses: 0,
        avgRecognition: 0,
        avgPromotion: 0,
        avgAge: 0,
        avgResidency: 0,
        dominantPrimaryFamily: '',
        dominantSecondaryFamily: '',
        dominantTertiaryFamily: '',
        primaryFamilyBreakdown: {},
        secondaryFamilyBreakdown: {},
        tertiaryFamilyBreakdown: {},
        representativeColor: '',
        topHexColors: [],
        dominantColorFamily: '',
        dominantFamilyDescription: { title: '', tones: '', cluster: '' },
        topPrimaryColours: [],
        topSecondaryColours: [],
        topTertiaryColours: [],
        allColours: [],
        genderBreakdown: {},
        ageBreakdown: {},
        countryBreakdown: {},
        ageRange: [Infinity, -Infinity],
        residencyRange: [Infinity, -Infinity],
      };
      primaryCounts[pc] = {};
      secondaryCounts[pc] = {};
      tertiaryCounts[pc] = {};
      allColoursSet[pc] = new Set();
      allColoursList[pc] = [];
      primaryFamilyCounts[pc] = {};
      secondaryFamilyCounts[pc] = {};
      tertiaryFamilyCounts[pc] = {};
    }

    const s = stats[pc];
    s.responses++;
    s.avgRecognition += item.recognising_correct_canberra_city_branding;
    s.avgPromotion += item.promote_city_using_current_branding;
    s.avgAge += item.age;
    s.avgResidency += item.years_of_residency;
    
    s.genderBreakdown[item.gender] = (s.genderBreakdown[item.gender] || 0) + 1;
    
    const ageGroup = Math.floor(item.age / 10) * 10 + 's';
    s.ageBreakdown[ageGroup] = (s.ageBreakdown[ageGroup] || 0) + 1;

    s.countryBreakdown[item.country_background] = (s.countryBreakdown[item.country_background] || 0) + 1;

    s.ageRange[0] = Math.min(s.ageRange[0], item.age);
    s.ageRange[1] = Math.max(s.ageRange[1], item.age);
    s.residencyRange[0] = Math.min(s.residencyRange[0], item.years_of_residency);
    s.residencyRange[1] = Math.max(s.residencyRange[1], item.years_of_residency);

    // Track raw colors
    primaryCounts[pc][item.primary_colour] = (primaryCounts[pc][item.primary_colour] || 0) + 1;
    secondaryCounts[pc][item.secondary_colour] = (secondaryCounts[pc][item.secondary_colour] || 0) + 1;
    tertiaryCounts[pc][item.tertiary_colour] = (tertiaryCounts[pc][item.tertiary_colour] || 0) + 1;
    
    allColoursSet[pc].add(item.primary_colour);
    allColoursSet[pc].add(item.secondary_colour);
    allColoursSet[pc].add(item.tertiary_colour);
    
    allColoursList[pc].push(item.primary_colour);

    // Track color families
    const pFamily = getColorFamily(item.primary_colour);
    primaryFamilyCounts[pc][pFamily] = (primaryFamilyCounts[pc][pFamily] || 0) + 1;
    
    const sFamily = getColorFamily(item.secondary_colour);
    secondaryFamilyCounts[pc][sFamily] = (secondaryFamilyCounts[pc][sFamily] || 0) + 1;
    
    const tFamily = getColorFamily(item.tertiary_colour);
    tertiaryFamilyCounts[pc][tFamily] = (tertiaryFamilyCounts[pc][tFamily] || 0) + 1;
  });

  Object.values(stats).forEach((s) => {
    s.avgRecognition /= s.responses;
    s.avgPromotion /= s.responses;
    s.avgAge /= s.responses;
    s.avgResidency /= s.responses;
    
    // Determine dominant color families
    const pFamilies = Object.entries(primaryFamilyCounts[s.postcode]).sort((a, b) => b[1] - a[1]);
    const sFamilies = Object.entries(secondaryFamilyCounts[s.postcode]).sort((a, b) => b[1] - a[1]);
    const tFamilies = Object.entries(tertiaryFamilyCounts[s.postcode]).sort((a, b) => b[1] - a[1]);

    const dominantPrimaryFamily = pFamilies[0]?.[0] || 'Grey';
    const dominantSecondaryFamily = sFamilies[0]?.[0] || 'Grey';
    const dominantTertiaryFamily = tFamilies[0]?.[0] || 'Grey';

    s.dominantPrimaryFamily = dominantPrimaryFamily;
    s.dominantSecondaryFamily = dominantSecondaryFamily;
    s.dominantTertiaryFamily = dominantTertiaryFamily;
    s.dominantColorFamily = dominantPrimaryFamily; // For backward compatibility
    
    // Family breakdowns
    const getBreakdown = (counts: Record<string, number>) => {
      const breakdown: Record<string, number> = {};
      Object.entries(counts).forEach(([f, count]) => {
        breakdown[f] = (count / s.responses) * 100;
      });
      return breakdown;
    };
    
    s.primaryFamilyBreakdown = getBreakdown(primaryFamilyCounts[s.postcode]);
    s.secondaryFamilyBreakdown = getBreakdown(secondaryFamilyCounts[s.postcode]);
    s.tertiaryFamilyBreakdown = getBreakdown(tertiaryFamilyCounts[s.postcode]);

    // Representative color
    s.representativeColor = getRepresentativeColor(allColoursList[s.postcode]);

    // Top HEX colors
    s.topHexColors = Object.entries(primaryCounts[s.postcode])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([hex, count]) => ({ hex, count }));
    
    const desc = familyDescriptions[dominantPrimaryFamily] || familyDescriptions['Grey'];
    s.dominantFamilyDescription = {
      title: `Dominant colour family: ${dominantPrimaryFamily}`,
      tones: `Most selected tones are ${desc.tones}`,
      cluster: `Primary colour preferences in this postcode cluster around ${desc.cluster}`,
    };

    s.allColours = Array.from(allColoursSet[s.postcode]);

    // Determine top colors
    const getTop = (counts: Record<string, number>) => 
      Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(c => c[0]);

    s.topPrimaryColours = getTop(primaryCounts[s.postcode]);
    s.topSecondaryColours = getTop(secondaryCounts[s.postcode]);
    s.topTertiaryColours = getTop(tertiaryCounts[s.postcode]);
    
    // Clean up ranges if no data
    if (s.ageRange[0] === Infinity) s.ageRange = [0, 0];
    if (s.residencyRange[0] === Infinity) s.residencyRange = [0, 0];
  });

  return stats;
};

export const getGlobalStats = (data: SurveyResponse[]) => {
  const colourCounts: Record<string, number> = {};
  data.forEach(item => {
    colourCounts[item.primary_colour] = (colourCounts[item.primary_colour] || 0) + 1;
  });

  return Object.entries(colourCounts)
    .map(([hex, count]) => ({ hex, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};
