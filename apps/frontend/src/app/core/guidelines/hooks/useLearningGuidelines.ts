import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/services/roadmap.apiClient';
import { LearningGuideline, CreateGuidelineDto, UpdateGuidelineDto, GuidelineSettings, UpdateGuidelineSettingsDto } from '@/types/guideline.types';
import { showToast } from '@/components/Core/Toast';

export function useLearningGuidelines() {
  const [guidelines, setGuidelines] = useState<LearningGuideline[]>([]);
  const [settings, setSettings] = useState<GuidelineSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuidelines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<LearningGuideline[]>('/roadmap/guidelines/admin');
      setGuidelines(res.data);
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch learning guidelines.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setLoadingSettings(true);
      const res = await apiClient.get<GuidelineSettings>('/roadmap/guidelines/settings');
      setSettings(res.data);
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch learning guideline settings.';
      showToast(msg, 'error');
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    fetchGuidelines();
    fetchSettings();
  }, [fetchGuidelines, fetchSettings]);

  const createGuideline = async (dto: CreateGuidelineDto) => {
    try {
      setLoading(true);
      const res = await apiClient.post<LearningGuideline>('/roadmap/guidelines', dto);
      showToast('Learning guideline created successfully.', 'success');
      await fetchGuidelines();
      return res.data;
    } catch (err: any) {
      const msg = err?.message || 'Unable to save changes. Please try again.';
      showToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGuideline = async (id: string, dto: UpdateGuidelineDto) => {
    try {
      setLoading(true);
      const res = await apiClient.patch<LearningGuideline>(`/roadmap/guidelines/${id}`, dto);
      showToast('Learning guideline updated successfully.', 'success');
      await fetchGuidelines();
      return res.data;
    } catch (err: any) {
      const msg = err?.message || 'Unable to save changes. Please try again.';
      showToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGuideline = async (id: string) => {
    try {
      setLoading(true);
      await apiClient.delete(`/roadmap/guidelines/${id}`);
      showToast('Learning guideline removed successfully.', 'success');
      await fetchGuidelines();
    } catch (err: any) {
      const msg = err?.message || 'Failed to delete learning guideline.';
      showToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderGuidelines = async (ids: string[]) => {
    try {
      setLoading(true);
      await apiClient.post('/roadmap/guidelines/reorder', { ids });
      showToast('Ordering updated successfully.', 'success');
      await fetchGuidelines();
    } catch (err: any) {
      const msg = err?.message || 'Failed to reorder guidelines.';
      showToast(msg, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (dto: UpdateGuidelineSettingsDto) => {
    try {
      setLoadingSettings(true);
      const res = await apiClient.patch<GuidelineSettings>('/roadmap/guidelines/settings', dto);
      setSettings(res.data);
      showToast('Header settings updated successfully.', 'success');
      return res.data;
    } catch (err: any) {
      showToast('Unable to save settings. Please try again.', 'error');
      throw err;
    } finally {
      setLoadingSettings(false);
    }
  };

  return {
    guidelines,
    settings,
    loading,
    loadingSettings,
    error,
    refresh: fetchGuidelines,
    refreshSettings: fetchSettings,
    createGuideline,
    updateGuideline,
    deleteGuideline,
    reorderGuidelines,
    updateSettings,
  };
}
