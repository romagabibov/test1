import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowLeft, Check, Download, Eye, Film, ImagePlus, MapPin, Pause, Play, Plus, Save, Trash2, Upload, X, Crosshair, AlertCircle, ChevronRight } from 'lucide-react';
import { HotspotTrajectoryKeyframe, VideoHotspot, VideoShowcase } from '../types';
import { CATEGORIES, deleteShowcase, getInterpolatedHotspotCoord, getSavedShowcases, normalizeCatalog, REGIONS, subscribeCatalog, updateShowcase, validMediaUrl } from '../utils/showcaseStore';
import { inspectVideo, saveVideoToDb } from '../utils/videoDb';
import { formatTime, useMediaRect, useMediaSource, useVideo } from '../utils/useVideo';
import { exportCatalog, importCatalog } from '../utils/catalogArchive';
import { CostumeArt } from './CostumeArt';
import { clamp } from '../utils/videoGeometry';
import { Dialog } from './Dialog';

const clone = <T,>(value: T): T => structuredClone(value);
const fresh = (): VideoShowcase => ({ id: `showcase_${crypto.randomUUID()}`, title: '', subtitle: '', culture: 'Азербайджан', costumeId: '', region: 'karabakh', category: 'female', durationSec: 15, description: '', chapters: [], hotspots: [] });
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Не удалось выполнить действие.';

