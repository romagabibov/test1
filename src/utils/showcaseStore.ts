import { VideoShowcase, VideoHotspot, CultureRegion, GenderType } from '../types';
import { COSTUMES, VIDEO_SHOWCASES } from '../data/costumes';
import { SAMPLE_15SEC_SHOWCASE } from '../data/sample';
import { clamp } from './videoGeometry';

export { SAMPLE_15SEC_SHOWCASE } from '../data/sample';
export const STORAGE_KEY = 'azheritage_catalog_v8';
const LEGACY_KEY = 'azermiras_custom_showcases_v7';
export const REGIONS: Record<CultureRegion, string> = {
  karabakh: 'Карабах и Шуша', baku_absheron: 'Баку и Апшерон', shaki_shirvan: 'Шеки и Ширван',
  ganja_gazakh: 'Гянджа и Газах', nakhchivan: 'Нахчыван', lankaran: 'Ленкорань',
};
export const CATEGORIES: Record<GenderType, string> = {
  female: 'Женский', male: 'Мужской', unisex: 'Унисекс', wedding: 'Свадебный', festive: 'Праздничный', royal: 'Церемониальный',
};
export function findCostume(id: string) {
  return COSTUMES.find(c => c.id === id.replace(/^costume_/, ''));
}

export const DEFAULT_CATALOG: VideoShowcase[] = COSTUMES.map((costume, index) => {
  const existing = VIDEO_SHOWCASES.find(s => s.costumeId === costume.id);
  return {
    ...existing,
    id: existing?.id ?? `showcase_${costume.id}`,
    title: costume.title, subtitle: costume.nativeTitle,
    costumeId: costume.id, culture: costume.culture,
    region: costume.region, category: costume.gender,
    description: costume.description,
    durationSec: index === 0 ? SAMPLE_15SEC_SHOWCASE.durationSec : existing?.durationSec ?? 15,
    chapters: index === 0 ? SAMPLE_15SEC_SHOWCASE.chapters : existing?.chapters ?? [],
    hotspots: index === 0 ? SAMPLE_15SEC_SHOWCASE.hotspots : existing?.hotspots ?? [],
    ...(index === 0 ? { videoUrl: SAMPLE_15SEC_SHOWCASE.videoUrl, posterUrl: SAMPLE_15SEC_SHOWCASE.posterUrl, isTest15Sec: true } : {}),
  };
});

export function validMediaUrl(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value !== 'string') throw new Error('Некорректная ссылка на медиа.');
  if (/^\/(?!\/)/.test(value)) return value;
  if (/^https?:\/\//i.test(value)) return new URL(value).href;
  throw new Error('Укажите прямую HTTPS-ссылку или путь /media/имя-файла.');
}

export function normalizeCatalog(input: unknown): VideoShowcase[] {
  if (!Array.isArray(input) || input.length > 250) throw new Error('Каталог должен содержать не более 250 экспонатов.');
  const ids = new Set<string>();
  const number = (value: unknown, fallback: number, min: number, max: number) =>
    typeof value === 'number' && Number.isFinite(value) ? clamp(value, min, max) : fallback;
  const string = (value: unknown, fallback = '', max = 30000) => typeof value === 'string' ? value.slice(0, max) : fallback;
  return input.map((raw: any, index) => {
    if (!raw || typeof raw !== 'object') throw new Error('Повреждённая запись каталога.');
    const id = string(raw.id, '', 150);
    if (!id || ids.has(id)) throw new Error('У каждого экспоната должен быть уникальный ID.');
    ids.add(id);
    const costume = findCostume(string(raw.costumeId));
    const durationSec = number(raw.durationSec, 15, 0.1, 3600);
    const hotspotIds = new Set<string>();
    const hotspots: VideoHotspot[] = (Array.isArray(raw.hotspots) ? raw.hotspots.slice(0, 150) : []).map((h: any, i: number) => {
      const hid = string(h.id, `spot_${index}_${i}`, 150);
      if (hotspotIds.has(hid)) throw new Error('В одном видео ID меток не должны повторяться.');
      hotspotIds.add(hid);
      const timeSec = number(h.timeSec, 0, 0, durationSec);
      const trajectory = (Array.isArray(h.trajectory) ? h.trajectory.slice(0, 1000) : [])
        .map((k: any) => ({ timeSec: number(k.timeSec, 0, 0, durationSec), xPercent: number(k.xPercent, 50, 0, 100), yPercent: number(k.yPercent, 50, 0, 100) }))
        .sort((a: any, b: any) => a.timeSec - b.timeSec)
        .filter((k: any, n: number, all: any[]) => n === all.length - 1 || k.timeSec !== all[n + 1].timeSec);
      return {
        id: hid, timeSec, visibleDurationSec: number(h.visibleDurationSec, 4.5, 0.1, Math.max(0.1, durationSec - timeSec)),
        xPercent: number(h.xPercent, 50, 0, 100), yPercent: number(h.yPercent, 50, 0, 100),
        title: string(h.title, 'Деталь костюма', 500), partName: string(h.partName, '', 500), description: string(h.description),
        trajectory, culture: string(h.culture),
      };
    });
    const chapters = (Array.isArray(raw.chapters) ? raw.chapters.slice(0, 100) : []).map((c: any, i: number) => ({
      id: string(c.id, `chapter_${i}`, 150), title: string(c.title, 'Эпизод', 500),
      startSec: number(c.startSec, 0, 0, durationSec), durationSec: number(c.durationSec, 3, 0.1, durationSec),
      description: string(c.description),
    }));
    return {
      id, title: string(raw.title, 'Новый экспонат', 500), subtitle: string(raw.subtitle, '', 1000),
      description: string(raw.description), costumeId: costume?.id ?? string(raw.costumeId, '', 150),
      culture: string(raw.culture, 'Азербайджан', 500), durationSec,
      region: raw.region in REGIONS ? raw.region : costume?.region ?? 'karabakh',
      category: raw.category in CATEGORIES ? raw.category : costume?.gender ?? 'female',
      videoUrl: typeof raw.videoUrl === 'string' && raw.videoUrl.startsWith('blob:') ? undefined : validMediaUrl(raw.videoUrl),
      posterUrl: typeof raw.posterUrl === 'string' && raw.posterUrl.startsWith('blob:') ? undefined : validMediaUrl(raw.posterUrl),
      blobStorageId: string(raw.blobStorageId) || undefined, posterStorageId: string(raw.posterStorageId) || undefined,
      isCustomUploaded: !!raw.isCustomUploaded, isTest15Sec: !!raw.isTest15Sec, hotspots, chapters,
    };
  });
}

