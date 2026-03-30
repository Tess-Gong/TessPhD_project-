import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Tooltip, useMap, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { SuburbStats, ViewMode } from '../../types';

interface CanberraMapProps {
  stats: Record<string, SuburbStats>;
  onSelectSuburb: (postcode: string) => void;
  selectedPostcode: string | null;
  viewMode: ViewMode;
}

// Postcode centroids for Canberra (Approximate for visual effect)
const postcodeCentroids: Record<string, [number, number]> = {
  "2600": [-35.3075, 149.1322],
  "2601": [-35.2809, 149.1300],
  "2602": [-35.2450, 149.1550],
  "2603": [-35.3200, 149.1450],
  "2604": [-35.3350, 149.1550],
  "2605": [-35.3450, 149.1350],
  "2606": [-35.3550, 149.0950],
  "2607": [-35.3650, 149.1150],
  "2609": [-35.3150, 149.1850],
  "2611": [-35.3350, 149.0450],
  "2612": [-35.2650, 149.1450],
  "2614": [-35.2450, 149.0650],
  "2615": [-35.2250, 149.0250],
  "2617": [-35.2150, 149.0650],
  "2900": [-35.4150, 149.0650],
  "2902": [-35.4350, 149.0850],
  "2903": [-35.4450, 149.1050],
  "2904": [-35.4550, 149.1250],
  "2905": [-35.4650, 149.1450],
  "2906": [-35.4750, 149.1650],
  "2618": [-35.1850, 149.0850],
  "2620": [-35.3550, 149.2350],
  "2911": [-35.2050, 149.1450],
  "2912": [-35.1850, 149.1250],
  "2913": [-35.1950, 149.1050],
  "2914": [-35.1750, 149.1550],
};

// Color family mapping to actual hex for display
const familyColors: Record<string, string> = {
  'Red': '#E16038',
  'Orange': '#F27D26',
  'Yellow': '#FAC104',
  'Green': '#03A839',
  'Blue': '#4071E1',
  'Purple': '#A043BA',
  'Pink': '#F06292',
  'Brown': '#795548',
  'Black': '#1a1a1a',
  'White': '#f8f8f8',
  'Grey': '#888888',
};

const MapController = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
};

export const CanberraMap: React.FC<CanberraMapProps> = ({ 
  stats, 
  onSelectSuburb, 
  selectedPostcode,
  viewMode
}) => {
  return (
    <div className="w-full h-full relative bg-[#F8F9FA]">
      {/* Texture Overlay */}
      <div className="absolute inset-0 z-[400] pointer-events-none opacity-[0.05]" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />

      <MapContainer
        center={[-35.3075, 149.1322]}
        zoom={12}
        className="w-full h-full"
        zoomControl={false}
        style={{ background: '#fff' }}
      >
        {/* We use a very light, minimal base map or no base map at all for the artistic look */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          opacity={1}
          className="grayscale contrast-[1.1]"
        />

        {/* Canberra City Label */}
        <Marker 
          position={[-35.2809, 149.1300]} 
          icon={L.divIcon({
            className: 'custom-label',
            html: '<div style="font-family: serif; font-size: 26px; letter-spacing: 0.8em; color: #4d4b4b; text-transform: uppercase; white-space: nowrap; font-weight: 800;">Canberra</div>',
            iconSize: [400, 60],
            iconAnchor: [200, 0]
          })}
          interactive={false}
        />

        {/* Postcode Nodes */}
        {Object.entries(postcodeCentroids).map(([pc, pos]) => {
          const s = stats[pc];
          if (!s) return null;

          const isSelected = selectedPostcode === pc;
          
          // Get dominant family for the selected view mode
          let dominantFamily = 'Grey';
          if (viewMode === 'primary') dominantFamily = s.dominantPrimaryFamily;
          else if (viewMode === 'secondary') dominantFamily = s.dominantSecondaryFamily;
          else if (viewMode === 'tertiary') dominantFamily = s.dominantTertiaryFamily;

          const familyColor = familyColors[dominantFamily] || '#888888';
          const baseRadius = Math.min(800, 300 + s.responses * 5);

          return (
            <React.Fragment key={pc}>
              {/* Catchment Area (Light Glow) */}
              <Circle
                center={pos}
                radius={baseRadius * (isSelected ? 2.5 : 2) + 500}
                pathOptions={{
                  fillColor: familyColor,
                  fillOpacity: isSelected ? 0.15 : 0.08,
                  color: 'transparent',
                  weight: 0,
                }}
                interactive={false}
              />
              
              {/* Core Data Point */}
              <Circle
                center={pos}
                radius={baseRadius * (isSelected ? 1.2 : 0.9)}
                pathOptions={{
                  fillColor: familyColor,
                  fillOpacity: 1,
                  color: '#fff',
                  weight: isSelected ? 2 : 1,
                }}
                eventHandlers={{
                  click: () => onSelectSuburb(pc),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1} sticky>
                <div className="p-3 bg-white border border-black shadow-xl font-mono text-[10px] space-y-2 min-w-[160px]">
                  <div className="border-b border-gray-100 pb-1 flex justify-between items-center">
                    <span className="font-bold">POSTCODE {pc}</span>
                    <span className="opacity-50 uppercase">{viewMode} VIEW</span>
                  </div>
                  <div className="space-y-1">
                    <p className="opacity-50 uppercase text-[8px]">Dominant Family</p>
                    <div className="flex items-center gap-2">
                      <span className="font-bold uppercase">{dominantFamily}</span>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-gray-100">
                    <p className="opacity-50 uppercase text-[8px]">Total Responses</p>
                    <p className="font-bold">{s.responses}</p>
                  </div>
                </div>
              </Tooltip>
            </Circle>
          </React.Fragment>
        );
      })}

        <MapController center={[-35.3075, 149.1322]} />
    </MapContainer>
  </div>
);
};
