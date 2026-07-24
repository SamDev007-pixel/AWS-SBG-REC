'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateEvent } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  FileText,
  GripVertical,
  Users,
  Check,
  Pencil,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Clock,
  MapPin,
  Calendar,
  Globe,
  Laptop,
  Video,
  Network,
  Layers,
} from 'lucide-react';
import type {
  CreateEventDto,
  CreateAgendaDto,
  CreateSpeakerDto,
  CreateFormFieldDto,
  EventMode,
  FieldType,
} from '@/lib/types';

interface AgendaItem extends CreateAgendaDto {
  _key: string;
}

interface SpeakerItem extends CreateSpeakerDto {
  _key: string;
}

interface FormFieldItem extends CreateFormFieldDto {
  _key: string;
  optionsList: string[];
}

const STEPS = ['Basic Info', 'Agenda', 'Speakers', 'Form Builder'];

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'TEXT', label: 'Text' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'DROPDOWN', label: 'Dropdown' },
  { value: 'RADIO', label: 'Radio' },
  { value: 'CHECKBOX', label: 'Checkbox' },
  { value: 'TEXTAREA', label: 'Textarea' },
];

let keyCounter = 0;
function nextKey(): string {
  return `k-${++keyCounter}-${Date.now()}`;
}

function PosterImageInput({
  formData,
  setFormData,
}: {
  formData: CreateEventDto;
  setFormData: (data: CreateEventDto) => void;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Default newly uploaded image to position 50%
        setFormData({ ...formData, posterImage: (reader.result as string) + '#pos=50' });
      };
      reader.readAsDataURL(file);
    }
  };

  // Extract vertical position and actual image source url
  const imgData = formData.posterImage || '';
  let src = imgData;
  let posVal = 50; // default to center
  const hashIdx = imgData.lastIndexOf('#pos=');
  if (hashIdx !== -1) {
    src = imgData.substring(0, hashIdx);
    const posParsed = parseInt(imgData.substring(hashIdx + 5), 10);
    if (!isNaN(posParsed)) {
      posVal = posParsed;
    }
  }

  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPos = e.target.value;
    const cleanSrc = formData.posterImage ? (formData.posterImage.lastIndexOf('#pos=') !== -1 ? formData.posterImage.split('#pos=')[0] : formData.posterImage) : '';
    setFormData({ ...formData, posterImage: cleanSrc + `#pos=${newPos}` });
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide pl-0.5">Poster Image</label>

      {!formData.posterImage ? (
        <div className="w-full">
          <label className="border-2 border-dashed border-slate-200 hover:border-[#FF9900] hover:bg-[#FF9900]/5 rounded-[8px] p-6 text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[120px] bg-slate-50/50">
            <Upload className="h-6 w-6 text-slate-400 mb-2" />
            <span className="text-sm text-slate-600 font-bold">Select Image file</span>
            <span className="text-[11.5px] text-slate-450 mt-1.5">
              PNG, JPG up to 5MB (Converts to Base64)
            </span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
          </label>
        </div>
      ) : (
        <div className="space-y-4 w-full bg-slate-55/40 border border-slate-200 rounded-[8px] p-4.5">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <div className="min-w-0">
              <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                Focal Point Settings
              </p>
              <p className="text-[11.5px] text-slate-550 truncate mt-0.5">
                {src.startsWith('data:') ? 'Local Uploaded Image' : src}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, posterImage: '' })}
              className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 rounded-[6px] px-2.5 py-1.5 transition-colors cursor-pointer animate-in fade-in duration-200"
            >
              Clear Image
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Live Crop Card Preview */}
            <div className="md:col-span-8 space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">
                Grid Card Display Preview
              </label>
              <div className="h-44 w-full relative bg-slate-900 overflow-hidden border border-slate-200/80 rounded-[8px] shadow-sm">
                <img
                  src={src}
                  alt="Poster alignment preview"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: `50% ${posVal}%` }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 flex items-end">
                  <span className="text-[11px] font-bold text-white/90 drop-shadow-sm bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded">
                    Focal position: {posVal}%
                  </span>
                </div>
              </div>
            </div>

            {/* Adjustment Slider */}
            <div className="md:col-span-4 space-y-3.5 bg-slate-50/50 border border-slate-200/60 rounded-[8px] p-4 flex flex-col justify-center">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    Align Position
                  </label>
                  <span className="text-xs font-semibold text-[#FF9900]">
                    {posVal}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal font-normal">
                  Adjust vertical framing (0% Top to 100% Bottom)
                </p>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={posVal}
                  onChange={handlePositionChange}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF9900] focus:outline-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF9900] [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF9900] [&::-moz-range-thumb]:border-0"
                />
                <div className="flex justify-between text-[10px] font-medium text-slate-400 px-0.5">
                  <span>Top</span>
                  <span>Center</span>
                  <span>Bottom</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BasicInfoStep({
  formData,
  setFormData,
  errors,
}: {
  formData: CreateEventDto;
  setFormData: (data: CreateEventDto) => void;
  errors: Record<string, string>;
}) {
  const [title, setTitle] = useState(formData.title || '');
  const [shortDesc, setShortDesc] = useState(formData.shortDescription || '');
  const [description, setDescription] = useState(formData.description || '');
  const [venue, setVenue] = useState(formData.venue || '');
  const [capacity, setCapacity] = useState(formData.capacity ?? '');
  const [date, setDate] = useState(formData.date || '');
  const [time, setTime] = useState(formData.time || '');
  const [deadline, setDeadline] = useState(formData.registrationDeadline || '');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const PREDEFINED_CATEGORIES = ['Workshop', 'Bootcamp', 'AI/ML', 'DevOps'];

  useEffect(() => {
    if (formData.category) {
      if (!PREDEFINED_CATEGORIES.includes(formData.category)) {
        setShowCustomInput(true);
        setCustomCategory(formData.category);
      } else {
        setShowCustomInput(false);
        setCustomCategory('');
      }
    }
  }, [formData.category]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Refs to avoid stale closures in setTimeout
  const formDataRef = useRef(formData);
  const setFormDataRef = useRef(setFormData);

  useEffect(() => {
    formDataRef.current = formData;
    setFormDataRef.current = setFormData;
  }, [formData, setFormData]);

  // Track timers for debounce
  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  const triggerChange = (field: keyof CreateEventDto, value: any) => {
    if (timers.current[field]) {
      clearTimeout(timers.current[field]);
    }
    timers.current[field] = setTimeout(() => {
      setFormDataRef.current({ ...formDataRef.current, [field]: value });
    }, 150);
  };

  const handleBlur = (field: keyof CreateEventDto, value: any) => {
    if (timers.current[field]) {
      clearTimeout(timers.current[field]);
    }
    setFormDataRef.current({ ...formDataRef.current, [field]: value });
  };


  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide pl-0.5 mb-1.5">
          Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            triggerChange('title', e.target.value);
          }}
          onBlur={() => handleBlur('title', title)}
          placeholder="Event title"
          className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400"
        />
        {errors.title && <p className="text-[10px] text-rose-500 mt-1.5">{errors.title}</p>}
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide pl-0.5 mb-1.5">Short Description</label>
        <input
          type="text"
          value={shortDesc}
          onChange={(e) => {
            setShortDesc(e.target.value);
            triggerChange('shortDescription', e.target.value);
          }}
          onBlur={() => handleBlur('shortDescription', shortDesc)}
          placeholder="Brief description (shown in cards)"
          className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Full Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide pl-0.5 mb-1.5">Full Description</label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            triggerChange('description', e.target.value);
          }}
          onBlur={() => handleBlur('description', description)}
          placeholder="Detailed event description..."
          className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400 resize-none"
        />
      </div>

      {/* Category & Venue row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide pl-0.5 mb-1.5">Quick Select</label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-700 cursor-pointer text-left"
            >
              <span>
                {formData.category || 'Select category'}
              </span>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="absolute left-0 mt-1 w-full bg-white border border-slate-200 rounded-[8px] shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150 max-h-52 overflow-y-auto premium-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, category: '' });
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-sm transition-colors duration-150 cursor-pointer ${
                    !formData.category ? 'bg-[#FF9900]/5 text-[#FF9900] font-medium' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Select category
                </button>
                {PREDEFINED_CATEGORIES.map((cat) => {
                  const isSelected = formData.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, category: cat });
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-sm transition-colors duration-150 cursor-pointer ${
                        isSelected ? 'bg-[#FF9900]/5 text-[#FF9900] font-medium' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide pl-0.5 mb-1.5">Category <span className="text-rose-500">*</span></label>
          <input
            type="text"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Enter category..."
            className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400"
          />
          {errors.category && <p className="text-[10px] text-rose-500 mt-1.5">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide pl-0.5 mb-1.5">Venue</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => {
              setVenue(e.target.value);
              triggerChange('venue', e.target.value);
            }}
            onBlur={() => handleBlur('venue', venue)}
            placeholder="Event venue"
            className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Mode */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide pl-0.5 mb-2">Mode <span className="text-rose-500">*</span></label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['ONLINE', 'OFFLINE', 'HYBRID'] as EventMode[]).map((m) => {
            const config = {
              ONLINE: { label: 'Online', desc: 'Virtual livestream', icon: <Laptop size={22} className={formData.mode === 'ONLINE' ? 'text-[#FF9900]' : 'text-slate-400'} /> },
              OFFLINE: { label: 'Offline', desc: 'In-person venue', icon: <MapPin size={22} className={formData.mode === 'OFFLINE' ? 'text-[#FF9900]' : 'text-slate-400'} /> },
              HYBRID: { label: 'Hybrid', desc: 'Mixed attendance', icon: <Users size={22} className={formData.mode === 'HYBRID' ? 'text-[#FF9900]' : 'text-slate-400'} /> },
            }[m];
            return (
              <label
                key={m}
                className={cn(
                  "flex items-start gap-3 border rounded-[8px] p-4 cursor-pointer transition-all duration-200 select-none",
                  formData.mode === m
                    ? "border-[#FF9900] bg-[#FF9900]/5 text-[#FF9900]"
                    : "border-slate-200 text-slate-700 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                )}
              >
                <input
                  type="radio"
                  name="mode"
                  value={m}
                  checked={formData.mode === m}
                  onChange={() => setFormData({ ...formData, mode: m })}
                  className="sr-only"
                />
                <div className={cn(
                  "p-2.5 rounded-[8px] shrink-0 transition-all duration-200 border",
                  formData.mode === m ? "bg-[#FF9900]/10 border-transparent" : "bg-white border-slate-100"
                )}>
                  {config.icon}
                </div>
                <div className="flex flex-col text-left gap-0.5 font-sans">
                  <span className={cn(
                    "text-[14.5px] tracking-tight leading-tight transition-all duration-200",
                    formData.mode === m 
                      ? "font-semibold text-[#FF9900]" 
                      : "font-medium text-slate-600/90"
                  )}>{config.label}</span>
                  <span className="text-[11.5px] text-slate-400 font-normal leading-normal">{config.desc}</span>
                </div>
              </label>
            );
          })}
        </div>
        {errors.mode && <p className="text-[10px] text-rose-500 mt-1.5">{errors.mode}</p>}
      </div>

      {/* Capacity */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide pl-0.5 mb-1.5">Capacity</label>
        <input
          type="number"
          min={0}
          value={capacity}
          onChange={(e) => {
            const num = e.target.value ? Number(e.target.value) : undefined;
            setCapacity(e.target.value ? Number(e.target.value) : '');
            triggerChange('capacity', num);
          }}
          onBlur={() => handleBlur('capacity', capacity === '' ? undefined : Number(capacity))}
          placeholder="Max attendees"
          className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Date, Time, Registration Deadline */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide pl-0.5 mb-1.5">Date <span className="text-rose-500">*</span></label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                triggerChange('date', e.target.value);
              }}
              onBlur={() => handleBlur('date', date)}
              className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-700 cursor-pointer"
            />
          </div>
          {errors.date && <p className="text-[10px] text-rose-500 mt-1.5">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide pl-0.5 mb-1.5">Time <span className="text-rose-500">*</span></label>
          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              triggerChange('time', e.target.value);
            }}
            onBlur={() => handleBlur('time', time)}
            className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-700 cursor-pointer"
          />
          {errors.time && <p className="text-[10px] text-rose-500 mt-1.5">{errors.time}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide pl-0.5 mb-1.5">
            Registration Deadline
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => {
              setDeadline(e.target.value);
              triggerChange('registrationDeadline', e.target.value);
            }}
            onBlur={() => handleBlur('registrationDeadline', deadline)}
            className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-700 cursor-pointer"
          />
        </div>
      </div>

      {/* Poster Image Choice */}
      <PosterImageInput formData={formData} setFormData={setFormData} />
    </div>
  );
}

