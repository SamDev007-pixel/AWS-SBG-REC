'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Globe,
  MapPin,
  Laptop,
  Video,
  Network,
  Layers,
  Check,
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
        setFormData({ ...formData, posterImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1.5">Poster Image</label>

      <div className="space-y-3">
        {!formData.posterImage ? (
          <div>
            <label className="border-2 border-dashed border-slate-200 rounded-[10px] p-4 text-center hover:border-slate-300 transition cursor-pointer flex flex-col items-center justify-center min-h-[96px] bg-slate-50">
              <Upload className="h-6 w-6 text-slate-400 mb-1" />
              <span className="text-sm text-slate-600 font-bold">Select Image file</span>
              <span className="text-[11.5px] text-slate-450 mt-1.5">
                PNG, JPG up to 5MB (Converts to Base64)
              </span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
            </label>
          </div>
        ) : (
          <div className="flex items-center gap-3 border border-slate-200 rounded-[8px] p-2 bg-slate-50">
            <div className="w-16 h-12 rounded-[6px] overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center relative">
              <img
                src={formData.posterImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Active Poster Image
              </p>
              <p className="text-xs text-slate-600 truncate">
                {formData.posterImage.startsWith('data:')
                  ? 'Local Uploaded Image'
                  : formData.posterImage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, posterImage: '' })}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 px-2 py-1"
            >
              Clear
            </button>
          </div>
        )}
      </div>
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
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
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
          className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
        />
        {errors.title && <p className="text-[10px] text-rose-500 mt-1">{errors.title}</p>}
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Short Description</label>
        <input
          type="text"
          value={shortDesc}
          onChange={(e) => {
            setShortDesc(e.target.value);
            triggerChange('shortDescription', e.target.value);
          }}
          onBlur={() => handleBlur('shortDescription', shortDesc)}
          placeholder="Brief description (shown in cards)"
          className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
        />
      </div>

      {/* Full Description */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">Full Description</label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            triggerChange('description', e.target.value);
          }}
          onBlur={() => handleBlur('description', description)}
          placeholder="Detailed event description..."
          className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition resize-none"
        />
      </div>

      {/* Category & Venue row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Quick Select</label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition text-left cursor-pointer"
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
                  className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 cursor-pointer ${
                    !formData.category ? 'bg-[#232F3E]/5 text-[#232F3E] font-medium' : 'text-slate-700 hover:bg-slate-50'
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
                      className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 cursor-pointer ${
                        isSelected ? 'bg-[#232F3E]/5 text-[#232F3E] font-medium' : 'text-slate-700 hover:bg-slate-50'
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
          <label className="block text-xs font-medium text-slate-700 mb-1">Category <span className="text-rose-500">*</span></label>
          <input
            type="text"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Enter category..."
            className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
          />
          {errors.category && <p className="text-[10px] text-rose-500 mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Venue</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => {
              setVenue(e.target.value);
              triggerChange('venue', e.target.value);
            }}
            onBlur={() => handleBlur('venue', venue)}
            placeholder="Event venue"
            className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
          />
        </div>
      </div>

      {/* Mode */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide pl-0.5 mb-2">Mode <span className="text-rose-500">*</span></label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['ONLINE', 'OFFLINE', 'HYBRID'] as EventMode[]).map((m) => {
            const config = {
              ONLINE: { label: 'Online', desc: 'Virtual livestream', icon: <Laptop size={22} className={formData.mode === 'ONLINE' ? 'text-[#232F3E]' : 'text-slate-400'} /> },
              OFFLINE: { label: 'Offline', desc: 'In-person venue', icon: <MapPin size={22} className={formData.mode === 'OFFLINE' ? 'text-[#232F3E]' : 'text-slate-400'} /> },
              HYBRID: { label: 'Hybrid', desc: 'Mixed attendance', icon: <Users size={22} className={formData.mode === 'HYBRID' ? 'text-[#232F3E]' : 'text-slate-400'} /> },
            }[m];
            return (
              <label
                key={m}
                className={cn(
                  "flex items-start gap-3 border rounded-[8px] p-4 cursor-pointer transition-all duration-200 select-none",
                  formData.mode === m
                    ? "border-[#232F3E] bg-[#232F3E]/5 text-[#232F3E]"
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
                  formData.mode === m ? "bg-[#232F3E]/10 border-transparent" : "bg-white border-slate-100"
                )}>
                  {config.icon}
                </div>
                <div className="flex flex-col text-left gap-0.5 font-sans">
                  <span className={cn(
                    "text-[14.5px] tracking-tight leading-tight transition-all duration-200",
                    formData.mode === m 
                      ? "font-semibold text-[#232F3E]" 
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
        <label className="block text-xs font-medium text-slate-700 mb-1">Capacity</label>
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
          className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
        />
      </div>

      {/* Date, Time, Registration Deadline */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Date <span className="text-rose-500">*</span></label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                triggerChange('date', e.target.value);
              }}
              onBlur={() => handleBlur('date', date)}
              className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
            />
          </div>
          {errors.date && <p className="text-[10px] text-rose-500 mt-1">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Time <span className="text-rose-500">*</span></label>
          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              triggerChange('time', e.target.value);
            }}
            onBlur={() => handleBlur('time', time)}
            className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
          />
          {errors.time && <p className="text-[10px] text-rose-500 mt-1">{errors.time}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
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
            className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
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
        <div 
          style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.03), rgba(35, 47, 62, 0.015))" }} 
          className="flex flex-col items-center justify-center text-center py-10 px-4 border border-dashed border-slate-200 rounded-[12px] min-h-[190px] hover:border-slate-300 transition-colors duration-200"
        >
          <div className="p-3 bg-white rounded-full mb-3 shadow-sm border border-slate-100/80">
            <FileText className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-[13.5px] font-bold text-slate-800 mb-1">No Agenda Items</p>
          <p className="text-[11.5px] text-slate-400 mb-4 max-w-[280px] leading-relaxed">
            Create and organize the schedule for your event. Add your first session to get started.
          </p>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-1.5 bg-[#232F3E] hover:bg-[#232F3E]/90 active:scale-[0.97] hover:scale-[1.03] text-white rounded-[8px] text-xs font-semibold px-4 py-2.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Item
          </button>
        </div>
      )}

      {agenda.map((item, index) => (
        <div
          key={item._key}
          className="border border-slate-200 rounded-[10px] p-4 space-y-3 bg-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-[6px]">
                #{index + 1}
              </span>
              <div className="flex gap-0.5">
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === agenda.length - 1}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <button
              onClick={() => removeItem(item._key)}
              className="p-1.5 rounded-[8px] text-rose-500 hover:bg-rose-50 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Title</label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(item._key, 'title', e.target.value)}
                placeholder="Session title"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Speaker</label>
              <input
                type="text"
                value={item.speaker || ''}
                onChange={(e) => updateItem(item._key, 'speaker', e.target.value)}
                placeholder="Speaker name"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={item.startTime}
                onChange={(e) => updateItem(item._key, 'startTime', e.target.value)}
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">End Time</label>
              <input
                type="time"
                value={item.endTime}
                onChange={(e) => updateItem(item._key, 'endTime', e.target.value)}
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
              />
            </div>
          </div>
        </div>
      ))}

      {agenda.length > 0 && (
        <button
          onClick={addItem}
          className="inline-flex items-center gap-1.5 border border-dashed border-slate-300 rounded-[8px] text-xs font-medium px-4 py-2 text-slate-600 hover:border-slate-400 hover:text-slate-800 transition w-full justify-center"
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
        <div 
          style={{ background: "linear-gradient(135deg, rgba(255, 153, 0, 0.03), rgba(35, 47, 62, 0.015))" }} 
          className="flex flex-col items-center justify-center text-center py-10 px-4 border border-dashed border-slate-200 rounded-[12px] min-h-[190px] hover:border-slate-300 transition-colors duration-200"
        >
          <div className="p-3 bg-white rounded-full mb-3 shadow-sm border border-slate-100/80">
            <Users className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-[13.5px] font-bold text-slate-800 mb-1">No Speakers Added</p>
          <p className="text-[11.5px] text-slate-400 mb-4 max-w-[280px] leading-relaxed">
            Highlight the speakers or hosts for this event. Add your first speaker to get started.
          </p>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-1.5 bg-[#232F3E] hover:bg-[#232F3E]/90 active:scale-[0.97] hover:scale-[1.03] text-white rounded-[8px] text-xs font-semibold px-4 py-2.5 shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Speaker
          </button>
        </div>
      )}

      {speakers.map((item, index) => (
        <div
          key={item._key}
          className="border border-slate-200 rounded-[10px] p-4 space-y-3 bg-white"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-[6px]">
                Speaker #{index + 1}
              </span>
              <div className="flex gap-0.5">
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === speakers.length - 1}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <button
              onClick={() => removeItem(item._key)}
              className="p-1.5 rounded-[8px] text-rose-500 hover:bg-rose-50 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Name</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item._key, 'name', e.target.value)}
                placeholder="Speaker name"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Role</label>
              <input
                type="text"
                value={item.role || ''}
                onChange={(e) => updateItem(item._key, 'role', e.target.value)}
                placeholder="e.g. Keynote Speaker"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-medium text-slate-500 mb-1">
                Organization
              </label>
              <input
                type="text"
                value={item.organization || ''}
                onChange={(e) => updateItem(item._key, 'organization', e.target.value)}
                placeholder="Company or institution"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-medium text-slate-500 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={item.linkedinUrl || ''}
                onChange={(e) => updateItem(item._key, 'linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Bio</label>
              <textarea
                rows={3}
                value={item.bio || ''}
                onChange={(e) => updateItem(item._key, 'bio', e.target.value)}
                placeholder="Speaker biography..."
                className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-medium text-slate-500 mb-1">Photo</label>
              {item.photo ? (
                <div className="border border-slate-200 rounded-[10px] p-2 flex items-center gap-3 min-h-[96px] bg-slate-50/50">
                  <div className="h-16 w-16 rounded-full overflow-hidden border border-slate-200/80 bg-slate-100 flex-shrink-0">
                    <img src={item.photo} alt="Speaker preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-650 truncate">Speaker Photo Uploaded</p>
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
                <label className="border-2 border-dashed border-slate-200 hover:border-[#232F3E] hover:bg-[#232F3E]/5 rounded-[10px] p-4 text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[96px] bg-slate-50 relative">
                  <Upload className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500">Click to upload photo</p>
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
          className="inline-flex items-center gap-1.5 border border-dashed border-slate-300 rounded-[8px] text-xs font-medium px-4 py-2 text-slate-600 hover:border-slate-400 hover:text-slate-800 transition w-full justify-center"
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
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
          Registration Form Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label
            className={`flex flex-col p-4 border rounded-[12px] cursor-pointer transition relative hover:border-[#232F3E]/40 ${
              registrationFormType === 'DEFAULT'
                ? 'border-[#232F3E]/40 bg-[#232F3E]/2'
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
                  ? "border-[#232F3E] bg-white"
                  : "border-slate-300 bg-white"
              )}>
                {registrationFormType === 'DEFAULT' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#232F3E]" />
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Standard registration with mandatory fields: Name, Roll Number, Email, and Department.
            </p>
          </label>

          <label
            className={`flex flex-col p-4 border rounded-[12px] cursor-pointer transition relative hover:border-[#232F3E]/40 ${
              registrationFormType === 'CUSTOM'
                ? 'border-[#232F3E]/40 bg-[#232F3E]/2'
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
                  ? "border-[#232F3E] bg-white"
                  : "border-slate-300 bg-white"
              )}>
                {registrationFormType === 'CUSTOM' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#232F3E]" />
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
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Form Fields Preview</h3>
            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-[12px] p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="opacity-75">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Name *</label>
                  <input
                    type="text"
                    disabled
                    placeholder="John Doe"
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white cursor-not-allowed text-slate-400"
                  />
                </div>
                <div className="opacity-75">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="22XX1234"
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white cursor-not-allowed text-slate-400"
                  />
                </div>
                <div className="opacity-75">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
                  <input
                    type="email"
                    disabled
                    placeholder="john@example.com"
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white cursor-not-allowed text-slate-400"
                  />
                </div>
                <div className="opacity-75">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="Computer Science"
                    className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white cursor-not-allowed text-slate-400"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
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
                    ? "bg-[#232F3E]/5 border-[#232F3E]/30 hover:bg-[#232F3E]/10"
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
                      ? "bg-[#232F3E] border-[#232F3E] text-white"
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
                    ? "bg-[#232F3E]/5 border-[#232F3E]/30 hover:bg-[#232F3E]/10"
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
                      ? "bg-[#232F3E] border-[#232F3E] text-white"
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
                    ? "bg-[#232F3E]/5 border-[#232F3E]/30 hover:bg-[#232F3E]/10"
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
                      ? "bg-[#232F3E] border-[#232F3E] text-white"
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
                    ? "bg-[#232F3E]/5 border-[#232F3E]/30 hover:bg-[#232F3E]/10"
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
                      ? "bg-[#232F3E] border-[#232F3E] text-white"
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

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Additional Custom Fields</h3>
            </div>

            <div className="space-y-4">
              {fields.length === 0 && (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-[10px] bg-slate-50">
                  <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 mb-3">
                    No custom fields added yet. Add additional fields for your custom form if
                    needed.
                  </p>
                  <button
                    type="button"
                    onClick={addField}
                    className="inline-flex items-center gap-1.5 bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-4 py-2 hover:opacity-90 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Custom Field
                  </button>
                </div>
              )}

              {fields.map((field, index) => (
                <div
                  key={field._key}
                  className="border border-slate-200 rounded-[10px] p-4 space-y-3 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
                      <span className="text-[10px] font-semibold uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-[6px]">
                        Custom Field #{index + 1}
                      </span>
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveField(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveField(index, 'down')}
                          disabled={index === fields.length - 1}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeField(field._key)}
                      className="p-1.5 rounded-[8px] text-rose-500 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field._key, { label: e.target.value })}
                        placeholder="Field label"
                        className="w-full border border-slate-200 rounded-[8px] text-sm px-3 py-2 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 mb-1">
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
                          className="w-full appearance-none border border-slate-200 rounded-[8px] text-sm px-3 py-2 bg-white focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
                        >
                          {FIELD_TYPES.map((ft) => (
                            <option key={ft.value} value={ft.value}>
                              {ft.label}
                            </option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 rotate-90 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.isRequired || false}
                        onChange={(e) => updateField(field._key, { isRequired: e.target.checked })}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-[#232F3E] focus:ring-[#232F3E]"
                      />
                      <span className="text-[10px] font-medium text-slate-500">Required</span>
                    </label>
                  </div>

                  {hasOptions(field.type) && (
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <label className="block text-[10px] font-medium text-slate-500">
                        Options
                      </label>
                      {(field.optionsList || []).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(field._key, optIdx, e.target.value)}
                            placeholder={`Option ${optIdx + 1}`}
                            className="flex-1 border border-slate-200 rounded-[8px] text-sm px-3 py-1.5 focus:outline-none focus:ring-4 focus:ring-[#232F3E]/10 focus:border-[#232F3E] transition"
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
                        className="inline-flex items-center gap-1 text-[10px] font-medium text-[#232F3E] hover:underline"
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
                  className="inline-flex items-center gap-1.5 border border-dashed border-slate-300 rounded-[8px] text-xs font-medium px-4 py-2 text-slate-600 hover:border-slate-400 hover:text-slate-800 transition w-full justify-center"
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

function StepIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-1 sm:gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              index === currentStep
                ? 'bg-[#232F3E] text-white'
                : index < currentStep
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
            }`}
          >
            <span
              className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                index < currentStep
                  ? 'bg-emerald-500 text-white'
                  : index === currentStep
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-500'
              }`}
            >
              {index < currentStep ? '✓' : index + 1}
            </span>
            <span className="hidden sm:inline">{step}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-px w-4 sm:w-8 ${
                index < currentStep ? 'bg-emerald-300' : 'bg-slate-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CreateEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string>('');

  // Temporary Permissions verification
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [expiryTime, setExpiryTime] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aws_sgb_rec_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        setUserId(parsed.id || '');
      } else {
        setHasPermission(false);
      }
    } catch { 
      setHasPermission(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    async function checkPermission() {
      try {
        const res = await fetch(`/api/auth/permissions/check?userId=${userId}&permission=create_event`);
        const data = await res.json();
        setHasPermission(!!data.hasPermission);
        if (data.hasPermission && data.expiresAt) {
          setExpiryTime(data.expiresAt);
        }
      } catch (err) {
        console.error("Failed to check event creation permission:", err);
        setHasPermission(false);
      }
    }
    checkPermission();
  }, [userId]);

  useEffect(() => {
    if (!expiryTime) return;
    const interval = setInterval(() => {
      const diff = new Date(expiryTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expired');
        setHasPermission(false);
        clearInterval(interval);
      } else {
        const totalSecs = Math.floor(diff / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        setTimeLeft(`${mins}m ${secs}s remaining`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

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

    const payload: CreateEventDto = {
      ...formData,
      organizerId: userId,
      posterImage:
        formData.posterImage && formData.posterImage.startsWith('data:')
          ? '/uploads/events/cloud_matrix.jpg'
          : formData.posterImage,
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
        router.push('/crew/events');
      },
    });
  }

  const isLastStep = currentStep === STEPS.length - 1;

  if (hasPermission === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#232F3E] border-t-transparent animate-spin" />
        <span className="text-xs text-slate-500 font-semibold">Verifying delegation credentials...</span>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
          <Trash2 size={24} />
        </div>
        <h3 className="text-slate-900 font-bold text-lg mb-2">Access Revoked or Expired</h3>
        <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6 uppercase tracking-wider">
          You do not have active temporary permissions to create events. Ask a Core Administrator to grant you the "Create Event" permission.
        </p>
        <button
          onClick={() => router.push('/crew/events')}
          className="px-6 py-2.5 bg-[#232F3E] hover:bg-[#1a232f] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          Return to Events
        </button>
      </div>
    );
  }

  return (
    <div className="bg-transparent p-6 lg:p-8">
      <div className="w-full space-y-6">
        {/* Expiry Warning Banner */}
        {timeLeft && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-center justify-between text-xs font-bold shadow-xs">
            <span className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Temporary Event Creation Authority is active. Please complete before expiry.</span>
            </span>
            <span className="bg-amber-100 border border-amber-200 px-3 py-1 rounded-lg text-amber-700 animate-pulse">
              {timeLeft}
            </span>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Create Event</h1>
          <p className="mt-1 text-sm text-slate-500">Fill in the details to create a new event</p>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={STEPS} currentStep={currentStep} />

        {/* Step Content */}
        <div className="border border-slate-200 bg-white rounded-[10px] shadow-sm p-5 sm:p-6">
          {currentStep === 0 && (
            <BasicInfoStep formData={formData} setFormData={setFormData} errors={errors} />
          )}
          {currentStep === 1 && <AgendaStep agenda={agenda} setAgenda={setAgenda} />}
          {currentStep === 2 && <SpeakersStep speakers={speakers} setSpeakers={setSpeakers} />}
          {currentStep === 3 && (
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
          )}
        </div>

        {/* Error summary */}
        {createEvent.isError && (
          <div className="border border-rose-200 bg-rose-50 rounded-[10px] p-4">
            <p className="text-xs text-rose-600">Failed to create event. Please try again.</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-1.5 border border-slate-200 rounded-[8px] text-xs font-medium px-4 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createEvent.isPending}
              className="inline-flex items-center gap-1.5 bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-5 py-2 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {createEvent.isPending ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 bg-[#232F3E] text-white rounded-[8px] text-xs font-medium px-5 py-2 hover:opacity-90 transition"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