export default function AdminStudio({ onClose, onPreview }: { onClose(): void; onPreview(id: string): void }) {
  const catalog = useSyncExternalStore(subscribeCatalog, getSavedShowcases);
  const [draft, setDraft] = useState<VideoShowcase>(() => clone(catalog[0] ?? fresh()));
  const [baseline, setBaseline] = useState(() => JSON.stringify(draft));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'metadata' | 'hotspots' | 'chapters'>('metadata');
  const [url, setUrl] = useState(draft.videoUrl ?? '');
  const [placement, setPlacement] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState('');
  const [help, setHelp] = useState(true);
  const [actualDuration, setActualDuration] = useState<number | null>(null);
  const videoFile = useRef<HTMLInputElement>(null);
  const posterFile = useRef<HTMLInputElement>(null);
  const importFile = useRef<HTMLInputElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const mediaSource = useMediaSource(draft.videoUrl, draft.blobStorageId);
  const media = useVideo(mediaSource.src, draft.durationSec);
  const rect = useMediaRect(viewport, media.size.width, media.size.height);
  const dirty = baseline !== JSON.stringify(draft);
  const selected = draft.hotspots.find(h => h.id === selectedId);
  const [mobileList, setMobileList] = useState(false);
  const [pendingImport, setPendingImport] = useState<File | null>(null);

  const status = (text: string, error = false) => { setMessage(text); setFailed(error); };
  useEffect(() => {
    const unload = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', unload);
    return () => window.removeEventListener('beforeunload', unload);
  }, [dirty]);
  // Use actual media duration for placement even when old metadata was incorrect.
  useEffect(() => { setActualDuration(media.loaded ? media.duration : null); }, [media.loaded, media.duration]);
  const length = actualDuration ?? draft.durationSec;
  const change = (patch: Partial<VideoShowcase>) => setDraft(current => ({ ...current, ...patch }));
  const changeHotspot = (patch: Partial<VideoHotspot>) => setDraft(current => ({ ...current, hotspots: current.hotspots.map(h => h.id === selectedId ? { ...h, ...patch } : h) }));
  const okayToLeave = () => !dirty || window.confirm('Есть несохранённые изменения. Продолжить без сохранения?');
  function choose(item: VideoShowcase) {
    if (busy || !okayToLeave()) return;
    media.pause(); setDraft(clone(item)); setBaseline(JSON.stringify(item)); setSelectedId(null);
    setUrl(item.videoUrl ?? ''); setPlacement(false); setMessage(''); setMobileList(false); setActualDuration(null);
  }
  function save() {
    try {
      if (!draft.title.trim()) throw new Error('Введите название экспоната.');
      for (const hotspot of draft.hotspots) {
        if (!hotspot.title.trim()) throw new Error('Добавьте название каждой метке.');
        if (hotspot.timeSec >= length || hotspot.timeSec + (hotspot.visibleDurationSec ?? 4.5) > length + 0.02) throw new Error(`Время метки «${hotspot.title}» выходит за конец видео. Исправьте начало и конец показа.`);
      }
      const normalized = normalizeCatalog([{ ...draft, title: draft.title.trim(), durationSec: length }])[0];
      updateShowcase(normalized); setDraft(normalized); setBaseline(JSON.stringify(normalized));
      status('Черновик сохранён в этом браузере. Для публикации скачайте сайт.');
      return normalized;
    } catch (error) { status(errorText(error), true); return null; }
  }
  async function uploadVideo(file?: File) {
    if (!file) return;
    setBusy('Проверяем и сохраняем видео…'); media.pause();
    let temp = '';
    try {
      if (!/\.(mp4|webm|mov|m4v)$/i.test(file.name)) throw new Error('Выберите MP4, WebM или MOV. Рекомендуется MP4 с кодеком H.264.');
      if (file.size > 150 * 1024 * 1024) throw new Error('Один файл — максимум 150 МБ. Для большего видео используйте прямую ссылку.');
      temp = URL.createObjectURL(file);
      const details = await inspectVideo(temp);
      const id = `video_${crypto.randomUUID()}`;
      await saveVideoToDb(id, file);
      let posterId: string | undefined;
      if (details.poster) { posterId = `poster_${crypto.randomUUID()}`; await saveVideoToDb(posterId, details.poster); }
      change({ videoUrl: undefined, blobStorageId: id, posterStorageId: posterId, posterUrl: undefined, durationSec: details.duration, isCustomUploaded: true, isTest15Sec: false });
      setUrl(''); setActualDuration(details.duration);
      status(`Видео добавлено: ${formatTime(details.duration, true)}, ${details.width} × ${details.height}. Проверьте метки и сохраните экспонат.`);
    } catch (error) { status(errorText(error), true); }
    finally { if (temp) URL.revokeObjectURL(temp); setBusy(''); if (videoFile.current) videoFile.current.value = ''; }
  }
  async function applyUrl() {
    setBusy('Проверяем ссылку…'); media.pause();
    try {
      const source = validMediaUrl(url.trim());
      if (!source) throw new Error('Введите прямую ссылку на видео.');
      const details = await inspectVideo(source);
      change({ videoUrl: source, blobStorageId: undefined, durationSec: details.duration, isCustomUploaded: false, isTest15Sec: false });
      setActualDuration(details.duration); status('Видео доступно. Сохраните изменения.');
    } catch (error) { status(errorText(error), true); }
    finally { setBusy(''); }
  }
  async function uploadPoster(file?: File) {
    if (!file) return;
    setBusy('Добавляем обложку…');
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) throw new Error('Выберите JPG, PNG или WebP до 8 МБ.');
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(900, bitmap.width); canvas.height = canvas.width * bitmap.height / bitmap.width;
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
      const blob = await new Promise<Blob | null>(done => canvas.toBlob(done, 'image/jpeg', 0.85));
      if (!blob) throw new Error('Не удалось обработать обложку.');
      const id = `poster_${crypto.randomUUID()}`; await saveVideoToDb(id, blob);
      change({ posterStorageId: id, posterUrl: undefined }); status('Обложка добавлена. Сохраните изменения.');
    } catch (error) { status(errorText(error), true); } finally { setBusy(''); if (posterFile.current) posterFile.current.value = ''; }
  }
  function addHotspot() {
    if (!media.loaded) return status('Сначала добавьте видео и дождитесь загрузки.', true);
    media.pause();
    const start = Math.min(media.time, Math.max(0, length - 0.2));
    const hotspot: VideoHotspot = { id: `spot_${crypto.randomUUID()}`, timeSec: Number(start.toFixed(2)), visibleDurationSec: Math.min(4.5, length - start), title: 'Новая деталь', partName: '', description: '', xPercent: 50, yPercent: 50, trajectory: [] };
    change({ hotspots: [...draft.hotspots, hotspot] }); setSelectedId(hotspot.id); setMode('hotspots'); setPlacement(true);
    status('Нажмите на нужную деталь в кадре. Координаты считаются по самому видео.');
  }
  function placePoint(event: React.PointerEvent<HTMLDivElement>) {
    if (!placement || !selected || !media.loaded) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - box.left - rect.left, y = event.clientY - box.top - rect.top;
    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
    const coords = { xPercent: Number((x / rect.width * 100).toFixed(2)), yPercent: Number((y / rect.height * 100).toFixed(2)) };
    if (tracking) {
      const time = Number(media.time.toFixed(2));
      if (time < selected.timeSec || time > selected.timeSec + (selected.visibleDurationSec ?? 4.5)) return status('Выберите кадр внутри времени показа этой метки.', true);
      const trajectory = [...(selected.trajectory ?? []).filter(k => Math.abs(k.timeSec - time) > 0.02), { timeSec: time, ...coords }].sort((a, b) => a.timeSec - b.timeSec);
      changeHotspot({ trajectory }); status(`Положение на ${formatTime(time, true)} записано.`);
    } else { changeHotspot({ ...coords, trajectory: [] }); setPlacement(false); status('Положение метки обновлено.'); }
  }
  async function exportAction(complete: boolean) {
    if (dirty && !save()) return;
    media.pause(); setBusy(complete ? 'Собираем сайт с видео и метками…' : 'Собираем резервную копию…');
    try { await exportCatalog(complete); status(complete ? 'ZIP сайта скачан. Загрузите его на хостинг, чтобы опубликовать изменения.' : 'Резервная копия скачана вместе с загруженными видео.'); }
    catch (error) { status(errorText(error), true); }
    finally { setBusy(''); }
  }
  async function importAction(file?: File) {
    if (!file) return;
    setPendingImport(null);
    setBusy('Восстанавливаем каталог…'); media.pause();
    try {
      const entries = await importCatalog(file);
      const item = entries[0] ?? fresh(); setDraft(clone(item)); setBaseline(JSON.stringify(item)); setSelectedId(null); setUrl(item.videoUrl ?? '');
      status(`Импортировано экспонатов: ${entries.length}. Это локальный черновик; для публикации скачайте сайт.`);
    } catch (error) { status(errorText(error), true); }
    finally { setBusy(''); if (importFile.current) importFile.current.value = ''; }
  }
  function remove() {
    if (!window.confirm(`Удалить «${draft.title || 'Новый экспонат'}» из каталога?`)) return;
    try {
      deleteShowcase(draft.id);
      const item = getSavedShowcases()[0] ?? fresh();
      setDraft(clone(item)); setBaseline(JSON.stringify(item)); setSelectedId(null); setUrl(item.videoUrl ?? ''); status('Экспонат удалён из локального каталога.');
    } catch (error) { status(errorText(error), true); }
  }
  const point = selected ? getInterpolatedHotspotCoord(selected, media.time) : null;
  const numberInput = (label: string, value: number, onChange: (value: number) => void, max = 100, min = 0, step = '0.1') => <label className="field"><span>{label}</span><input type="number" value={Number(value.toFixed(2))} min={min} max={max} step={step} onChange={e => { if (e.target.value !== '') onChange(clamp(Number(e.target.value), min, max)); }}/></label>;
  return <div className="studio">
    <header className="studio-header"><button className="back-link" disabled={!!busy} onClick={() => { if (okayToLeave()) onClose(); }}><ArrowLeft size={18}/><span>Каталог</span></button><div><h1>Студия проекта<span className="draft-badge">Локальный черновик</span></h1><p>Видео, метки и истории костюмов</p></div><button className="button button-gold" disabled={!!busy} onClick={save}><Save size={16}/><span>Сохранить</span>{dirty && <span className="unsaved-dot" aria-label="Есть несохранённые изменения"/>}</button></header>
    <div className="studio-publish-note"><InfoIcon/><p>Изменения видны <strong>только в этом браузере</strong>. Чтобы обновить сайт для всех: <strong>«Скачать сайт» → загрузить ZIP на хостинг.</strong></p><button className="text-button" onClick={() => setHelp(!help)}>{help ? 'Скрыть' : 'Подробнее'}</button></div>
    {help && <div className="studio-guide"><span>1. Выберите или создайте костюм</span><ChevronRight size={13}/><span>2. Загрузите видео</span><ChevronRight size={13}/><span>3. Поставьте метки на кадрах</span><ChevronRight size={13}/><span>4. Сохраните и скачайте сайт</span></div>}
    <div className="studio-layout">
      <aside className={`studio-catalog ${mobileList ? 'is-expanded' : ''}`}><button className="studio-list-toggle" onClick={() => setMobileList(!mobileList)}>Экспонаты ({catalog.length}) <ChevronRight size={17}/></button><div className="studio-catalog-inner"><div className="sidebar-title"><h2>Экспонаты <span className="muted">{catalog.length}</span></h2><button className="icon-button" disabled={!!busy} onClick={() => choose(fresh())} aria-label="Создать экспонат"><Plus size={18}/></button></div><div className="studio-items">{catalog.map(item => <button className={item.id === draft.id ? 'active' : ''} key={item.id} disabled={!!busy} onClick={() => choose(item)}><span className="mini-dot"/><span>{item.title}<small>{item.hotspots.length} меток · {item.videoUrl || item.blobStorageId ? 'с видео' : 'без видео'}</small></span></button>)}</div><button className="button button-outline" disabled={!!busy} onClick={() => choose(fresh())}><Plus size={16}/> Новый экспонат</button><div className="studio-export"><p className="eyebrow">ПУБЛИКАЦИЯ И КОПИИ</p><button className="button button-gold" disabled={!!busy} onClick={() => void exportAction(true)}><Download size={16}/> Скачать сайт</button><button className="text-button" disabled={!!busy} onClick={() => void exportAction(false)}><Download size={15}/> Резервная копия</button><button className="text-button" disabled={!!busy} onClick={() => importFile.current?.click()}><Upload size={15}/> Импорт каталога</button></div></div></aside>
      <section className="studio-workspace" aria-label="Редактор видео">
        <div className="workspace-heading"><div><p className="eyebrow">ВИДЕО И УКАЗАТЕЛИ</p><h2>{draft.title || 'Новый экспонат'}</h2></div><button className="icon-button" disabled={!!busy} title="Предпросмотр сохранённого экспоната" aria-label="Предпросмотр" onClick={() => { const saved = save(); if (saved) onPreview(saved.id); }}><Eye size={19}/></button></div>
        <div className={`editor-viewport ${placement ? 'placement-mode' : ''}`} ref={viewport} onPointerDown={placePoint}>
          {mediaSource.src ? <video ref={media.ref} src={mediaSource.src} muted playsInline preload="auto" aria-label="Видео для редактирования"/> : <CostumeArt item={draft} className="editor-art"/>}
          {media.loaded && <div className="hotspot-plane" style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}>{draft.hotspots.filter(h => h.id === selectedId || (media.time >= h.timeSec && media.time <= h.timeSec + (h.visibleDurationSec ?? 4.5))).map((h, i) => {
            const pos = h.id === selectedId && point ? point : getInterpolatedHotspotCoord(h, media.time);
            return <button key={h.id} className={`hotspot editor-hotspot ${h.id === selectedId ? 'selected' : ''}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} aria-label={`Редактировать метку: ${h.title}`} onPointerDown={e => e.stopPropagation()} onClick={() => { setSelectedId(h.id); setMode('hotspots'); }}>{draft.hotspots.findIndex(s => s.id === h.id) + 1}</button>;
          })}</div>}
          {placement && <span className="placement-hint"><Crosshair size={15}/>{tracking ? 'Кликните по детали на текущем кадре' : 'Нажмите на деталь одежды в видео'}</span>}
          {(media.error || mediaSource.error) && <p className="editor-error" role="alert">{media.error || mediaSource.error}</p>}
        </div>
        <div className="editor-player"><button className="icon-button" disabled={!media.loaded || !!busy} onClick={() => void media.toggle()} aria-label={media.playing ? 'Пауза в редакторе' : 'Воспроизвести в редакторе'}>{media.playing ? <Pause size={18}/> : <Play size={18}/>}</button><span>{formatTime(media.time, true)}</span><input className="timeline" type="range" min="0" max={length} step="0.01" value={media.target} disabled={!media.loaded || !!busy} aria-label="Кадр для метки" onChange={e => media.seek(Number(e.target.value))}/><span>{formatTime(length, true)}</span></div>
        <div className="editor-actions"><button className="button button-outline" disabled={!media.loaded || !!busy} onClick={addHotspot}><MapPin size={16}/> Добавить метку</button><button className="text-button" disabled={!!busy} onClick={() => videoFile.current?.click()}><Upload size={16}/> Загрузить видео</button><span className="small muted">MP4 / WebM · до 150 МБ</span></div>
        <div className="marker-timeline" aria-label="Метки на временной шкале">{draft.hotspots.map((h, index) => <button key={h.id} className={selectedId === h.id ? 'selected' : ''} style={{ left: `${h.timeSec / length * 100}%`, width: `${Math.min(h.visibleDurationSec ?? 4.5, length - h.timeSec) / length * 100}%` }} onClick={() => { setSelectedId(h.id); setMode('hotspots'); media.seek(h.timeSec); }} title={`${h.title}: ${formatTime(h.timeSec)}–${formatTime(h.timeSec + (h.visibleDurationSec ?? 4.5))}`}><span>{index + 1}</span>{h.title}</button>)}</div>
        <p className="small muted editor-tip">Метки привязаны к пропорциям видео. Чёрные поля не входят в координаты. Предпросмотр меток идёт по фактическому кадру.</p>
        {(message || busy) && <div className={`studio-status ${failed && !busy ? 'error' : ''}`} role={failed && !busy ? 'alert' : 'status'}>{busy ? <span className="spinner"/> : failed ? <AlertCircle size={18}/> : <Check size={18}/>}<span>{busy || message}</span></div>}
      </section>
      <aside className="studio-inspector"><div className="editor-tabs" role="tablist" aria-label="Настройки экспоната">{[['metadata','Костюм'],['hotspots','Метки'],['chapters','Эпизоды']].map(([id, title]) => <button key={id} role="tab" aria-selected={mode === id} onClick={() => setMode(id as typeof mode)}>{title}</button>)}</div>
        <fieldset disabled={!!busy} className="inspector-fields">
          {mode === 'metadata' && <>
            <label className="field"><span>Название костюма *</span><input maxLength={500} value={draft.title} onChange={e => change({ title: e.target.value })} placeholder="Например, Карабахский знатный наряд"/></label>
            <label className="field"><span>Название на азербайджанском / подзаголовок</span><input value={draft.subtitle} onChange={e => change({ subtitle: e.target.value })}/></label>
            <div className="field-row"><label className="field"><span>Регион</span><select value={draft.region} onChange={e => change({ region: e.target.value as VideoShowcase['region'] })}>{Object.entries(REGIONS).map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label><label className="field"><span>Тип костюма</span><select value={draft.category} onChange={e => change({ category: e.target.value as VideoShowcase['category'] })}>{Object.entries(CATEGORIES).map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label></div>
            <label className="field"><span>Культура / страна</span><input value={draft.culture ?? ''} onChange={e => change({ culture: e.target.value })}/></label>
            <label className="field"><span>Описание экспоната</span><textarea rows={6} value={draft.description ?? ''} onChange={e => change({ description: e.target.value })}/></label>
            <div className="form-divider"/>
            <label className="field"><span>Прямая ссылка на видео</span><input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…/costume.mp4"/></label>
            <button className="button button-outline" onClick={() => void applyUrl()} disabled={!url.trim()}><Film size={15}/> Проверить и применить</button>
            <p className="small muted">Ссылка на MP4/WebM, а не страницу YouTube. Длительность определяется автоматически.</p>
            {(draft.videoUrl || draft.blobStorageId) && <button className="text-button danger" onClick={() => { if (window.confirm('Убрать видео из этого экспоната? Метки сохранятся.')) { media.pause(); change({ videoUrl: undefined, blobStorageId: undefined }); setUrl(''); } }}>Убрать видео</button>}
            <button className="button button-outline" onClick={() => posterFile.current?.click()}><ImagePlus size={15}/> Загрузить обложку</button><p className="small muted">JPG, PNG, WebP · до 8 МБ. Для загруженного файла обложка создаётся автоматически.</p>
            <div className="form-divider"/><button className="text-button danger" onClick={remove}><Trash2 size={15}/> Удалить экспонат</button>
          </>}
          {mode === 'hotspots' && <>
            <div className="inspector-marker-list">{draft.hotspots.map((h, i) => <button key={h.id} className={selectedId === h.id ? 'active' : ''} onClick={() => { setSelectedId(h.id); media.seek(h.timeSec); }}><span>{i + 1}</span>{h.title}</button>)}</div>
            {!selected ? <div className="inspector-empty"><MapPin size={25}/><h3>История начинается с детали</h3><p>Остановитесь на нужном кадре и добавьте метку.</p><button className="button button-gold" onClick={addHotspot} disabled={!media.loaded}><Plus size={15}/> Добавить метку</button></div> : <>
              <label className="field"><span>Название детали *</span><input value={selected.title} onChange={e => changeHotspot({ title: e.target.value })}/></label>
              <label className="field"><span>Короткая категория</span><input value={selected.partName} onChange={e => changeHotspot({ partName: e.target.value })} placeholder="Головной убор / украшение"/></label>
              <label className="field"><span>Текст во всплывающем окне</span><textarea rows={7} value={selected.description} onChange={e => changeHotspot({ description: e.target.value })} placeholder="Расскажите об этой детали…"/></label>
              <div className="field-row">{numberInput('Появление, сек', selected.timeSec, value => changeHotspot({ timeSec: Math.min(value, length - 0.1), visibleDurationSec: Math.min(selected.visibleDurationSec ?? 4.5, length - value) }), length - 0.1)}{numberInput('Длительность, сек', selected.visibleDurationSec ?? 4.5, value => changeHotspot({ visibleDurationSec: value }), Math.max(0.1, length - selected.timeSec), 0.1)}</div>
              <div className="field-row">{numberInput('X, % видео', selected.xPercent, value => changeHotspot({ xPercent: value, trajectory: [] }))}{numberInput('Y, % видео', selected.yPercent, value => changeHotspot({ yPercent: value, trajectory: [] }))}</div>
              <button className={`button ${placement ? 'button-gold' : 'button-outline'}`} onClick={() => { media.pause(); setPlacement(!placement); }}>{placement ? <X size={15}/> : <Crosshair size={15}/>} {placement ? 'Завершить расстановку' : 'Указать на кадре'}</button>
              <label className="checkbox-label"><input type="checkbox" checked={tracking} onChange={e => { setTracking(e.target.checked); setPlacement(e.target.checked); media.pause(); }}/> Движение метки по ключевым кадрам</label>
              <p className="small muted">Для движущейся детали: включите отслеживание, выберите другой кадр и снова укажите положение. Между кадрами метка перемещается плавно.</p>
              {(selected.trajectory?.length ?? 0) > 0 && <div className="keyframes"><p className="eyebrow">КЛЮЧЕВЫЕ КАДРЫ</p>{selected.trajectory?.map((keyframe, i) => <div key={`${keyframe.timeSec}_${i}`}><button onClick={() => media.seek(keyframe.timeSec)}>{formatTime(keyframe.timeSec, true)} <span>{keyframe.xPercent.toFixed(1)}%, {keyframe.yPercent.toFixed(1)}%</span></button><button aria-label={`Удалить кадр ${i + 1}`} onClick={() => changeHotspot({ trajectory: selected.trajectory?.filter((_, n) => n !== i) })}><X size={14}/></button></div>)}</div>}
              <button className="text-button danger" onClick={() => { change({ hotspots: draft.hotspots.filter(h => h.id !== selected.id) }); setSelectedId(null); setPlacement(false); }}><Trash2 size={15}/> Удалить метку</button>
            </>}
          </>}
          {mode === 'chapters' && <><p className="small muted">Эпизоды помогают зрителю быстро перейти к нужной части видео.</p>{draft.chapters.map((chapter, index) => <div className="chapter-editor" key={`${chapter.id}_${index}`}><label className="field"><span>Название эпизода {index + 1}</span><input value={chapter.title} onChange={e => change({ chapters: draft.chapters.map((c, n) => n === index ? { ...c, title: e.target.value } : c) })}/></label>{numberInput('Начало, сек', chapter.startSec, value => change({ chapters: draft.chapters.map((c, n) => n === index ? { ...c, startSec: value } : c) }), length)}<button className="text-button danger" onClick={() => change({ chapters: draft.chapters.filter((_, n) => n !== index) })}><Trash2 size={14}/> Удалить эпизод</button></div>)}<button className="button button-outline" onClick={() => change({ chapters: [...draft.chapters, { id: crypto.randomUUID(), title: 'Новый эпизод', startSec: media.time, durationSec: 3 }] })}><Plus size={15}/> Добавить эпизод</button></>}
        </fieldset>
      </aside>
    </div>
    <input ref={videoFile} type="file" className="sr-only" accept="video/mp4,video/webm,video/quicktime,.m4v" aria-label="Загрузить видеофайл" onChange={e => void uploadVideo(e.target.files?.[0])}/>
    <input ref={posterFile} type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" aria-label="Загрузить обложку" onChange={e => void uploadPoster(e.target.files?.[0])}/>
    <input ref={importFile} type="file" className="sr-only" accept=".zip,.json" aria-label="Импортировать каталог" onChange={e => { const file = e.target.files?.[0]; if (file && okayToLeave()) setPendingImport(file); }}/>
    {pendingImport && <Dialog title="Заменить локальный каталог?" eyebrow="ИМПОРТ КОЛЛЕКЦИИ" onClose={() => { setPendingImport(null); if (importFile.current) importFile.current.value = ''; }}><p>Содержимое файла «{pendingImport.name}» заменит каталог в этом браузере. Опубликованный сайт от этого не изменится.</p><p>Если нужны текущие черновики, сначала сохраните резервную копию.</p><div className="confirmation-actions"><button className="button button-outline" onClick={() => { setPendingImport(null); if (importFile.current) importFile.current.value = ''; }}>Отмена</button><button className="button button-gold" onClick={() => void importAction(pendingImport)}>Импортировать</button></div></Dialog>}
  </div>;
}
function InfoIcon() { return <AlertCircle size={18} className="gold"/>; }