function AgendaStep({
  agenda,
  setAgenda,
}: {
  agenda: AgendaItem[];
  setAgenda: (items: AgendaItem[]) => void;
}) {
  function addItem() {
    setAgenda([
      ...agenda,
      {
        _key: nextKey(),
        title: '',
        speaker: '',
        startTime: '',
        endTime: '',
      },
    ]);
  }

  function removeItem(key: string) {
    setAgenda(agenda.filter((item) => item._key !== key));
  }

  function updateItem(key: string, field: keyof CreateAgendaDto, value: string) {
    setAgenda(agenda.map((item) => (item._key === key ? { ...item, [field]: value } : item)));
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= agenda.length) return;
    const updated = [...agenda];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setAgenda(updated);
  }

  return (
    <div className="space-y-4">
      {agenda.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-10 px-4 border border-dashed border-slate-200 rounded-[12px] bg-slate-50/30 hover:bg-slate-50/60 transition-colors duration-200 min-h-[190px]">
          <div className="p-3 bg-slate-100/60 rounded-full mb-3 shadow-inner">
            <FileText className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-[13.5px] font-bold text-slate-700 mb-1">No Agenda Items</p>
          <p className="text-[11.5px] text-slate-400 mb-4 max-w-[280px] leading-relaxed">
            Create and organize the schedule for your event. Add your first session to get started.
          </p>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-1.5 bg-[#FF9900] hover:bg-[#FF9900]/90 active:scale-[0.97] hover:scale-[1.03] text-white rounded-[8px] text-xs font-semibold px-4 py-2.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </button>
        </div>
      )}

      {agenda.map((item, index) => (
        <div
          key={item._key}
          className="border border-slate-200 rounded-[10px] p-4 space-y-3 bg-white hover:border-slate-300 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-[6px]">
                Session #{index + 1}
              </span>
              <div className="flex gap-0.5">
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === agenda.length - 1}
                  className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <button
              onClick={() => removeItem(item._key)}
              className="p-1.5 rounded-[8px] text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">Title</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(item._key, 'title', e.target.value)}
                placeholder="Session title"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">Speaker</label>
              <input
                type="text"
                value={item.speaker || ''}
                onChange={(e) => updateItem(item._key, 'speaker', e.target.value)}
                placeholder="Speaker name"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={item.startTime}
                onChange={(e) => updateItem(item._key, 'startTime', e.target.value)}
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-700 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">End Time</label>
              <input
                type="time"
                value={item.endTime}
                onChange={(e) => updateItem(item._key, 'endTime', e.target.value)}
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-700 cursor-pointer"
              />
            </div>
          </div>
        </div>
      ))}

      {agenda.length > 0 && (
        <button
          onClick={addItem}
          className="inline-flex items-center justify-center gap-1.5 border border-dashed border-slate-300 hover:border-[#FF9900] rounded-[8px] text-xs font-semibold px-4 py-3 text-slate-600 hover:text-[#FF9900] hover:bg-[#FF9900]/5 transition-all duration-200 w-full"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Another Item
        </button>
      )}
    </div>
  );
}

