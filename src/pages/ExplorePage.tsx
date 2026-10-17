import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, SlidersHorizontal, RotateCcw, X, ArrowRight, Gauge, Zap, Globe, CheckCircle2 } from 'lucide-react';
import { TeslaEmblem } from '../components/TeslaBranding';

export const ExplorePage: React.FC = () => {
  const {
    vehicles,
    filteredVehicles,
    filters,
    setFilters,
    resetFilters,
    navigateTo
  } = useApp();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract unique available filter choices directly from the actual vehicle database
  const availableModels = Array.from(new Set(vehicles.map(v => v.model)));
  const availableYears = Array.from(new Set(vehicles.map(v => v.year.toString()))).sort().reverse();
  const availableCountries = Array.from(
    new Set(vehicles.flatMap(v => v.eligibleCountries))
  ).sort();
  const availableStatuses = Array.from(new Set(vehicles.map(v => v.availabilityStatus)));

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const isFiltered =
    filters.search !== '' ||
    filters.model !== 'all' ||
    filters.year !== 'all' ||
    filters.trim !== 'all' ||
    filters.country !== 'all' ||
    filters.availability !== 'all';

  return (
    <div className="min-h-screen bg-[#060607] text-white">
      {/* Editorial Header */}
      <div className="bg-[#090A0C] border-b border-white/[0.08] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3 sm:gap-3.5">
              <TeslaEmblem className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#E82127]">
                ALLOCATION DIRECTORY
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-display">
              Explore Available Vehicles
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Real-time inventory records for verified electric performance allocations. Filter by
              drivetrain, jurisdiction, and model series.
            </p>
          </div>
        </div>
      </div>

      {/* Main Filter & Results Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Top Control Bar: Search + Results Count + Mobile Filter Trigger */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-8 border-b border-zinc-900">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              placeholder="Search by model, trim, drivetrain, or allocation code..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-md text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#E82127] transition-colors"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results count & Action buttons */}
          <div className="flex items-center justify-between md:justify-end gap-4 text-xs">
            <span className="text-zinc-400">
              Showing <strong className="text-white tabular-nums">{filteredVehicles.length}</strong> of{' '}
              <strong className="text-zinc-300 tabular-nums">{vehicles.length}</strong> vehicles
            </span>

            {isFiltered && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-[#E82127] transition-colors font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-xs font-semibold text-zinc-200 hover:bg-zinc-800"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#E82127]" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Desktop Filter Bar */}
        <div className="hidden lg:grid grid-cols-5 gap-4 py-6 border-b border-zinc-900 text-xs">
          {/* Model Filter */}
          <div>
            <label className="block text-zinc-500 uppercase tracking-wider font-semibold mb-1.5">
              Model
            </label>
            <select
              value={filters.model}
              onChange={e => handleFilterChange('model', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white py-2 px-3 rounded focus:outline-none focus:border-[#E82127]"
            >
              <option value="all">All Models</option>
              {availableModels.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Model Year */}
          <div>
            <label className="block text-zinc-500 uppercase tracking-wider font-semibold mb-1.5">
              Model Year
            </label>
            <select
              value={filters.year}
              onChange={e => handleFilterChange('year', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white py-2 px-3 rounded focus:outline-none focus:border-[#E82127]"
            >
              <option value="all">All Years</option>
              {availableYears.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Country Eligibility */}
          <div>
            <label className="block text-zinc-500 uppercase tracking-wider font-semibold mb-1.5">
              Country Eligibility
            </label>
            <select
              value={filters.country}
              onChange={e => handleFilterChange('country', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white py-2 px-3 rounded focus:outline-none focus:border-[#E82127]"
            >
              <option value="all">All Jurisdictions</option>
              {availableCountries.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Status */}
          <div>
            <label className="block text-zinc-500 uppercase tracking-wider font-semibold mb-1.5">
              Availability
            </label>
            <select
              value={filters.availability}
              onChange={e => handleFilterChange('availability', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white py-2 px-3 rounded focus:outline-none focus:border-[#E82127]"
            >
              <option value="all">All Statuses</option>
              {availableStatuses.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Action */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              disabled={!isFiltered}
              className={`w-full py-2 px-3 rounded font-bold uppercase tracking-wider text-xs transition-colors ${
                isFiltered
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700'
                  : 'bg-zinc-950 text-zinc-600 border border-zinc-900 cursor-not-allowed'
              }`}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Mobile Filter Slide-out Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="relative w-full max-w-[88vw] sm:max-w-sm bg-zinc-950 border-l border-zinc-800 p-5 sm:p-6 flex flex-col justify-between z-10 overflow-y-auto h-full">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                  <h3 className="text-base font-bold text-white font-display">Inventory Filters</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1.5">
                      Model
                    </label>
                    <select
                      value={filters.model}
                      onChange={e => handleFilterChange('model', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white py-2.5 px-3 rounded"
                    >
                      <option value="all">All Models</option>
                      {availableModels.map(m => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1.5">
                      Model Year
                    </label>
                    <select
                      value={filters.year}
                      onChange={e => handleFilterChange('year', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white py-2.5 px-3 rounded"
                    >
                      <option value="all">All Years</option>
                      {availableYears.map(y => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1.5">
                      Country Eligibility
                    </label>
                    <select
                      value={filters.country}
                      onChange={e => handleFilterChange('country', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white py-2.5 px-3 rounded"
                    >
                      <option value="all">All Jurisdictions</option>
                      {availableCountries.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 uppercase tracking-wider font-semibold mb-1.5">
                      Availability
                    </label>
                    <select
                      value={filters.availability}
                      onChange={e => handleFilterChange('availability', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white py-2.5 px-3 rounded"
                    >
                      <option value="all">All Statuses</option>
                      {availableStatuses.map(s => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-900 space-y-2">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#E82127] hover:bg-[#b91318] text-white font-bold text-xs uppercase tracking-wider rounded"
                >
                  Apply Filters ({filteredVehicles.length} Matches)
                </button>
                <button
                  onClick={() => {
                    resetFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs rounded border border-zinc-800"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Matching Vehicle Listings: Premium Full-Width Editorial Layout (Anti-Slop, NOT standard cards!) */}
        <div className="pt-8 space-y-12">
          {filteredVehicles.length === 0 ? (
            /* Helpful Empty State */
            <div className="py-20 text-center max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-full bg-black border border-zinc-800 flex items-center justify-center mx-auto p-3 shadow-lg shadow-red-950/20">
                <TeslaEmblem className="w-full h-full" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">No matching vehicles found</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                No vehicles currently match your active search and filter parameters. Try clearing or
                broadening your criteria.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#E82127] hover:bg-[#b91318] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            filteredVehicles.map((vehicle, idx) => (
              <article
                key={vehicle.id}
                className="group relative rounded-xl overflow-hidden bg-zinc-950 border border-white/[0.08] hover:border-zinc-700 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  {/* Left: Large Editorial Image with overlay indicator */}
                  <div className="lg:col-span-7 relative aspect-[16/9] lg:aspect-auto min-h-[200px] sm:min-h-[280px] lg:min-h-[420px] bg-zinc-900 overflow-hidden">
                    <img
                      src={vehicle.images.primary}
                      alt={`${vehicle.year} ${vehicle.model} ${vehicle.trim}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-zinc-950/85 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded text-[11px] sm:text-xs font-bold text-white border border-white/10 max-w-[90%] truncate">
                      {vehicle.availabilityStatus} · {vehicle.unitsRemaining} of {vehicle.unitsAllocatedTotal} Units Left
                    </div>
                  </div>

                  {/* Right: Rich Editorial Content & Specs */}
                  <div className="lg:col-span-5 p-4 sm:p-6 lg:p-10 flex flex-col justify-between space-y-5 sm:space-y-6">
                    <div>
                      {/* Quiet Unboxed Metadata with Typographic Separator */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold">
                        <span>{vehicle.year}</span>
                        <span aria-hidden="true">·</span>
                        <span>{vehicle.colorName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#E82127]">{vehicle.allocationCode}</span>
                      </div>

                      {/* Headline */}
                      <h2 className="text-xl sm:text-3xl font-black text-white font-display tracking-tight">
                        {vehicle.model}
                      </h2>
                      <p className="text-xs sm:text-sm font-medium text-zinc-300 mt-0.5">
                        {vehicle.trim}
                      </p>

                      <p className="text-xs text-zinc-400 mt-3 sm:mt-4 leading-relaxed line-clamp-3">
                        {vehicle.details.overview}
                      </p>

                      {/* Technical Specs Strip */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 pb-3 sm:pb-4 border-y border-zinc-900 mt-4 sm:mt-6 text-xs">
                        <div className="min-w-0">
                          <p className="text-zinc-500 font-medium text-[11px] sm:text-xs truncate">0-60 mph</p>
                          <p className="text-white font-bold text-sm sm:text-base tabular-nums mt-0.5 truncate">
                            {vehicle.specs.acceleration0to60}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-zinc-500 font-medium text-[11px] sm:text-xs truncate">Range</p>
                          <p className="text-white font-bold text-sm sm:text-base tabular-nums mt-0.5 truncate">
                            {vehicle.specs.range.split(' ')[0]} mi
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-zinc-500 font-medium text-[11px] sm:text-xs truncate">Top Speed</p>
                          <p className="text-white font-bold text-sm sm:text-base tabular-nums mt-0.5 truncate">
                            {vehicle.specs.topSpeed}
                          </p>
                        </div>
                      </div>

                      {/* Territory Eligibility */}
                      <div className="pt-3 sm:pt-4 text-[11px] sm:text-xs text-zinc-400 flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">
                          Eligible: {vehicle.eligibleCountries.join(', ')}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Pricing & Action */}
                    <div className="pt-4 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div>
                        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                          <span className="text-xs text-zinc-500 uppercase">Vehicle:</span>
                          <span className="text-sm sm:text-base font-bold text-white">FREE</span>
                          <span className="text-xs text-zinc-500">·</span>
                          <span className="text-[11px] sm:text-xs text-zinc-400">
                            Transport: <strong className="text-zinc-200 tabular-nums">${vehicle.totalMandatoryFeeUSD} USD</strong>
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Disclosed mandatory freight fee</p>
                      </div>

                      <button
                        onClick={() => navigateTo('vehicle-details', vehicle.id)}
                        className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-[#E82127] hover:bg-[#b91318] text-white font-bold text-xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
                      >
                        <span>View Vehicle</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
