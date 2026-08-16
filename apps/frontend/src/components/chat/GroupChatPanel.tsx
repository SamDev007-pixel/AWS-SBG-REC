"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  SendHorizontal,
  Paperclip,
  FileText,
  Download,
  X,
  User,
  Mic,
  MicOff,
  Shield,
  Clock
} from "lucide-react";

const AVATAR_PALETTE = [
  "#232F3E", // Deep Navy
  "#334155", // Slate Blue
  "#475569", // Slate
  "#1A222D", // Dark Slate
  "#64748B", // Cool Grey
  "#161D26", // Dark Navy
  "#4A5568", // Charcoal Grey
  "#718096", // Steel Grey
];

export function getAvatarColor(name: string) {
  if (!name) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

interface Attachment {
  type: string;
  url: string;
  name?: string;
  size?: number;
}

interface Message {
  id: string;
  senderName: string;
  senderRole: string;
  avatarColor: string;
  avatarInitials: string;
  avatarPhoto?: string | null;
  text: string;
  attachments?: Attachment[];
  timestamp: string;
  optimistic?: boolean;
}

interface AvatarProps {
  initials: string;
  color?: string;
  photo?: string | null;
  size?: number;
}

function Avatar({ initials, color, photo, size = 34 }: AvatarProps) {
  const src = typeof photo === 'object' && photo !== null ? (photo as any).photo : photo;

  const isValidPhoto = src && 
                       typeof src === 'string' && 
                       src.trim() !== "" && 
                       src !== "null" && 
                       src !== "undefined" && 
                       src !== "[object Object]";

  if (isValidPhoto) {
    return (
      <img
        src={src}
        alt={initials}
        className="rounded-full object-cover shrink-0 select-none shadow-2xs border border-slate-200"
        style={{ width: size, height: size }}
      />
    );
  }

  const iconSize = Math.floor(size * 0.5);

  return (
    <div
      className="rounded-full flex items-center justify-center text-white shrink-0 select-none shadow-2xs border border-slate-200 font-bold text-xs"
      style={{
        width: size,
        height: size,
        background: color || "#232F3E",
      }}
    >
      <User style={{ width: iconSize, height: iconSize }} strokeWidth={2.2} />
    </div>
  );
}

interface GroupChatPanelProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatar?: string | null;
  };
}

