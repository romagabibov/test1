import { useCallback, useEffect, useRef, useState } from 'react';
import { loadVideoFromDb } from './videoDb';
import { VideoScrubber } from './videoScrubber';
import { clamp, getContainedMediaRect, MediaRect } from './videoGeometry';

export function useMediaSource(url?: string, storageId?: string) {
  const [state, setState] = useState({ src: storageId ? '' : url ?? '', error: '' });
  useEffect(() => {
    let alive = true;
    let createdUrl: string | null = null;
    if (!storageId) { setState({ src: url ?? '', error: '' }); return; }
    setState({ src: '', error: '' });
    loadVideoFromDb(storageId).then(src => {
      createdUrl = src;
      if (!alive && src) URL.revokeObjectURL(src);
      if (alive) setState(src ? { src, error: '' } : { src: '', error: 'Файл отсутствует в этом браузере. Загрузите видео заново в студии.' });
    }).catch(() => { if (alive) setState({ src: '', error: 'Браузер заблокировал хранилище видео.' }); });
    return () => { alive = false; if (createdUrl) URL.revokeObjectURL(createdUrl); };
  }, [url, storageId]);
  return state;
}

export function useVideo(src: string, fallbackDuration: number) {
  const ref = useRef<HTMLVideoElement>(null);
  const scrubber = useRef<VideoScrubber | null>(null);
  const requested = useRef(0);
  const [time, setTime] = useState(0);
  const [target, setTarget] = useState(0);
  const [duration, setDuration] = useState(fallbackDuration);
  const [size, setSize] = useState({ width: 16, height: 9 });
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [seeking, setSeeking] = useState(false);

  useEffect(() => {
    const video = ref.current;
    setTime(0); setTarget(0); requested.current = 0;
    setLoaded(false); setPlaying(false); setError(''); setSeeking(false); setDuration(fallbackDuration);
    if (!video || !src) return;
    let alive = true;
    let animation = 0;
    const controller = new VideoScrubber(video);
    scrubber.current = controller;
    const metadata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      setDuration(video.duration);
      setSize({ width: video.videoWidth || 16, height: video.videoHeight || 9 });
    };
    const sync = () => {
      if (!alive) return;
      setTime(video.currentTime);
      if (!video.paused) { setTarget(video.currentTime); requested.current = video.currentTime; }
    };
    const tick = () => { sync(); if (!video.paused && alive) animation = requestAnimationFrame(tick); };
    const onPlay = () => { setPlaying(true); cancelAnimationFrame(animation); animation = requestAnimationFrame(tick); };
    const onPause = () => { setPlaying(false); cancelAnimationFrame(animation); sync(); };
    const onReady = () => { metadata(); setLoaded(true); setError(''); clearTimeout(timeout); };
    const onError = () => {
      setError('Не удалось открыть видео. Проверьте ссылку и формат файла.');
      setLoaded(false); setPlaying(false); setSeeking(false); clearTimeout(timeout);
    };
    const onSeeking = () => setSeeking(true);
    const onSeeked = () => { setSeeking(false); sync(); };
    const timeout = window.setTimeout(() => {
      if (video.readyState < 2) setError('Видео загружается слишком долго. Проверьте соединение или попробуйте ещё раз.');
    }, 25000);
    const events: [string, EventListener][] = [
      ['loadedmetadata', metadata], ['loadeddata', onReady], ['canplay', onReady],
      ['play', onPlay], ['pause', onPause], ['ended', onPause], ['timeupdate', sync],
      ['seeked', onSeeked], ['seeking', onSeeking], ['error', onError],
    ];
    events.forEach(([name, fn]) => video.addEventListener(name, fn));
    if (video.readyState >= 2) onReady();
    return () => {
      alive = false; clearTimeout(timeout); cancelAnimationFrame(animation);
      events.forEach(([name, fn]) => video.removeEventListener(name, fn));
      controller.dispose(); scrubber.current = null; video.pause();
    };
  }, [src, fallbackDuration]);

  const seek = useCallback((value: number) => {
    const video = ref.current;
    if (!video || !Number.isFinite(value)) return;
    video.pause();
    const actualDuration = Number.isFinite(video.duration) ? video.duration : fallbackDuration;
    const next = clamp(value, 0, Math.max(0, actualDuration - 0.035));
    requested.current = next; setTarget(next);
    scrubber.current?.seek(next);
  }, [fallbackDuration]);

  const toggle = useCallback(async () => {
    const video = ref.current;
    if (!video || video.readyState < 2) return;
    if (!video.paused) { video.pause(); return; }
    scrubber.current?.cancel();
    if (video.currentTime >= video.duration - 0.08) video.currentTime = 0;
    try { await video.play(); setError(''); }
    catch { setError('Воспроизведение заблокировано браузером. Нажмите «Смотреть» ещё раз.'); }
  }, []);
  const pause = useCallback(() => ref.current?.pause(), []);
  return { ref, time, target, requested, duration, size, loaded, playing, error, seeking, seek, toggle, pause };
}

export function useMediaRect(container: React.RefObject<HTMLElement | null>, width: number, height: number): MediaRect {
  const [rect, setRect] = useState<MediaRect>({ left: 0, top: 0, width: 0, height: 0 });
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const update = () => setRect(getContainedMediaRect(element.clientWidth, element.clientHeight, width, height));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [container, width, height]);
  return rect;
}

export function formatTime(time: number, decimals = false) {
  const safe = Math.max(0, Number.isFinite(time) ? time : 0);
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0');
  const seconds = Math.floor(safe % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}${decimals ? `.${Math.floor(safe % 1 * 10)}` : ''}`;
}
