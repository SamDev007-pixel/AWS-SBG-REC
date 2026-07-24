'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEvents, useCreateRegistration } from '@/lib/hooks';
import * as api from '@/lib/api';
import {
  X,
  User,
  Mail,
  School,
  Building,
  Calendar,
  CheckCircle2,
  Ticket as TicketIcon,
  Download,
  AlertCircle,
  Loader2,
  PlusCircle,
  QrCode,
  ChevronDown,
  MapPin
} from 'lucide-react';

interface OnSpotRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEventId?: string;
  onSuccess?: () => void;
  brandColor?: 'orange' | 'navy'; // 'orange' for core admin panel, 'navy' for crew panel
}

export default function OnSpotRegistrationModal({
  isOpen,
  onClose,
  defaultEventId = '',
  onSuccess,
  brandColor = 'orange',
}: OnSpotRegistrationModalProps) {
  // Form states
  const [selectedEventId, setSelectedEventId] = useState(defaultEventId);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Success states
  const [successData, setSuccessData] = useState<any | null>(null);

  // Hook mutations
  const createMutation = useCreateRegistration();

  // Query events list (filter to open/published events)
  const { data: eventsData, isLoading: eventsLoading } = useEvents({ limit: 500 });
  const openEvents = (eventsData?.data ?? []).filter(
    (e) => e.status === 'PUBLISHED' || e.status === 'REGISTRATION_OPEN'
  );

  // Query selected event details to get custom fields
  const { data: eventDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['event-details-onspot', selectedEventId],
    queryFn: () => api.fetchEvent(selectedEventId),
    enabled: !!selectedEventId,
  });

  // Pre-select default event when open
  useEffect(() => {
    if (isOpen) {
      setSelectedEventId(defaultEventId);
      setName('');
      setEmail('');
      setRollNumber('');
      setDepartment('');
      setCustomAnswers({});
      setErrors({});
      setSuccessData(null);
    }
  }, [isOpen, defaultEventId]);

  if (!isOpen) return null;

  const isCore = brandColor === 'orange';
  const accentCls = isCore ? 'text-[#FF9900]' : 'text-[#232F3E]';
  const bgAccentCls = isCore ? 'bg-[#FF9900] hover:bg-orange-600' : 'bg-[#232F3E] hover:bg-slate-700';
  const borderFocusCls = isCore ? 'focus:border-[#FF9900] focus:ring-[#FF9900]/10' : 'focus:border-[#232F3E] focus:ring-[#232F3E]/10';

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedEventId) {
      newErrors.eventId = 'Please select an event';
    }

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (/[^a-zA-Z\s.-]/.test(name)) {
      newErrors.name = 'Name can only contain letters, spaces, dots, and hyphens';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@rajalakshmi\.edu\.in$/.test(email)) {
      newErrors.email = 'Email must be a valid @rajalakshmi.edu.in address';
    }

    if (!rollNumber.trim()) {
      newErrors.rollNumber = 'Registration / Roll Number is required';
    } else if (/\D/.test(rollNumber)) {
      newErrors.rollNumber = 'Roll number must contain only digits';
    }

    if (!department.trim()) {
      newErrors.department = 'Department is required';
    }

    // Custom form fields validation
    if (eventDetails?.registrationFormType === 'CUSTOM' && eventDetails.formFields) {
      eventDetails.formFields.forEach((field: any) => {
        // Skip base fields
        if (['Name', 'Roll Number', 'Email', 'Department'].includes(field.label)) return;

        if (field.isRequired && !customAnswers[field.id]?.trim()) {
          newErrors[`custom_${field.id}`] = `"${field.label}" is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Build custom answers array
    const answersList = Object.entries(customAnswers).map(([fieldId, value]) => ({
      fieldId,
      value,
    }));

    createMutation.mutate(
      {
        eventId: selectedEventId,
        name: name.trim(),
        email: email.trim(),
        roll_number: rollNumber.trim(),
        department: department.trim(),
        answers: answersList.length > 0 ? answersList : undefined,
      } as any,
      {
        onSuccess: (data: any) => {
          setSuccessData(data);
          onSuccess?.();
        },
        onError: (err: any) => {
          setErrors({ submit: err.message || 'Failed to register attendee. Please try again.' });
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] scale-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PlusCircle className={`h-5 w-5 ${accentCls}`} />
            <h2 className="text-base font-bold text-slate-800">On-Spot Registration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success View */}
        {successData ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col items-center text-center premium-scrollbar">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={24} className="stroke-[2.5]" />
            </div>
            
            <div>
              <h3 className="text-base font-bold text-slate-800">Attendee Registered Successfully!</h3>
              <p className="text-xs text-slate-400 mt-1">Ticket code generated and credentials emailed.</p>
            </div>

            {/* Ticket Card Details */}
            <div className="w-full max-w-sm border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50/50">
              <div className={`p-4 text-white text-left ${bgAccentCls}`}>
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-85">Boarding Pass</p>
                <h4 className="text-sm font-bold truncate mt-0.5">{eventDetails?.title || 'Event Ticket'}</h4>
              </div>
              <div className="p-5 text-left space-y-4 bg-white relative">
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Attendee</span>
                    <span className="font-bold text-slate-700">{successData.name || name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Roll Number</span>
                    <span className="font-bold text-slate-700">{successData.roll_number || rollNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Email</span>
                    <span className="font-bold text-slate-700 truncate block">{successData.email || email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Department</span>
                    <span className="font-bold text-slate-700">{successData.department || department}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 pt-4 flex flex-col items-center gap-3">
                  {successData.ticket?.qrCodeUrl ? (
                    <img
                      src={successData.ticket.qrCodeUrl}
                      alt="Ticket QR Code"
                      className="w-32 h-32 border border-slate-100 p-1 bg-white rounded-lg shadow-sm"
                    />
                  ) : (
                    <div className="w-32 h-32 border border-slate-200 rounded-lg flex items-center justify-center text-slate-300">
                      <QrCode size={40} className="stroke-[1.5]" />
                    </div>
                  )}
                  <div className="text-center">
                    <span className="text-[10.5px] font-mono font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-md border tracking-wider">
                      {successData.ticket?.ticketCode || 'EVT-CODE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 w-full max-w-sm">
              <button
                onClick={() => {
                  setSuccessData(null);
                  setName('');
                  setEmail('');
                  setRollNumber('');
                  setDepartment('');
                  setCustomAnswers({});
                  setErrors({});
                }}
                className={`flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer text-center`}
              >
                Register Another
              </button>
              <button
                onClick={onClose}
                className={`flex-1 py-2.5 text-white text-xs font-bold rounded-lg transition cursor-pointer text-center ${bgAccentCls}`}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 premium-scrollbar">
              
              {errors.submit && (
                <div className="flex items-start gap-2 p-3.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs leading-relaxed">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* Event Selector / Display */}
              {defaultEventId && eventDetails ? (
                <div className="flex items-center gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <div className={`w-10 h-10 rounded-lg ${isCore ? 'bg-[#FF9900]/10 text-[#FF9900]' : 'bg-[#232F3E]/10 text-[#232F3E]'} flex items-center justify-center shrink-0`}>
                    <Calendar size={18} className="stroke-[2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Target Event</span>
                    <h4 className="text-sm font-bold text-slate-800 truncate mt-0.5">{eventDetails.title}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium mt-1">
                      {eventDetails.date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400 stroke-[2]" />
                          {new Date(eventDetails.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                        </span>
                      )}
                      {eventDetails.date && eventDetails.venue && (
                        <span className="text-slate-300 select-none mx-0.5">•</span>
                      )}
                      {eventDetails.venue && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={12} className="text-slate-400 stroke-[2]" />
                          {eventDetails.venue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Select Event *</label>
                  <div className="relative">
                    <select
                      value={selectedEventId}
                      onChange={(e) => {
                        setSelectedEventId(e.target.value);
                        setCustomAnswers({});
                        setErrors({});
                      }}
                      className={`w-full appearance-none bg-slate-50 border ${errors.eventId ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200'} rounded-lg text-xs pl-3 pr-8 py-2.5 text-slate-700 focus:outline-none focus:ring-4 transition cursor-pointer font-medium ${borderFocusCls}`}
                    >
                      <option value="">Choose event...</option>
                      {openEvents.map((e) => (
                        <option key={e.id} value={e.id}>{e.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                  {errors.eventId && <p className="text-[10px] text-rose-500 mt-1">{errors.eventId}</p>}
                </div>
              )}

              {/* Attendee Details Card */}
              <div className="border border-slate-100 bg-slate-50/40 rounded-xl p-4.5 space-y-3.5">
                <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-2">Attendee Information</p>
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^a-zA-Z\s.-]/g, '');
                        setName(val);
                      }}
                      placeholder="e.g. John Doe"
                      className={`w-full bg-white border ${errors.name ? 'border-rose-300' : 'border-slate-200'} rounded-lg text-xs pl-9 pr-3 py-2.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 transition font-medium ${borderFocusCls}`}
                    />
                    <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  {errors.name && <p className="text-[10px] text-rose-500 mt-1">{errors.name}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">College Email *</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.trim())}
                      placeholder="username@rajalakshmi.edu.in"
                      className={`w-full bg-white border ${errors.email ? 'border-rose-300' : 'border-slate-200'} rounded-lg text-xs pl-9 pr-3 py-2.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 transition font-medium ${borderFocusCls}`}
                    />
                    <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  {errors.email && <p className="text-[10px] text-rose-500 mt-1">{errors.email}</p>}
                </div>

                {/* Roll Number & Department in a grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Roll Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Roll / Register Number *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={rollNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setRollNumber(val);
                        }}
                        placeholder="e.g. 211201100"
                        className={`w-full bg-white border ${errors.rollNumber ? 'border-rose-300' : 'border-slate-200'} rounded-lg text-xs pl-9 pr-3 py-2.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 transition font-medium ${borderFocusCls}`}
                      />
                      <School size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    {errors.rollNumber && <p className="text-[10px] text-rose-500 mt-1">{errors.rollNumber}</p>}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Department *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. CSE"
                        className={`w-full bg-white border ${errors.department ? 'border-rose-300' : 'border-slate-200'} rounded-lg text-xs pl-9 pr-3 py-2.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 transition font-medium ${borderFocusCls}`}
                      />
                      <Building size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    {errors.department && <p className="text-[10px] text-rose-500 mt-1">{errors.department}</p>}
                  </div>
                </div>

              </div>

              {/* Dynamic Custom Fields */}
              {selectedEventId && detailsLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-400 justify-center py-4">
                  <Loader2 size={13} className="animate-spin" />
                  <span>Fetching event custom fields...</span>
                </div>
              )}

              {selectedEventId && !detailsLoading && eventDetails?.registrationFormType === 'CUSTOM' && eventDetails?.formFields && eventDetails.formFields.length > 0 && (
                <div className="border border-slate-100 bg-slate-50/40 rounded-xl p-4.5 space-y-3.5">
                  <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-2">Event Custom Fields</p>
                  
                  {(eventDetails?.formFields || [])
                    .filter((field: any) => !['Name', 'Roll Number', 'Email', 'Department'].includes(field.label))
                    .map((field: any) => {
                      const isRequired = field.isRequired;
                      const hasErr = errors[`custom_${field.id}`];

                      return (
                        <div key={field.id}>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            {field.label} {isRequired && '*'}
                          </label>

                          {field.type === 'TEXTAREA' ? (
                            <textarea
                              rows={2.5}
                              value={customAnswers[field.id] || ''}
                              onChange={(e) => setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })}
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                              className={`w-full bg-white border ${hasErr ? 'border-rose-300' : 'border-slate-200'} rounded-lg text-xs px-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 transition resize-none font-medium ${borderFocusCls}`}
                            />
                          ) : field.type === 'SELECT' ? (
                            <div className="relative">
                              <select
                                value={customAnswers[field.id] || ''}
                                onChange={(e) => setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })}
                                className={`w-full appearance-none bg-white border ${hasErr ? 'border-rose-300' : 'border-slate-200'} rounded-lg text-xs pl-3 pr-8 py-2.5 text-slate-700 focus:outline-none focus:ring-4 transition cursor-pointer font-medium ${borderFocusCls}`}
                              >
                                <option value="">Select option...</option>
                                {Array.isArray(field.options?.choices) &&
                                  field.options.choices.map((choice: string) => (
                                    <option key={choice} value={choice}>{choice}</option>
                                  ))}
                              </select>
                              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                            </div>
                          ) : (
                            // Default text type or other
                            <input
                              type={field.type === 'NUMBER' ? 'number' : 'text'}
                              value={customAnswers[field.id] || ''}
                              onChange={(e) => setCustomAnswers({ ...customAnswers, [field.id]: e.target.value })}
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                              className={`w-full bg-white border ${hasErr ? 'border-rose-300' : 'border-slate-200'} rounded-lg text-xs px-3 py-2.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 transition font-medium ${borderFocusCls}`}
                            />
                          )}

                          {hasErr && <p className="text-[10px] text-rose-500 mt-1">{hasErr}</p>}
                        </div>
                      );
                    })}
                </div>
              )}

            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[10.5px] text-slate-400 font-medium">* Required fields</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className={`flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm ${bgAccentCls}`}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} />
                      Confirm Registration
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