export default function GroupChatPanel({ user }: GroupChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userPhotos, setUserPhotos] = useState<Record<string, string>>({});
  const [isListening, setIsListening] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const toggleSpeechToText = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Google Chrome or Safari.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error("Failed to abort speech recognition:", e);
        }
        recognitionRef.current = null;
      }
      setIsListening(false);
    } else {
      setIsListening(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => {
            const trimmed = prev.trim();
            const newText = trimmed ? `${trimmed} ${transcript}` : transcript;
            
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.style.height = "auto";
                inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
              }
            }, 50);

            return newText;
          });
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/groupchat");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const msgs = data.data?.messages ?? data.messages ?? [];
      setMessages(msgs);
    } catch (err) {
      console.error("GroupChat fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPhotos = async () => {
    try {
      const res = await fetch("/api/auth");
      if (res.ok) {
        const data = await res.json();
        const users = data.data?.users || data.users || [];
        const photos: Record<string, string> = {};
        users.forEach((u: any) => {
          if (u.name && u.role && u.avatar?.photo) {
            photos[`${u.name.toLowerCase()}_${u.role.toLowerCase()}`] = u.avatar.photo;
          }
        });
        setUserPhotos(photos);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchMessages();
    fetchUserPhotos();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fileType = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : "file";

        setSelectedFiles((prev) => [
          ...prev,
          {
            file,
            name: file.name,
            type: fileType,
            previewUrl: fileType !== "file" ? URL.createObjectURL(file) : null,
            base64: reader.result as string,
            size: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => {
      const copy = [...prev];
      const removed = copy.splice(index, 1)[0];
      if (removed && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return copy;
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && selectedFiles.length === 0) || !user || sending) return;
    setSending(true);

    const text = inputText.trim();
    const attachments = selectedFiles.map((f) => ({
      type: f.type,
      url: f.base64,
      name: f.name,
      size: f.size,
    }));

    setInputText("");
    setSelectedFiles([]);
    if (inputRef.current) inputRef.current.style.height = "auto";

    const initials = user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    // Optimistic message
    const optimistic: Message = {
      id: `opt_${Date.now()}`,
      senderName: user.fullName,
      senderRole: user.role,
      avatarColor: user.role?.toLowerCase() === "core" ? getAvatarColor(user.fullName) : "#232F3E",
      avatarInitials: initials,
      avatarPhoto: user.avatar || null,
      text,
      attachments,
      timestamp: new Date().toISOString(),
      optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await fetch("/api/groupchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: user.fullName,
          senderRole: user.role,
          avatarColor: user.role?.toLowerCase() === "core" ? getAvatarColor(user.fullName) : "#232F3E",
          avatarInitials: initials,
          avatarPhoto: user.avatar || null,
          text,
          attachments,
        }),
      });
      await fetchMessages();
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const formatDateTime = (iso: string) => {
    try {
      if (!iso) return "";
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "";
    }
  };

  const formatDateDivider = (iso: string) => {
    try {
      if (!iso) return "Today";
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "Today";
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (d.toDateString() === today.toDateString()) return "Today";
      if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
      return d.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Today";
    }
  };

  // Group messages by date for dividers
  const grouped: Array<{ type: "divider"; label: string; key: string } | { type: "msg"; msg: Message }> = [];
  let lastDate = null;
  for (const msg of messages) {
    const d = msg.timestamp ? new Date(msg.timestamp) : new Date();
    const dateStr = isNaN(d.getTime()) ? "Today" : d.toDateString();
    if (dateStr !== lastDate) {
      grouped.push({
        type: "divider",
        label: formatDateDivider(msg.timestamp),
        key: `div_${msg.id || msg.timestamp}_${dateStr}`,
      });
      lastDate = dateStr;
    }
    grouped.push({ type: "msg", msg });
  }

  return (
    <div className="flex flex-col flex-1 h-full bg-white relative text-slate-800">
      <style>{`
        .chat-scrollbar::-webkit-scrollbar { width: 4px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: rgba(35, 47, 62, 0.15); border-radius: 99px; }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(35, 47, 62, 0.3); }
        @keyframes soundwave-pulse {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .wave-bar {
          display: inline-block;
          width: 3px;
          background-color: #FF9900;
          border-radius: 99px;
          animation: soundwave-pulse 0.8s ease-in-out infinite;
        }
      `}</style>

      {/* Chat Messages Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 chat-scrollbar bg-white"
      >
        <div className="flex flex-col justify-end min-h-full gap-3">
          {loading ? (
            <div className="text-center text-slate-400 text-xs font-semibold py-12">
              Loading chat messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="self-center bg-slate-50 border border-slate-200 rounded-xl p-5 text-center my-8 max-w-xs shadow-2xs select-none">
              <div className="text-2xl mb-1.5">💬</div>
              <div className="font-bold text-xs text-slate-800 mb-1">
                No messages yet
              </div>
              <div className="text-[11px] text-slate-500 leading-relaxed">
                Start the conversation with your team members.
              </div>
            </div>
          ) : (
            grouped.map((item) => {
              if (item.type === "divider") {
                return (
                  <div key={item.key} className="flex items-center my-3 select-none w-full">
                    <div className="flex-1 border-t border-slate-200"></div>
                    <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </span>
                    <div className="flex-1 border-t border-slate-200"></div>
                  </div>
                );
              }

              const { msg } = item;
              const isCore = msg.senderRole?.toLowerCase() === "core";
              const isSelf = user?.fullName && msg.senderName === user.fullName;

              return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex gap-3 px-3 py-2 rounded-lg transition-colors items-start w-full group",
                    isSelf ? "bg-slate-50/70" : "hover:bg-slate-50/40"
                  )}
                >
                  <div className="shrink-0 pt-0.5">
                    <Avatar
                      initials={msg.avatarInitials}
                      color={isCore ? "#FF9900" : "#232F3E"}
                      photo={userPhotos[`${msg.senderName.toLowerCase()}_${msg.senderRole.toLowerCase()}`] || msg.avatarPhoto}
                      size={32}
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    {/* Header: Name + Role Badge + Time */}
                    <div className="flex items-center gap-2 mb-0.5 select-none flex-wrap">
                      <span className="text-xs font-bold text-slate-900 tracking-tight">
                        {msg.senderName}
                      </span>
                      
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border",
                        isCore 
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      )}>
                        {isCore ? "Core" : "Crew"}
                      </span>

                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatDateTime(msg.timestamp)}
                      </span>
                    </div>

                    {/* Message Body */}
                    <div className="text-xs sm:text-[13px] leading-relaxed text-slate-800 font-normal whitespace-pre-wrap break-words">
                      {msg.text}
                    </div>

                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2 w-full">
                        {msg.attachments.map((att, attIdx) => (
                          <div
                            key={attIdx}
                            className="rounded-lg overflow-hidden max-w-xs border border-slate-200 bg-white shadow-2xs"
                          >
                            {att.type === "image" ? (
                              <img
                                src={att.url}
                                alt="attachment"
                                className="w-full max-h-48 object-contain cursor-zoom-in bg-slate-50 hover:opacity-95 transition-opacity"
                                onClick={() => {
                                  const w = window.open();
                                  w?.document.write(`<img src="${att.url}" style="max-width:100%; max-height:100vh; display:block; margin:auto;" />`);
                                }}
                              />
                            ) : att.type === "video" ? (
                              <video src={att.url} controls className="w-full max-h-48" />
                            ) : (
                              <a
                                href={att.url}
                                download={att.name || "file"}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-all select-none"
                              >
                                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold truncate text-[11px]">{att.name || "Document"}</div>
                                  <div className="text-[9px] text-slate-400">
                                    {att.size ? `${(att.size / 1024).toFixed(1)} KB` : "File"}
                                  </div>
                                </div>
                                <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* File Previews Area */}
      {selectedFiles.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 p-2.5 flex gap-2 flex-wrap">
          {selectedFiles.map((item, idx) => (
            <div
              key={idx}
              className="relative w-14 h-14 rounded-lg border border-slate-200 bg-slate-900 flex items-center justify-center overflow-hidden shadow-2xs animate-fadeIn"
            >
              {item.type === "image" ? (
                <img
                  src={item.previewUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : item.type === "video" ? (
                <video src={item.previewUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center p-1 text-white text-center">
                  <FileText className="w-5 h-5 text-slate-300 mb-0.5" />
                  <div className="text-[7px] truncate w-10 font-bold font-mono">
                    {item.name}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeSelectedFile(idx)}
                className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer border-none"
              >
                <X className="w-2 h-2" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Composer Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 pb-3.5 sm:p-3.5 border-t border-slate-200 bg-white flex items-center gap-2 sm:gap-2.5 shrink-0 z-20"
      >
        {isListening && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#232F3E] text-white rounded-full px-3.5 py-1.5 shadow-md flex items-center gap-2 z-50 animate-pulse">
            <span className="flex gap-1 items-end justify-center h-3 w-5">
              <span className="wave-bar" style={{ animationDelay: "0s" }}></span>
              <span className="wave-bar" style={{ animationDelay: "0.15s" }}></span>
              <span className="wave-bar" style={{ animationDelay: "0.3s" }}></span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-200">Listening...</span>
          </div>
        )}

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-slate-500 hover:text-[#FF9900] bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors shrink-0 cursor-pointer border-none"
          title="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
        />

        {/* Voice Speech to Text Button */}
        <button
          type="button"
          onClick={toggleSpeechToText}
          className={cn(
            "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-colors shrink-0 cursor-pointer border",
            isListening 
              ? "bg-amber-50 border-amber-300 text-[#FF9900] animate-pulse" 
              : "bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-500 hover:text-[#FF9900]"
          )}
          title={isListening ? "Stop listening" : "Voice dictation"}
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Textarea Input Container */}
        <div className="flex-1 bg-slate-50 hover:bg-slate-100/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100 focus-within:border-slate-400 border border-slate-200 rounded-lg px-3 py-2 flex items-center min-w-0 transition-all min-h-[38px] sm:min-h-[40px]">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full bg-transparent border-none outline-none focus:outline-none resize-none max-h-32 text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 leading-normal p-0 chat-scrollbar"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!inputText.trim() && selectedFiles.length === 0) || sending}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-[#232F3E] hover:bg-slate-800 text-white shadow-xs shrink-0 transition-all cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
          title="Send message"
        >
          <SendHorizontal className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
