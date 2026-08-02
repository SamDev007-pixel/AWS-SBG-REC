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
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-4 items-center justify-between">
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
          className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {/* Select Dropdowns */}
      <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-heading">
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block text-xs py-1.5 px-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 font-semibold"
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
