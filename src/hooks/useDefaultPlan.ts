import { useEffect } from 'react';
import { DEFAULT_MAP_NAME, DEFAULT_MAP_URL } from '../config/defaults';
import { decodeImageFile } from './useImageImport';
import { useStudioStore } from './useStudioStore';

/** Fetches the shipped floor plan so robot radius and resolution can be changed on it. */
export function useDefaultPlan(): void {
  const loadPlan = useStudioStore((s) => s.loadPlan);
  useEffect(() => {
    let cancelled = false;
    fetch(DEFAULT_MAP_URL)
      .then((r) => r.blob())
      .then((blob) => decodeImageFile(new File([blob], DEFAULT_MAP_NAME, { type: 'image/png' })))
      .then((plan) => {
        if (!cancelled) loadPlan(plan);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [loadPlan]);
}