function SpeakersStep({
  speakers,
  setSpeakers,
}: {
  speakers: SpeakerItem[];
  setSpeakers: (items: SpeakerItem[]) => void;
}) {
  function addItem() {
    setSpeakers([
      ...speakers,
      {
        _key: nextKey(),
        name: '',
        role: '',
        organization: '',
        bio: '',
        photo: '',
      },
    ]);
  }

  function removeItem(key: string) {
    setSpeakers(speakers.filter((item) => item._key !== key));
  }

  function updateItem(key: string, field: keyof CreateSpeakerDto, value: string) {
    setSpeakers(speakers.map((item) => (item._key === key ? { ...item, [field]: value } : item)));
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= speakers.length) return;
    const updated = [...speakers];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSpeakers(updated);
  }

  return (
    <div className="space-y-4">
      {speakers.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-10 px-4 border border-dashed border-slate-200 rounded-[12px] bg-slate-50/30 hover:bg-slate-50/60 transition-colors duration-200 min-h-[190px]">
          <div className="p-3 bg-slate-100/60 rounded-full mb-3 shadow-inner">
            <Users className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-[13.5px] font-bold text-slate-700 mb-1">No Speakers Added</p>
          <p className="text-[11.5px] text-slate-400 mb-4 max-w-[280px] leading-relaxed">
            Highlight the speakers or hosts for this event. Add your first speaker to get started.
          </p>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-1.5 bg-[#FF9900] hover:bg-[#FF9900]/90 active:scale-[0.97] hover:scale-[1.03] text-white rounded-[8px] text-xs font-semibold px-4 py-2.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Speaker
          </button>
        </div>
      )}

      {speakers.map((item, index) => (
        <div
          key={item._key}
          className="border border-slate-200 rounded-[10px] p-4 space-y-3 bg-white hover:border-slate-300 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-[6px]">
                Speaker #{index + 1}
              </span>
              <div className="flex gap-0.5">
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === speakers.length - 1}
                  className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <button
              onClick={() => removeItem(item._key)}
              className="p-1.5 rounded-[8px] text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">Name</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item._key, 'name', e.target.value)}
                placeholder="Speaker name"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">Role</label>
              <input
                type="text"
                value={item.role || ''}
                onChange={(e) => updateItem(item._key, 'role', e.target.value)}
                placeholder="e.g. Keynote Speaker"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">
                Organization
              </label>
              <input
                type="text"
                value={item.organization || ''}
                onChange={(e) => updateItem(item._key, 'organization', e.target.value)}
                placeholder="Company or institution"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={item.linkedinUrl || ''}
                onChange={(e) => updateItem(item._key, 'linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">Bio</label>
              <textarea
                rows={3}
                value={item.bio || ''}
                onChange={(e) => updateItem(item._key, 'bio', e.target.value)}
                placeholder="Speaker biography..."
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400 resize-none"
              />
            </div>
            <div className="sm:col-span-2">
               <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">Photo</label>
               {item.photo ? (
                 <div className="border border-slate-200 rounded-[10px] p-2 flex items-center gap-3 min-h-[96px] bg-slate-50/50">
                   <div className="h-16 w-16 rounded-full overflow-hidden border border-slate-200/80 bg-slate-100 flex-shrink-0">
                     <img src={item.photo} alt="Speaker preview" className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-xs font-semibold text-slate-600 truncate">Speaker Photo Uploaded</p>
                     <button
                       type="button"
                       onClick={() => updateItem(item._key, 'photo', '')}
                       className="text-[11px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/50 border border-rose-100 rounded-[4px] px-2 py-1 mt-1 transition-colors cursor-pointer"
                     >
                       Remove Photo
                     </button>
                   </div>
                 </div>
               ) : (
                 <label className="border-2 border-dashed border-slate-200 hover:border-[#FF9900] hover:bg-[#FF9900]/5 rounded-[10px] p-4 text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[96px] bg-slate-50 relative">
                   <Upload className="h-6 w-6 text-slate-400 mb-1.5" />
                   <p className="text-xs text-slate-500 font-medium">Click to upload photo</p>
                   <p className="text-[9px] text-slate-400 mt-0.5">PNG, JPG up to 2MB</p>
                   <input
                     type="file"
                     accept="image/*"
                     onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                         const reader = new FileReader();
                         reader.onloadend = () => {
                           updateItem(item._key, 'photo', reader.result as string);
                         };
                         reader.readAsDataURL(file);
                       }
                     }}
                     className="sr-only"
                   />
                 </label>
               )}
            </div>
          </div>
        </div>
      ))}

      {speakers.length > 0 && (
        <button
          onClick={addItem}
          className="inline-flex items-center justify-center gap-1.5 border border-dashed border-slate-300 hover:border-[#FF9900] rounded-[8px] text-xs font-semibold px-4 py-3 text-slate-600 hover:text-[#FF9900] hover:bg-[#FF9900]/5 transition-all duration-200 w-full"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Another Speaker
        </button>
      )}
    </div>
  );
}

