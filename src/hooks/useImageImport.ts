import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { wallsFromGray } from '../core/image/floorPlan';
import { grayFromRgba } from '../core/image/gray';
import { useStudioStore, type SourcePlan } from './useStudioStore';

const MAX_SIDE = 1200;

export async function decodeImageFile(file: File): Promise<SourcePlan> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  const rgba = ctx.getImageData(0, 0, width, height).data;
  const gray = grayFromRgba(rgba, width, height);
  return { name: file.name, width, height, walls: wallsFromGray(gray), gray };
}

export function useImageImport() {
  const loadPlan = useStudioStore((s) => s.loadPlan);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setBusy(true);
      setError(null);
      try {
        loadPlan(await decodeImageFile(file));
      } catch {
        setError(`Could not read ${file.name}. PNG, JPEG, BMP, GIF and WebP work.`);
      } finally {
        setBusy(false);
        event.target.value = '';
      }
    },
    [loadPlan],
  );

  const open = useCallback(() => inputRef.current?.click(), []);
  return { inputRef, onFile, open, error, busy };
}
