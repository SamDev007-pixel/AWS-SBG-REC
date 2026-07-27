import React from 'react';
import { Search } from 'lucide-react';
import { GUIDELINE_COLORS_LIST } from '@/constants/guideline.constants';

interface GuidelineFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export const GuidelineFilters: React.FC<GuidelineFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full md:w-80">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title or description..."
          className="block w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 hover:border-slate-300 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] font-medium transition-all shadow-2xs"
        />
      </div>

      {/* Select Dropdowns */}
      <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block text-xs py-1.5 px-3 border border-slate-200 hover:border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF9900]/15 focus:border-[#FF9900] font-semibold transition-all shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="HIDDEN">Hidden Only</option>
            <option value="PROMINENT">Prominent Alert</option>
          </select>
        </div>
      </div>
    </div>
  );
};
