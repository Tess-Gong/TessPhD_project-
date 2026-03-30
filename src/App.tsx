import React, { useState, useEffect, useMemo } from 'react';
import { SurveyResponse, FilterState, SuburbStats } from './types';
import { parseSurveyData, filterData, getSuburbStats, getGlobalStats } from './utils/dataHelpers';
import { FilterPanel } from './components/filters/FilterPanel';
import { CanberraMap } from './components/map/CanberraMap';
import { DetailPanel } from './components/layout/DetailPanel';
import { MainInsight } from './components/layout/MainInsight';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [rawData, setRawData] = useState<SurveyResponse[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    postcode: '',
    gender: '',
    ageRange: [0, 100],
    residencyRange: [0, 50],
    country: '',
    viewMode: 'primary',
  });
  const [selectedPostcode, setSelectedPostcode] = useState<string | null>(null);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/survey_data.csv`)
      .then((res) => res.text())
      .then((csv) => {
        const data = parseSurveyData(csv);
        setRawData(data);
      });
  }, []);

  const filteredData = useMemo(() => filterData(rawData, filters), [rawData, filters]);
  const suburbStats = useMemo(() => getSuburbStats(filteredData), [filteredData]);
  const globalColours = useMemo(() => getGlobalStats(filteredData), [filteredData]);

  const availablePostcodes = useMemo(() => Array.from(new Set(rawData.map(d => d.canberra_postcode.toString()))).sort(), [rawData]);
  const availableCountries = useMemo(() => Array.from(new Set(rawData.map(d => d.country_background))).sort(), [rawData]);

  const handleSelectSuburb = (pc: string) => {
    setSelectedPostcode(pc);
  };

  if (showLanding) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex flex-col items-center justify-center p-8 text-center space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-3xl space-y-6"
        >
          <h3 className="text-[14px] font-serif italic uppercase opacity-50 tracking-[0.2em]">City Branding Perception</h3>
          <h1 className="text-[12vw] font-light leading-[0.85] tracking-tight uppercase">Canberra</h1>
          <p className="text-xl font-light leading-relaxed max-w-xl mx-auto opacity-70">
            Exploring how residents perceive the visual identity of Australia's capital through data, colour, and geography.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => setShowLanding(false)}
          className="group relative px-12 py-6 border border-black overflow-hidden"
        >
          <span className="relative z-10 text-[11px] font-mono uppercase tracking-[0.3em] group-hover:text-white transition-colors duration-500">
            Enter Interactive Map
          </span>
          <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
        </motion.button>

        <div className="fixed bottom-8 left-8 text-[10px] font-mono uppercase tracking-widest opacity-30">
          Source: Canberra City Branding Survey 2026
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Navbar */}
      <nav className="h-16 border-b border-black flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-light tracking-tight uppercase">Canberra Branding</h2>
          <div className="h-4 w-[1px] bg-black opacity-20" />
          <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Interactive Map</span>
        </div>
        <div className="flex gap-8 text-[10px] font-mono uppercase tracking-widest">
          <button onClick={() => setShowLanding(true)} className="hover:opacity-50 transition-opacity">Home</button>
          <button className="hover:opacity-50 transition-opacity">Insights</button>
          <button className="hover:opacity-50 transition-opacity">About</button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Filters */}
        <aside className="w-64 shrink-0 border-r border-black">
          <FilterPanel 
            filters={filters} 
            setFilters={setFilters} 
            availablePostcodes={availablePostcodes}
            availableCountries={availableCountries}
            allStats={suburbStats}
          />
        </aside>

        {/* Main Map Area */}
        <main className="flex-1 relative">
          <CanberraMap 
            stats={suburbStats} 
            onSelectSuburb={handleSelectSuburb} 
            selectedPostcode={selectedPostcode}
            viewMode={filters.viewMode}
          />
        </main>

        {/* Detail Panel (Right) */}
        <AnimatePresence>
          {selectedPostcode && (
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-64 shrink-0 z-[2000] absolute right-0 top-16 bottom-0"
            >
              <DetailPanel 
                stats={suburbStats[selectedPostcode]} 
                onClose={() => setSelectedPostcode(null)} 
                viewMode={filters.viewMode}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
