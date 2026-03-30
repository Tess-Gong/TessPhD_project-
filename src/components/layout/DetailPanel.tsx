import React from 'react';
import { SuburbStats, ViewMode } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DetailPanelProps {
  stats: SuburbStats | null;
  onClose: () => void;
  viewMode: ViewMode;
}

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

export const DetailPanel: React.FC<DetailPanelProps> = ({ stats, onClose, viewMode }) => {
  if (!stats) return null;

  const ageData = Object.entries(stats.ageBreakdown).map(([age, count]) => ({ age, count }));
  const genderData = Object.entries(stats.genderBreakdown).map(([gender, count]) => ({ gender, count }));
  
  const currentBreakdown = viewMode === 'primary' 
    ? stats.primaryFamilyBreakdown 
    : viewMode === 'secondary' 
      ? stats.secondaryFamilyBreakdown 
      : stats.tertiaryFamilyBreakdown;

  const currentDominantFamily = viewMode === 'primary' 
    ? stats.dominantPrimaryFamily 
    : viewMode === 'secondary' 
      ? stats.dominantSecondaryFamily 
      : stats.dominantTertiaryFamily;

  const familyBreakdown = (Object.entries(currentBreakdown) as [string, number][])
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-[#F5F5F3] p-8 border-l border-black h-full overflow-y-auto space-y-12 shadow-2xl">
      <div className="flex justify-between items-start border-b border-black pb-6">
        <div className="space-y-1">
          <h3 className="text-[11px] font-serif italic uppercase opacity-50 tracking-[0.3em]">Postcode Insight</h3>
          <h2 className="text-5xl font-light tracking-tighter uppercase">{stats.suburbName}</h2>
          <p className="text-[10px] font-mono opacity-40 uppercase tracking-[0.4em]">Cluster {stats.postcode}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-black hover:text-white transition-all duration-300 border border-black/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-px bg-black/10 border border-black/10">
        <div className="bg-[#F5F5F3] p-4 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">Responses</span>
          <p className="text-3xl font-light tracking-tighter">{stats.responses}</p>
        </div>
        <div className="bg-[#F5F5F3] p-4 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">Recognition</span>
          <p className="text-3xl font-light tracking-tighter">{stats.avgRecognition.toFixed(1)}</p>
        </div>
        <div className="bg-[#F5F5F3] p-4 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">Age Mean</span>
          <p className="text-3xl font-light tracking-tighter">{stats.avgAge.toFixed(0)}</p>
        </div>
        <div className="bg-[#F5F5F3] p-4 space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-gray-400">Residency</span>
          <p className="text-3xl font-light tracking-tighter">{stats.avgResidency.toFixed(0)}y</p>
        </div>
      </div>

      {/* Dominant Family */}
      <div className="space-y-6 p-8 border border-black bg-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 -mr-12 -mt-12 rounded-full opacity-10" style={{ backgroundColor: familyColors[currentDominantFamily] }} />
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-serif italic uppercase opacity-50 tracking-[0.2em]">Dominant Family</h4>
          <div className="w-5 h-5 rounded-full border border-black/10 shadow-inner" style={{ backgroundColor: familyColors[currentDominantFamily] || '#ddd' }} />
        </div>
        <p className="text-5xl font-serif uppercase tracking-tighter text-black/90">{currentDominantFamily}</p>
        <div className="h-[1px] w-12 bg-[#E16038]" />
        <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest">HSL Classification Trend</p>
      </div>

      {/* Family Breakdown */}
      <div className="space-y-4">
        <h4 className="text-[11px] font-serif italic uppercase opacity-50 tracking-widest border-b border-gray-100 pb-2">
          {viewMode.toUpperCase()} Colour Family Breakdown
        </h4>
        <div className="space-y-3">
          {familyBreakdown.map(([family, percentage]) => (
            <div key={family} className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2" style={{ backgroundColor: familyColors[family] || '#ddd' }} />
                  <span>{family}</span>
                </div>
                <span>{percentage.toFixed(1)}%</span>
              </div>
              <div className="h-1 bg-gray-100 w-full">
                <div 
                  className="h-full transition-all duration-1000" 
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: familyColors[family] || '#000'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[11px] font-serif italic uppercase opacity-50 tracking-widest border-b border-gray-100 pb-2">Age Distribution</h4>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData}>
              <XAxis dataKey="age" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ border: '1px solid black', borderRadius: '0', fontFamily: 'monospace', fontSize: '10px' }}
                cursor={{ fill: '#f5f5f5' }}
              />
              <Bar dataKey="count" fill="#000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[11px] font-serif italic uppercase opacity-50 tracking-widest border-b border-gray-100 pb-2">Gender Breakdown</h4>
        <div className="space-y-3">
          {genderData.map((g) => (
            <div key={g.gender} className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span>{g.gender}</span>
                <span>{((Number(g.count) / Number(stats.responses)) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-1 bg-gray-100 w-full">
                <div 
                  className="h-full bg-black transition-all duration-1000" 
                  style={{ width: `${(Number(g.count) / Number(stats.responses)) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dominant Vibe Description */}
      <div className="p-8 space-y-4 border-b border-black bg-black text-white">
        <h3 className="text-[10px] font-mono uppercase tracking-widest opacity-50">Dominant Vibe</h3>
        <div className="space-y-2">
          <p className="text-2xl font-light leading-tight tracking-tight uppercase">Dominant colour family: {currentDominantFamily}</p>
          <p className="text-sm font-light opacity-70 italic">
            The {viewMode} colour preferences in this postcode cluster around {currentDominantFamily.toLowerCase()} tones.
          </p>
          <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest pt-2">
            {viewMode} selection trend
          </p>
        </div>
      </div>

      {/* All Selected Colours */}
      <div className="p-8 space-y-4 border-b border-black">
        <h3 className="text-[10px] font-mono uppercase tracking-widest opacity-50">All Postcode Colours</h3>
        <div className="grid grid-cols-8 gap-1">
          {stats.allColours.map((c, i) => (
            <div key={i} className="aspect-square w-full border border-black/5" style={{ backgroundColor: c }} title={c} />
          ))}
        </div>
        <p className="text-[9px] font-mono opacity-40 uppercase tracking-tighter pt-2 border-t border-black/5">
          {stats.allColours.length} unique colours identified in this postcode cluster
        </p>
      </div>
    </div>
  );
};
