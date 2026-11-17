import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight, Film, Info, Maximize, MousePointer2, Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { VideoHotspot, VideoShowcase } from '../types';
import { findCostume, getInterpolatedHotspotCoord, REGIONS } from '../utils/showcaseStore';
import { formatTime, useMediaRect, useMediaSource, useVideo } from '../utils/useVideo';
import { wheelPixels } from '../utils/videoScrubber';
import { CostumeArt } from './CostumeArt';
import { Dialog } from './Dialog';

export function VideoShowcaseComponent({ showcase, onBack }: { showcase: VideoShowcase; onBack(): void }) {
  const { src, error: storageError } = useMediaSource(showcase.videoUrl, showcase.blobStorageId);
  const media = useVideo(src, showcase.durationSec);
  const stageRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const rect = useMediaRect(stageRef, media.size.width, media.size.height);
  const [selected, setSelected] = useState<VideoHotspot | null>(null);
  const [info, setInfo] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');
  const drag = useRef<{ y: number; x: number; time: number } | null>(null);
  const costume = findCostume(showcase.costumeId);
  const hasVideo = !!(showcase.videoUrl || showcase.blobStorageId);
  const modal = !!selected || info;
  const modalRef = useRef(modal);
  modalRef.current = modal;

  useEffect(() => { if (modal) media.pause(); }, [modal, media.pause]);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !hasVideo) return;
    const wheel = (event: WheelEvent) => {
      if (modalRef.current || !media.loaded || event.ctrlKey) return;
      if ((event.target as HTMLElement).closest('button, input, a')) return;
      event.preventDefault();
      setHasInteracted(true);
      media.seek(media.requested.current + wheelPixels(event.deltaY, event.deltaMode, stage.clientHeight) * media.duration / 4500);
    };
    stage.addEventListener('wheel', wheel, { passive: false });
    return () => stage.removeEventListener('wheel', wheel);
  }, [hasVideo, media.loaded, media.duration, media.seek]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (modalRef.current || (event.target as HTMLElement).closest('input, textarea, select, button, a')) return;
      if (event.key === 'Escape') { onBack(); return; }
      if (!media.loaded) return;
      if (event.code === 'Space') { event.preventDefault(); void media.toggle(); }
      const delta = event.shiftKey ? 1 : 0.25;
      if (['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault(); setHasInteracted(true);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? media.duration : media.requested.current + (['ArrowLeft', 'ArrowDown'].includes(event.key) ? -delta : delta);
        media.seek(next);
      }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [media.loaded, media.duration, media.seek, media.toggle, onBack]);

  function openHotspot(hotspot: VideoHotspot, jump = false) {
    media.pause();
    if (jump && hasVideo) media.seek(hotspot.timeSec);
    setSelected(hotspot);
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (viewerRef.current?.requestFullscreen) await viewerRef.current.requestFullscreen();
      else setFullscreenError('Полноэкранный режим недоступен в этом браузере.');
    } catch { setFullscreenError('Браузер не разрешил полноэкранный режим.'); }
  }
  const visible = showcase.hotspots.filter(h => media.time >= h.timeSec && media.time <= h.timeSec + (h.visibleDurationSec ?? 4.5));
  return <div className="viewer" ref={viewerRef}>
    <header className="viewer-header"><button className="back-link" onClick={onBack}><ArrowLeft size={19}/><span>Каталог</span></button><div className="viewer-heading"><p>{REGIONS[showcase.region!] ?? showcase.culture}</p><h1>{showcase.title}</h1></div><button className="icon-button" aria-label="О костюме" onClick={() => setInfo(true)}><Info size={21}/></button></header>
    <main className={`viewer-main ${showDetails ? 'with-details' : ''}`}>
      <div className="viewer-stage" ref={stageRef}
        onPointerDown={event => {
          if (!media.loaded || modal || (event.target as HTMLElement).closest('button, input, a')) return;
          drag.current = { y: event.clientY, x: event.clientX, time: media.requested.current };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={event => {
          if (!drag.current || !media.loaded) return;
          const dy = drag.current.y - event.clientY, dx = event.clientX - drag.current.x;
          if (Math.max(Math.abs(dx), Math.abs(dy)) > 3) setHasInteracted(true);
          media.seek(drag.current.time + (Math.abs(dy) > Math.abs(dx) ? dy : dx) * media.duration / 900);
        }}
        onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }}>
        {src ? <video ref={media.ref} src={src} muted={muted} playsInline preload="auto" className="showcase-video" aria-label={showcase.title}/> : !hasVideo ? <CostumeArt item={showcase} className="viewer-art"/> : null}
        {hasVideo && !media.loaded && !media.error && !storageError && <div className="video-message" role="status"><span className="spinner"/><p>Загружаем видео…</p></div>}
        {(media.error || storageError) && <div className="video-message error-panel" role="alert"><Film size={28}/><h2>Видео пока недоступно</h2><p>{storageError || media.error}</p><button className="button button-outline" onClick={() => media.ref.current?.load()}>Попробовать снова</button></div>}
        {!hasVideo && <div className="no-video-caption"><span className="eyebrow">ИСТОРИЯ КОСТЮМА</span><p>Видеопоказ ещё не добавлен.<br/>Откройте описание и детали этого ансамбля.</p><button className="button button-outline" onClick={() => setInfo(true)}>О костюме <ArrowRight size={16}/></button></div>}
        {media.loaded && <div className="hotspot-plane" style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}>
          {visible.map(hotspot => {
            const position = getInterpolatedHotspotCoord(hotspot, media.time);
            const index = showcase.hotspots.findIndex(h => h.id === hotspot.id);
            return <button key={hotspot.id} className="hotspot" style={{ left: `${position.x}%`, top: `${position.y}%` }} onClick={() => openHotspot(hotspot)} aria-label={`Деталь ${index + 1}: ${hotspot.title}`}><span className="hotspot-ring"/><span>{index + 1}</span><span className="hotspot-tooltip">{hotspot.title}</span></button>;
          })}
        </div>}
        {media.loaded && !hasInteracted && !media.playing && <div className="stage-hint"><MousePointer2 size={17}/><span>Листайте, чтобы двигать видео.<br/><strong>Нажмите на метку, чтобы узнать больше.</strong></span><button aria-label="Скрыть подсказку" onClick={() => setHasInteracted(true)}><X size={14}/></button></div>}
        {showcase.isTest15Sec && media.loaded && <span className="demo-label">Демонстрационный видеопоказ</span>}
      </div>
      {showDetails && <aside className="details-sidebar"><div className="sidebar-title"><h2>Детали ансамбля</h2><button className="icon-button" onClick={() => setShowDetails(false)} aria-label="Закрыть список деталей"><X size={18}/></button></div><p className="muted small">Выберите деталь — видео остановится на нужном кадре.</p>{showcase.hotspots.length ? showcase.hotspots.map((h, i) => <button className="detail-list-item" key={h.id} onClick={() => openHotspot(h, true)}><span className="detail-number">{i + 1}</span><span><strong>{h.title}</strong><small>{formatTime(h.timeSec)} · {h.partName || 'Деталь костюма'}</small></span><ChevronRight size={16}/></button>) : <p className="muted">Автор ещё не добавил метки.</p>}{showcase.chapters.length > 0 && hasVideo && <div className="chapters"><p className="eyebrow">ЭПИЗОДЫ</p>{showcase.chapters.map((chapter, index) => <button key={`${chapter.id}_${index}`} onClick={() => { media.seek(chapter.startSec); }}><span>{formatTime(chapter.startSec)}</span>{chapter.title}</button>)}</div>}{!hasVideo && costume?.layers.map(layer => <div className="static-layer" key={layer.id}><h3>{layer.name}</h3><p>{layer.description}</p></div>)}</aside>}
    </main>
    <footer className="player-controls">
      {hasVideo ? <>
        <div className="timeline-labels"><span>{formatTime(media.target, true)}</span><span>{media.seeking ? 'Переходим к кадру…' : media.playing ? 'Воспроизведение' : 'Видео под вашим управлением'}</span><span>{formatTime(media.duration, true)}</span></div>
        <input className="timeline" type="range" min="0" max={media.duration} step="0.01" value={media.target} disabled={!media.loaded} onChange={e => { setHasInteracted(true); media.seek(Number(e.target.value)); }} aria-label="Позиция видео" style={{ '--progress': `${media.target / media.duration * 100}%` } as React.CSSProperties}/>
      </> : null}
      <div className="player-actions"><div>{hasVideo && <><button className="button button-gold play-button" onClick={() => { setHasInteracted(true); void media.toggle(); }} disabled={!media.loaded}>{media.playing ? <Pause size={17}/> : <Play size={17}/>} {media.playing ? 'Пауза' : 'Смотреть'}</button><button className="icon-button" onClick={() => media.seek(0)} disabled={!media.loaded} aria-label="В начало"><RotateCcw size={18}/></button><button className="icon-button" onClick={() => setMuted(!muted)} disabled={!media.loaded} aria-label={muted ? 'Включить звук' : 'Выключить звук'}>{muted ? <VolumeX size={18}/> : <Volume2 size={18}/>}</button></>}</div><div><button className={`button button-outline ${showDetails ? 'is-active' : ''}`} onClick={() => setShowDetails(!showDetails)}><span className="mini-dot"/> Детали <span className="count-pill">{showcase.hotspots.length || costume?.layers.length || 0}</span></button><button className="icon-button" onClick={fullscreen} aria-label="Полный экран"><Maximize size={19}/></button></div></div>
      {fullscreenError && <p className="small muted" role="status">{fullscreenError}</p>}
    </footer>
    {selected && <Dialog title={selected.title} eyebrow={`${(showcase.hotspots.findIndex(h => h.id === selected.id) + 1).toString().padStart(2, '0')} / ${selected.partName || 'ДЕТАЛЬ КОСТЮМА'}`} onClose={() => setSelected(null)}><p className="preserve-lines">{selected.description || 'Автор пока не добавил описание этой детали.'}</p><div className="dialog-bottom"><span>{showcase.title}</span><button className="text-button" onClick={() => setSelected(null)}>Продолжить исследование <ArrowRight size={16}/></button></div></Dialog>}
    {info && <Dialog title={showcase.title} eyebrow={showcase.subtitle} onClose={() => setInfo(false)}><p className="preserve-lines">{showcase.description || 'Описание пока не добавлено.'}</p>{costume && <><h3>Исторический контекст</h3><p>{costume.historicalContext}</p><h3>Материалы</h3><div className="material-tags">{costume.materials.map(material => <span key={material}>{material}</span>)}</div><h3>Состав ансамбля</h3>{costume.layers.map(layer => <article className="layer-description" key={layer.id}><h4>{layer.name}</h4><p>{layer.description}</p><small>{layer.material}</small></article>)}</>}</Dialog>}
  </div>;
}
