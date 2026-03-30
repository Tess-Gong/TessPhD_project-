import React from 'react';
import { FilterState, SuburbStats } from '../../types';
import { MainInsight } from '../layout/MainInsight';

interface FilterPanelProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availablePostcodes: string[];
  availableCountries: string[];
  allStats: Record<string, SuburbStats>;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  availablePostcodes,
  availableCountries,
  allStats,
}) => {
  return (
    <div className="bg-[#F5F5F3] p-8 border-b md:border-b-0 md:border-r border-black md:h-full md:overflow-y-auto space-y-12">
      <div className="space-y-2 border-b border-black pb-6">
        <h3 className="text-[11px] font-serif italic uppercase opacity-50 tracking-[0.2em]">Data Control</h3>
        <h2 className="text-4xl font-light tracking-tighter uppercase">Filters</h2>
      </div>

      {/* Main Insight Integrated into Sidebar - Desktop Only */}
      <div className="hidden md:block pb-8 border-b border-black/10">
        <MainInsight allStats={allStats} viewMode={filters.viewMode} />
      </div>

      <div className="space-y-10">
        {/* View Mode Selection */}
        <div className="space-y-4">
          <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">Visualization Mode</label>
          <div className="flex flex-col gap-2">
            {(['primary', 'secondary', 'tertiary'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilters({ ...filters, viewMode: mode })}
                className={`w-full py-3 text-[10px] font-mono uppercase tracking-[0.3em] border transition-all duration-300 ${
                  filters.viewMode === mode 
                    ? 'bg-[#E16038] text-white border-[#E16038] shadow-lg translate-x-1' 
                    : 'bg-white text-black border-black/10 hover:border-black'
                }`}
              >
                {mode} Colour
              </button>
            ))}
          </div>
        </div>

        {/* Postcode */}
        <div className="space-y-3">
          <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">Postcode Cluster</label>
          <select
            className="w-full p-3 bg-white border border-black/10 rounded-none focus:outline-none focus:border-black transition-colors font-mono text-[11px]"
            value={filters.postcode}
            onChange={(e) => setFilters({ ...filters, postcode: e.target.value })}
          >
            <option value="">ALL POSTCODES</option>
            {availablePostcodes.map((pc) => (
              <option key={pc} value={pc}>{pc}</option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">Gender Identity</label>
          <div className="flex flex-wrap gap-2">
            {['Male', 'Female', 'Other'].map((g) => (
              <button
                key={g}
                onClick={() => setFilters({ ...filters, gender: filters.gender === g ? '' : g })}
                className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest border transition-all duration-300 ${
                  filters.gender === g 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-black border-black/10 hover:border-black'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Age Range */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">Age Range</label>
            <span className="text-[11px] font-mono font-bold">{filters.ageRange[0]} - {filters.ageRange[1]}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.ageRange[1]}
            onChange={(e) => setFilters({ ...filters, ageRange: [filters.ageRange[0], parseInt(e.target.value)] })}
            className="w-full accent-[#E16038] h-1 bg-black/10 appearance-none cursor-pointer"
          />
        </div>

        {/* Residency */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">Residency (Y)</label>
            <span className="text-[11px] font-mono font-bold">{filters.residencyRange[0]} - {filters.residencyRange[1]}</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            value={filters.residencyRange[1]}
            onChange={(e) => setFilters({ ...filters, residencyRange: [filters.residencyRange[0], parseInt(e.target.value)] })}
            className="w-full accent-[#E16038] h-1 bg-black/10 appearance-none cursor-pointer"
          />
        </div>

        {/* Country */}
        <div className="space-y-3">
          <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-400">Cultural Background</label>
          <select
            className="w-full p-3 bg-white border border-black/10 rounded-none focus:outline-none focus:border-black transition-colors font-mono text-[11px]"
            value={filters.country}
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          >
            <option value="">ALL COUNTRIES</option>
            {availableCountries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={() => setFilters({ postcode: '', gender: '', ageRange: [0, 100], residencyRange: [0, 50], country: '', viewMode: 'primary' })}
        className="w-full py-4 text-[10px] font-mono uppercase tracking-[0.4em] border border-black hover:bg-black hover:text-white transition-all duration-500"
      >
        Reset Filters
      </button>
    </div>
  );
};
