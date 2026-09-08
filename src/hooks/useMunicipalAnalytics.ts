import { useState, useEffect, useCallback } from 'react';
import type { MunicipalityId } from '@/types/onboarding';
import type {
  MunicipalCityDataset,
  AnalyticsTimeframe,
} from '@/types/municipalAnalytics';
import { municipalAnalyticsService } from '@/services/municipalAnalyticsService';

export function useMunicipalAnalytics(initialCity: MunicipalityId = 'helsinki') {
  const [selectedCity, setSelectedCity] = useState<MunicipalityId>(initialCity);
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('month');
  const [dataset, setDataset] = useState<MunicipalCityDataset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await municipalAnalyticsService.getCityAnalytics(selectedCity, timeframe);
      setDataset(data);
    } catch (e) {
      console.error('Failed to load municipal analytics', e);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, timeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const exportCSV = useCallback(() => {
    if (!dataset) return;
    const csv = municipalAnalyticsService.generateCSV(dataset);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `municipal-report-${dataset.municipalityId}-${timeframe}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [dataset, timeframe]);

  const exportPrint = useCallback(() => {
    window.print();
  }, []);

  return {
    selectedCity,
    timeframe,
    dataset,
    loading,
    setCity: setSelectedCity,
    setTimeframe,
    exportCSV,
    exportPrint,
    refresh: loadData,
  };
}