export function getInterpolatedHotspotCoord(hotspot: VideoHotspot, time: number): { x: number; y: number } {
  const frames = hotspot.trajectory;
  if (!frames?.length) return { x: hotspot.xPercent, y: hotspot.yPercent };
  // Stored trajectories are sorted once when saved/imported, never per animation frame.
  if (time <= frames[0].timeSec) return { x: frames[0].xPercent, y: frames[0].yPercent };
  const last = frames[frames.length - 1];
  if (time >= last.timeSec) return { x: last.xPercent, y: last.yPercent };
  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i], b = frames[i + 1];
    if (time >= a.timeSec && time <= b.timeSec) {
      const ratio = (time - a.timeSec) / Math.max(0.001, b.timeSec - a.timeSec);
      return { x: a.xPercent + (b.xPercent - a.xPercent) * ratio, y: a.yPercent + (b.yPercent - a.yPercent) * ratio };
    }
  }
  return { x: hotspot.xPercent, y: hotspot.yPercent };
}

let catalog = normalizeCatalog(DEFAULT_CATALOG);
let ready: Promise<void> | undefined;
const listeners = new Set<() => void>();
export const subscribeCatalog = (callback: () => void) => { listeners.add(callback); return () => { listeners.delete(callback); }; };
export const getSavedShowcases = () => catalog;
const emit = () => listeners.forEach(fn => fn());
export function hasLocalDraft(): boolean { try { return localStorage.getItem(STORAGE_KEY) !== null || localStorage.getItem(LEGACY_KEY) !== null; } catch { return false; } }

export function initializeCatalog(): Promise<void> {
  if (ready) return ready;
  ready = (async () => {
    const response = await fetch('/catalog.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Не удалось загрузить каталог.');
    const data = await response.json();
    const published = normalizeCatalog(data.showcases);
    let local: string | null = null;
    try { local = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY); } catch { /* Read-only browsing still works. */ }
    catalog = local === null ? published : normalizeCatalog(JSON.parse(local));
    emit();
  })();
  return ready;
}

export function saveShowcases(next: VideoShowcase[]): void {
  const validated = normalizeCatalog(next);
  // A failed write must never look like a successful save.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
  catalog = validated;
  emit();
}
export function updateShowcase(item: VideoShowcase) {
  const exists = catalog.some(s => s.id === item.id);
  saveShowcases(exists ? catalog.map(s => s.id === item.id ? item : s) : [...catalog, item]);
}
export function deleteShowcase(id: string) { saveShowcases(catalog.filter(s => s.id !== id)); }
export function resetShowcasesToDefault() { saveShowcases(DEFAULT_CATALOG); }

if (typeof window !== 'undefined') {
  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY || event.newValue === null) return;
    try { catalog = normalizeCatalog(JSON.parse(event.newValue)); emit(); } catch { /* Ignore incomplete writes from another tab. */ }
  });
}
