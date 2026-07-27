'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { topicsService, type TopicData } from '@/services/roadmap.api';
import RoadmapBuilder from '@/components/Core/RoadmapBuilder';

export default function TopicRoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopic = async () => {
      try {
        setLoading(true);
        const data = await topicsService.getTopic(topicId);
        setTopic(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load topic:', err);
        setError(err?.message || 'Topic not found');
      } finally {
        setLoading(false);
      }
    };
    loadTopic();
  }, [topicId]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-amber-200 border-t-[#FF9900] animate-spin shadow-2xs" />
          <span className="text-xs text-slate-600 font-bold tracking-wider uppercase font-heading animate-pulse">Loading Roadmap Builder...</span>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen w-full bg-slate-55 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-lg font-bold text-slate-800 font-heading">Topic Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'The requested topic does not exist.'}</p>
          <button onClick={() => router.push('/core/topics')} className="bg-indigo-600 hover:bg-indigo-550 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all font-heading">
            Back to Topics
          </button>
        </div>
      </div>
    );
  }

  return (
    <RoadmapBuilder
      topicId={topicId}
      topicName={topic.name}
      topicNumber={topic.orderIndex !== undefined ? topic.orderIndex + 1 : undefined}
    />
  );
}
