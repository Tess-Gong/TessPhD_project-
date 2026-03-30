import React from 'react';
import { SuburbStats, ViewMode } from '../../types';

interface MainInsightProps {
  allStats: Record<string, SuburbStats>;
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

export const MainInsight: React.FC<MainInsightProps> = ({ allStats, viewMode }) => {
  const statsArray: SuburbStats[] = Object.values(allStats);
  if (statsArray.length === 0) return null;

  // Calculate overall dominant family
  const familyCounts: Record<string, number> = {};
  let totalResponses = 0;
  let totalRecognition = 0;

  statsArray.forEach(s => {
    const dominant = viewMode === 'primary' 
      ? s.dominantPrimaryFamily 
      : viewMode === 'secondary' 
        ? s.dominantSecondaryFamily 
        : s.dominantTertiaryFamily;
    
    familyCounts[dominant] = (familyCounts[dominant] || 0) + s.responses;
    totalResponses += s.responses;
    totalRecognition += s.avgRecognition * s.responses;
  });

  const sortedFamilies = Object.entries(familyCounts).sort((a, b) => b[1] - a[1]);
  const topFamily = sortedFamilies[0][0];
  const avgRecognition = totalRecognition / totalResponses;

  return (
    <div className="space-y-6">
      <div className="space-y-1 border-b border-black pb-2">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-40">Global Metrics</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] opacity-40">Dominant Trend</p>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: familyColors[topFamily] }} />
            <p className="text-3xl font-serif uppercase tracking-tighter text-black/90">{topFamily}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-[1px] flex-1 bg-black/10" />
            <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest">
              {((sortedFamilies[0][1] / totalResponses) * 100).toFixed(1)}% Frequency
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-2">
          <div className="p-4 border border-black/5 bg-white space-y-1">
            <p className="text-[8px] font-mono uppercase tracking-widest opacity-40">Avg. Recognition</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-light tracking-tighter">{avgRecognition.toFixed(1)}</p>
              <span className="text-[10px] font-mono opacity-30">/ 5.0</span>
            </div>
          </div>
          <div className="p-4 border border-black/5 bg-white space-y-1">
            <p className="text-[8px] font-mono uppercase tracking-widest opacity-40">Total Sample Size</p>
            <p className="text-2xl font-light tracking-tighter">{totalResponses.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