function FormBuilderStep({
  fields,
  setFields,
  registrationFormType,
  setRegistrationFormType,
  baseFieldsConfig,
  setBaseFieldsConfig,
}: {
  fields: FormFieldItem[];
  setFields: (items: FormFieldItem[]) => void;
  registrationFormType: 'DEFAULT' | 'CUSTOM';
  setRegistrationFormType: (type: 'DEFAULT' | 'CUSTOM') => void;
  baseFieldsConfig: {
    nameRequired: boolean;
    rollNumberRequired: boolean;
    emailRequired: boolean;
    departmentRequired: boolean;
  };
  setBaseFieldsConfig: (config: any) => void;
}) {
  function addField() {
    setFields([
      ...fields,
      {
        _key: nextKey(),
        label: '',
        type: 'TEXT',
        isRequired: false,
        fieldOrder: fields.length + 1,
        optionsList: [],
      },
    ]);
  }

  function removeField(key: string) {
    setFields(fields.filter((f) => f._key !== key));
  }

  function updateField(key: string, updates: Partial<FormFieldItem>) {
    setFields(fields.map((f) => (f._key === key ? { ...f, ...updates } : f)));
  }

  function moveField(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const updated = [...fields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated.forEach((f, i) => (f.fieldOrder = i + 1));
    setFields(updated);
  }

  function addOption(fieldKey: string) {
    const field = fields.find((f) => f._key === fieldKey);
    if (!field) return;
    updateField(fieldKey, {
      optionsList: [...(field.optionsList || []), ''],
    });
  }

  function updateOption(fieldKey: string, optIndex: number, value: string) {
    const field = fields.find((f) => f._key === fieldKey);
    if (!field) return;
    const opts = [...(field.optionsList || [])];
    opts[optIndex] = value;
    updateField(fieldKey, { optionsList: opts });
  }

  function removeOption(fieldKey: string, optIndex: number) {
    const field = fields.find((f) => f._key === fieldKey);
    if (!field) return;
    updateField(fieldKey, {
      optionsList: (field.optionsList || []).filter((_, i) => i !== optIndex),
    });
  }

  const hasOptions = (type: FieldType) =>
    type === 'DROPDOWN' || type === 'RADIO' || type === 'CHECKBOX';

  return (
    <div className="space-y-6">
      {/* Registration Form Type Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-555 uppercase tracking-wider mb-3 pl-0.5">
          Registration Form Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label
            className={`flex flex-col p-4 border rounded-[12px] cursor-pointer transition-all duration-200 relative hover:border-[#FF9900]/40 ${
              registrationFormType === 'DEFAULT'
                ? 'border-[#FF9900]/40 bg-[#FF9900]/2'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700">Default Form</span>
              <input
                type="radio"
                name="registrationFormType"
                value="DEFAULT"
                checked={registrationFormType === 'DEFAULT'}
                onChange={() => setRegistrationFormType('DEFAULT')}
                className="sr-only"
              />
              <div className={cn(
                "w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0",
                registrationFormType === 'DEFAULT'
                  ? "border-[#FF9900] bg-white"
                  : "border-slate-300 bg-white"
              )}>
                {registrationFormType === 'DEFAULT' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Standard registration with mandatory fields: Name, Roll Number, Email, and Department.
            </p>
          </label>

          <label
            className={`flex flex-col p-4 border rounded-[12px] cursor-pointer transition-all duration-200 relative hover:border-[#FF9900]/40 ${
              registrationFormType === 'CUSTOM'
                ? 'border-[#FF9900]/40 bg-[#FF9900]/2'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700">Custom Form</span>
              <input
                type="radio"
                name="registrationFormType"
                value="CUSTOM"
                checked={registrationFormType === 'CUSTOM'}
                onChange={() => setRegistrationFormType('CUSTOM')}
                className="sr-only"
              />
              <div className={cn(
                "w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 shrink-0",
                registrationFormType === 'CUSTOM'
                  ? "border-[#FF9900] bg-white"
                  : "border-slate-300 bg-white"
              )}>
                {registrationFormType === 'CUSTOM' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF9900]" />
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Include the 4 mandatory fields plus add, edit, and reorder additional custom fields.
            </p>
          </label>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        {registrationFormType === 'DEFAULT' ? (
          <div>
            <h3 className="text-xs font-semibold text-slate-555 uppercase tracking-wider mb-3 pl-0.5">Form Fields Preview</h3>
            <div className="space-y-3 bg-slate-50/50 border border-slate-200 rounded-[12px] p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="opacity-75">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">Name *</label>
                  <input
                    type="text"
                    disabled
                    placeholder="John Doe"
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 bg-slate-100/50 cursor-not-allowed text-slate-400"
                  />
                </div>
                <div className="opacity-75">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="22XX1234"
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 bg-slate-100/50 cursor-not-allowed text-slate-400"
                  />
                </div>
                <div className="opacity-75">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">Email *</label>
                  <input
                    type="email"
                    disabled
                    placeholder="john@example.com"
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 bg-slate-100/50 cursor-not-allowed text-slate-400"
                  />
                </div>
                <div className="opacity-75">
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">
                    Department *
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="Computer Science"
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 bg-slate-100/50 cursor-not-allowed text-slate-400"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 pl-0.5">
                * These fields are system-mandatory and cannot be deleted, renamed, or reordered.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-slate-555 uppercase tracking-wider mb-2.5 pl-0.5">Base Form Fields Requirements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Name */}
                <label className={cn(
                  "flex items-center gap-3 cursor-pointer select-none border rounded-[8px] p-3 transition duration-200",
                  baseFieldsConfig.nameRequired
                    ? "bg-[#FF9900]/5 border-[#FF9900]/30 hover:bg-[#FF9900]/10"
                    : "bg-white border-slate-200 hover:bg-slate-50/50"
                )}>
                  <input
                    type="checkbox"
                    checked={baseFieldsConfig.nameRequired}
                    onChange={(e) => setBaseFieldsConfig({ ...baseFieldsConfig, nameRequired: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-200 shrink-0",
                    baseFieldsConfig.nameRequired
                      ? "bg-[#FF9900] border-[#FF9900] text-white"
                      : "border-slate-300 bg-white"
                  )}>
                    {baseFieldsConfig.nameRequired && <Check className="w-3 h-3 stroke-[3.5]" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-600">Name</span>
                    <span className="text-[10px] text-slate-400 font-normal">{baseFieldsConfig.nameRequired ? 'Required' : 'Optional'}</span>
                  </div>
                </label>
                {/* Roll Number */}
                <label className={cn(
                  "flex items-center gap-3 cursor-pointer select-none border rounded-[8px] p-3 transition duration-200",
                  baseFieldsConfig.rollNumberRequired
                    ? "bg-[#FF9900]/5 border-[#FF9900]/30 hover:bg-[#FF9900]/10"
                    : "bg-white border-slate-200 hover:bg-slate-50/50"
                )}>
                  <input
                    type="checkbox"
                    checked={baseFieldsConfig.rollNumberRequired}
                    onChange={(e) => setBaseFieldsConfig({ ...baseFieldsConfig, rollNumberRequired: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-200 shrink-0",
                    baseFieldsConfig.rollNumberRequired
                      ? "bg-[#FF9900] border-[#FF9900] text-white"
                      : "border-slate-300 bg-white"
                  )}>
                    {baseFieldsConfig.rollNumberRequired && <Check className="w-3 h-3 stroke-[3.5]" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-600">Roll Number</span>
                    <span className="text-[10px] text-slate-400 font-normal">{baseFieldsConfig.rollNumberRequired ? 'Required' : 'Optional'}</span>
                  </div>
                </label>
                {/* Email */}
                <label className={cn(
                  "flex items-center gap-3 cursor-pointer select-none border rounded-[8px] p-3 transition duration-200",
                  baseFieldsConfig.emailRequired
                    ? "bg-[#FF9900]/5 border-[#FF9900]/30 hover:bg-[#FF9900]/10"
                    : "bg-white border-slate-200 hover:bg-slate-50/50"
                )}>
                  <input
                    type="checkbox"
                    checked={baseFieldsConfig.emailRequired}
                    onChange={(e) => setBaseFieldsConfig({ ...baseFieldsConfig, emailRequired: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-200 shrink-0",
                    baseFieldsConfig.emailRequired
                      ? "bg-[#FF9900] border-[#FF9900] text-white"
                      : "border-slate-300 bg-white"
                  )}>
                    {baseFieldsConfig.emailRequired && <Check className="w-3 h-3 stroke-[3.5]" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-600">Email</span>
                    <span className="text-[10px] text-slate-400 font-normal">{baseFieldsConfig.emailRequired ? 'Required' : 'Optional'}</span>
                  </div>
                </label>
                {/* Department */}
                <label className={cn(
                  "flex items-center gap-3 cursor-pointer select-none border rounded-[8px] p-3 transition duration-200",
                  baseFieldsConfig.departmentRequired
                    ? "bg-[#FF9900]/5 border-[#FF9900]/30 hover:bg-[#FF9900]/10"
                    : "bg-white border-slate-200 hover:bg-slate-50/50"
                )}>
                  <input
                    type="checkbox"
                    checked={baseFieldsConfig.departmentRequired}
                    onChange={(e) => setBaseFieldsConfig({ ...baseFieldsConfig, departmentRequired: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={cn(
                    "w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-200 shrink-0",
                    baseFieldsConfig.departmentRequired
                      ? "bg-[#FF9900] border-[#FF9900] text-white"
                      : "border-slate-300 bg-white"
                  )}>
                    {baseFieldsConfig.departmentRequired && <Check className="w-3 h-3 stroke-[3.5]" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-600">Department</span>
                    <span className="text-[10px] text-slate-400 font-normal">{baseFieldsConfig.departmentRequired ? 'Required' : 'Optional'}</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-semibold text-slate-555 uppercase tracking-wider pl-0.5">Additional Custom Fields</h3>
            </div>

            <div className="space-y-4">
              {fields.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center py-10 px-4 border border-dashed border-slate-200 rounded-[12px] bg-slate-50/30 hover:bg-slate-50/60 transition-colors duration-200 min-h-[190px]">
                  <div className="p-3 bg-slate-100/60 rounded-full mb-3 shadow-inner">
                    <FileText className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-[13.5px] font-bold text-slate-700 mb-1">No Custom Fields</p>
                  <p className="text-[11.5px] text-slate-400 mb-4 max-w-[280px] leading-relaxed">
                    Collect additional custom information from attendees. Add custom fields if needed.
                  </p>
                  <button
                    type="button"
                    onClick={addField}
                    className="inline-flex items-center gap-1.5 bg-[#FF9900] hover:bg-[#FF9900]/90 active:scale-[0.97] hover:scale-[1.03] text-white rounded-[8px] text-xs font-semibold px-4 py-2.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Custom Field
                  </button>
                </div>
              )}

              {fields.map((field, index) => (
                <div
                  key={field._key}
                  className="border border-slate-200 rounded-[10px] p-4 space-y-3.5 bg-white shadow-sm hover:border-slate-300 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-[6px]">
                        Custom Field #{index + 1}
                      </span>
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveField(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveField(index, 'down')}
                          disabled={index === fields.length - 1}
                          className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeField(field._key)}
                      className="p-1.5 rounded-[8px] text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">
                        Label
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field._key, { label: e.target.value })}
                        placeholder="Field label"
                        className="w-full border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1.5">
                        Type
                      </label>
                      <div className="relative">
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(field._key, {
                              type: e.target.value as FieldType,
                              optionsList: hasOptions(e.target.value as FieldType)
                                ? field.optionsList || []
                                : [],
                            })
                          }
                          className="w-full appearance-none border border-slate-200 rounded-[8px] text-sm px-3.5 py-2 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-700 cursor-pointer"
                        >
                          {FIELD_TYPES.map((ft) => (
                            <option key={ft.value} value={ft.value}>
                              {ft.label}
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pl-0.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.isRequired || false}
                        onChange={(e) => updateField(field._key, { isRequired: e.target.checked })}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-[#FF9900] focus:ring-[#FF9900] cursor-pointer focus:ring-offset-0 focus:outline-none"
                      />
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Required</span>
                    </label>
                  </div>

                  {hasOptions(field.type) && (
                    <div className="border-t border-slate-100 pt-3.5 space-y-2.5">
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider pl-0.5 mb-1">
                        Options
                      </label>
                      {(field.optionsList || []).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(field._key, optIdx, e.target.value)}
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1 border border-slate-200 rounded-[8px] text-sm px-3.5 py-1.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF9900]/10 focus:border-[#FF9900] transition-all duration-200 text-slate-800 placeholder-slate-400"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(field._key, optIdx)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(field._key)}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#FF9900] hover:text-[#FF9900]/80 transition-all duration-200 pl-0.5"
                      >
                        <Plus className="h-3 w-3" />
                        Add Option
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {fields.length > 0 && (
                <button
                  type="button"
                  onClick={addField}
                  className="inline-flex items-center justify-center gap-1.5 border border-dashed border-slate-300 hover:border-[#FF9900] rounded-[8px] text-xs font-semibold px-4 py-3 text-slate-600 hover:text-[#FF9900] hover:bg-[#FF9900]/5 transition-all duration-200 w-full"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Another Field
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        setUserId(parsed.id || '');
      }
    } catch { /* ignore */ }
  }, []);

  const [formData, setFormData] = useState<CreateEventDto>({
    organizerId: '',
    title: '',
    category: '',
    description: '',
    shortDescription: '',
    venue: '',
    mode: undefined,
    capacity: undefined,
    date: '',
    time: '',
    registrationDeadline: '',
    status: 'DRAFT',
    registrationFormType: 'DEFAULT',
  });

  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerItem[]>([]);
  const [formFields, setFormFields] = useState<FormFieldItem[]>([]);
  const [baseFieldsConfig, setBaseFieldsConfig] = useState({
    nameRequired: true,
    rollNumberRequired: true,
    emailRequired: true,
    departmentRequired: true,
  });

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Record<string, string> = {};

      if (step === 0) {
        if (!formData.title?.trim()) {
          newErrors.title = 'Title is required';
        }
        if (!formData.category?.trim()) {
          newErrors.category = 'Category is required';
        }
        if (!formData.mode) {
          newErrors.mode = 'Event mode is required';
        }
        if (!formData.date) {
          newErrors.date = 'Date is required';
        }
        if (!formData.time) {
          newErrors.time = 'Time is required';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [formData],
  );

  function handleNext() {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
    }
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(0, s - 1));
  }

  function handleSubmit() {
    if (!validateStep(0)) {
      setCurrentStep(0);
      return;
    }

    if (!userId) {
      setErrors({ title: 'User session not found. Please log in again.' });
      setCurrentStep(0);
      return;
    }

    let resolvedPoster = formData.posterImage;
    if (resolvedPoster) {
      let posHash = '';
      const hashIdx = resolvedPoster.lastIndexOf('#pos=');
      if (hashIdx !== -1) {
        posHash = resolvedPoster.substring(hashIdx);
        resolvedPoster = resolvedPoster.substring(0, hashIdx);
      }
      if (resolvedPoster.startsWith('data:')) {
        resolvedPoster = '/uploads/events/cloud_matrix.jpg' + posHash;
      } else {
        resolvedPoster = resolvedPoster + posHash;
      }
    }

    const payload: CreateEventDto = {
      ...formData,
      organizerId: userId,
      posterImage: resolvedPoster,
      agenda: agenda.map(({ _key, ...rest }) => rest),
      speakers: speakers.map(({ _key, ...rest }) => rest),
      formFields:
        formData.registrationFormType === 'DEFAULT'
          ? []
          : [
              { label: 'Name', type: 'TEXT', isRequired: baseFieldsConfig.nameRequired, fieldOrder: -4 },
              { label: 'Roll Number', type: 'TEXT', isRequired: baseFieldsConfig.rollNumberRequired, fieldOrder: -3 },
              { label: 'Email', type: 'EMAIL', isRequired: baseFieldsConfig.emailRequired, fieldOrder: -2 },
              { label: 'Department', type: 'TEXT', isRequired: baseFieldsConfig.departmentRequired, fieldOrder: -1 },
              ...formFields.map(({ _key, optionsList, ...rest }) => ({
                ...rest,
                options: optionsList && optionsList.length > 0 ? { choices: optionsList } : undefined,
              })),
            ],
    };

    createEvent.mutate(payload, {
      onSuccess: () => {
        router.push('/core/events');
      },
    });
  }

  return (
    <div className="bg-transparent p-6 lg:p-8 pb-24 relative overflow-y-auto premium-scrollbar scroll-smooth">
      {/* Background ambient glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,153,0,0.07)_0%,rgba(255,153,0,0.03)_40%,transparent_70%)] pointer-events-none z-0" />

      <div className="max-w-[1600px] w-full mx-auto z-10 relative">
        {/* Top Cancel & Back */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/core/events"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-950 font-semibold rounded-lg text-xs shadow-sm hover:shadow hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-750 group-hover:-translate-x-0.5 transition-all duration-200" />
            <span className="tracking-wide">Cancel & Back</span>
          </Link>
        </div>

        {/* Wizard Card */}
        <div className="bg-white border border-slate-200/80 rounded-[8px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
          {/* Glow accent */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_75%_20%,rgba(0,115,187,0.03)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative z-10">
            {/* Header */}
            <div className="mb-6 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-semibold text-[#FF9900] uppercase tracking-wider font-sans block mb-1">
                  Event Management
                </span>
                <h2 className="text-3xl font-bold text-[#232F3E] tracking-tight">
                  Create New Event
                </h2>
              </div>
            </div>

            {/* Stacked Wizard Form Panels */}
            <div className="space-y-4">
              {/* PANEL 0: Basic Info */}
              <div className={cn(
                "border rounded-[8px] p-5 transition-all duration-300",
                currentStep === 0 ? "border-slate-200 bg-white shadow-sm" : "border-slate-100 bg-slate-50/30",
                currentStep < 0 && "opacity-60 bg-slate-50/20"
              )}>
                {/* Panel Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all duration-200",
                      currentStep === 0 
                        ? "bg-[#232F3E] border-[#232F3E] text-white shadow-sm ring-4 ring-slate-100" 
                        : "bg-emerald-500 border-emerald-500 text-white"
                    )}>
                      {currentStep > 0 ? <Check className="w-3.5 h-3.5" /> : '1'}
                    </div>
                    <div>
                      <span className={cn(
                        "text-[16px] font-semibold font-sans tracking-tight block",
                        currentStep === 0 ? "text-slate-900" : "text-slate-500"
                      )}>
                        Basic Info
                      </span>
                      {currentStep > 0 && (
                        <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                          {formData.title || 'Untitled Event'} • {formData.date ? new Date(formData.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'} • {formData.venue || 'No venue'}
                        </span>
                      )}
                    </div>
                  </div>
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(0)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-650 hover:text-[#232F3E] font-bold rounded-[6px] text-[10.5px] uppercase tracking-wider shadow-sm transition-all duration-200 cursor-pointer font-sans group"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF9900] transition-colors duration-200" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* Panel Body */}
                {currentStep === 0 && (
                  <div className="mt-4 space-y-4 pt-3.5 border-t border-slate-100">
                    <BasicInfoStep formData={formData} setFormData={setFormData} errors={errors} />
                    
                    {/* Navigation */}
                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center gap-1.5 bg-[#1A1C1E] hover:bg-[#FF9900] text-white font-semibold py-2 px-4 rounded-[8px] shadow-sm hover:shadow text-xs transition-all duration-200 uppercase tracking-wider cursor-pointer font-sans"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* PANEL 1: Agenda */}
              <div className={cn(
                "border rounded-[8px] p-5 transition-all duration-300",
                currentStep === 1 ? "border-slate-200 bg-white shadow-sm" : "border-slate-100 bg-slate-50/30",
                currentStep < 1 && "opacity-60 bg-slate-50/20"
              )}>
                {/* Panel Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all duration-200",
                      currentStep === 1 
                        ? "bg-[#232F3E] border-[#232F3E] text-white shadow-sm ring-4 ring-slate-100" 
                        : currentStep > 1
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "bg-slate-100 border-slate-250 text-slate-400"
                    )}>
                      {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '2'}
                    </div>
                    <div>
                      <span className={cn(
                        "text-[16px] font-semibold font-sans tracking-tight block",
                        currentStep === 1 ? "text-slate-900" : "text-slate-500"
                      )}>
                        Agenda
                      </span>
                      {currentStep > 1 && (
                        <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                          {agenda.length} session(s) defined
                        </span>
                      )}
                      {currentStep < 1 && (
                        <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                          Complete basic info step to unlock
                        </span>
                      )}
                    </div>
                  </div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-650 hover:text-[#232F3E] font-bold rounded-[6px] text-[10.5px] uppercase tracking-wider shadow-sm transition-all duration-200 cursor-pointer font-sans group"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF9900] transition-colors duration-200" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* Panel Body */}
                {currentStep === 1 && (
                  <div className="mt-4 space-y-4 pt-3.5 border-t border-slate-100">
                    <AgendaStep agenda={agenda} setAgenda={setAgenda} />
                    
                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-slate-350 text-slate-650 hover:text-slate-800 hover:bg-slate-50 font-semibold py-2 px-3.5 rounded-[8px] text-xs shadow-sm transition-all duration-200 cursor-pointer uppercase tracking-wider font-sans"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center gap-1.5 bg-[#1A1C1E] hover:bg-[#FF9900] text-white font-semibold py-2.5 px-4 rounded-[8px] shadow-sm hover:shadow text-xs transition-all duration-200 uppercase tracking-wider cursor-pointer font-sans"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* PANEL 2: Speakers */}
              <div className={cn(
                "border rounded-[8px] p-5 transition-all duration-300",
                currentStep === 2 ? "border-slate-200 bg-white shadow-sm" : "border-slate-100 bg-slate-50/30",
                currentStep < 2 && "opacity-60 bg-slate-50/20"
              )}>
                {/* Panel Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all duration-200",
                      currentStep === 2 
                        ? "bg-[#232F3E] border-[#232F3E] text-white shadow-sm ring-4 ring-slate-100" 
                        : currentStep > 2
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "bg-slate-100 border-slate-250 text-slate-400"
                    )}>
                      {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '3'}
                    </div>
                    <div>
                      <span className={cn(
                        "text-[16px] font-semibold font-sans tracking-tight block",
                        currentStep === 2 ? "text-slate-900" : "text-slate-500"
                      )}>
                        Speakers
                      </span>
                      {currentStep > 2 && (
                        <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                          {speakers.length} speaker(s) added
                        </span>
                      )}
                      {currentStep < 2 && (
                        <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                          Complete agenda step to unlock
                        </span>
                      )}
                    </div>
                  </div>
                  {currentStep > 2 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-650 hover:text-[#232F3E] font-bold rounded-[6px] text-[10.5px] uppercase tracking-wider shadow-sm transition-all duration-200 cursor-pointer font-sans group"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#FF9900] transition-colors duration-200" />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {/* Panel Body */}
                {currentStep === 2 && (
                  <div className="mt-4 space-y-4 pt-3.5 border-t border-slate-100">
                    <SpeakersStep speakers={speakers} setSpeakers={setSpeakers} />
                    
                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-slate-350 text-slate-650 hover:text-slate-800 hover:bg-slate-50 font-semibold py-2 px-3.5 rounded-[8px] text-xs shadow-sm transition-all duration-200 cursor-pointer uppercase tracking-wider font-sans"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center gap-1.5 bg-[#1A1C1E] hover:bg-[#FF9900] text-white font-semibold py-2.5 px-4 rounded-[8px] shadow-sm hover:shadow text-xs transition-all duration-200 uppercase tracking-wider cursor-pointer font-sans"
                      >
                        <span>Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* PANEL 3: Form Builder */}
              <div className={cn(
                "border rounded-[8px] p-5 transition-all duration-300",
                currentStep === 3 ? "border-slate-200 bg-white shadow-sm" : "border-slate-100 bg-slate-50/30",
                currentStep < 3 && "opacity-60 bg-slate-50/20"
              )}>
                {/* Panel Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all duration-200",
                      currentStep === 3 
                        ? "bg-[#232F3E] border-[#232F3E] text-white shadow-sm ring-4 ring-slate-100" 
                        : "bg-slate-100 border-slate-250 text-slate-400"
                    )}>
                      4
                    </div>
                    <div>
                      <span className={cn(
                        "text-[16px] font-semibold font-sans tracking-tight block",
                        currentStep === 3 ? "text-slate-900" : "text-slate-500"
                      )}>
                        Form Builder
                      </span>
                      {currentStep < 3 && (
                        <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                          Complete speakers step to unlock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Panel Body */}
                {currentStep === 3 && (
                  <div className="mt-4 space-y-4 pt-3.5 border-t border-slate-100">
                    <FormBuilderStep
                      fields={formFields}
                      setFields={setFormFields}
                      registrationFormType={formData.registrationFormType || 'DEFAULT'}
                      setRegistrationFormType={(type) =>
                        setFormData({ ...formData, registrationFormType: type })
                      }
                      baseFieldsConfig={baseFieldsConfig}
                      setBaseFieldsConfig={setBaseFieldsConfig}
                    />

                    {/* Error summary */}
                    {createEvent.isError && (
                      <div className="border border-rose-200 bg-rose-50 rounded-[8px] p-4 mt-4">
                        <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                          <AlertCircle className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                          <span>Failed to create event. Please verify all information and try again.</span>
                        </p>
                      </div>
                    )}
                    
                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-1.5 border border-slate-200 hover:border-slate-350 text-slate-650 hover:text-slate-800 hover:bg-slate-50 font-semibold py-2 px-3.5 rounded-[8px] text-xs shadow-sm transition-all duration-200 cursor-pointer uppercase tracking-wider font-sans"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={createEvent.isPending}
                        className="flex items-center gap-1.5 bg-[#232F3E] hover:bg-[#FF9900] text-white font-semibold py-2.5 px-6 rounded-[8px] shadow-md disabled:bg-slate-350 disabled:cursor-not-allowed text-xs transition-all duration-200 uppercase tracking-wider cursor-pointer font-sans"
                      >
                        {createEvent.isPending ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Create Event</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
