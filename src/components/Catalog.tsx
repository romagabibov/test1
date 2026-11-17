import { useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Film, Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { VideoShowcase } from '../types';
import { REGIONS, CATEGORIES } from '../utils/showcaseStore';
import { CostumeArt } from './CostumeArt';
import { Dialog } from './Dialog';

export function Brand({ onClick }: { onClick?(): void }) {
  return <button className="brand" onClick={onClick} aria-label="azheritage — в каталог">
    <span className="brand-mark" aria-hidden="true">a</span><span>azheritage<span className="gold">.</span><small>AZƏRBAYCAN MİLLİ GEYİMLƏRİ</small></span>
  </button>;
}

export function Catalog({ items, onSelect, onStudio }: { items: VideoShowcase[]; onSelect(id: string): void; onStudio(): void }) {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('all');
  const [category, setCategory] = useState('all');
  const [videoOnly, setVideoOnly] = useState(false);
  const [about, setAbout] = useState(false);
  const filtered = useMemo(() => items.filter(s => {
    const text = [s.title, s.subtitle, s.culture, s.description, REGIONS[s.region!], ...s.hotspots.map(h => h.title)].join(' ').toLocaleLowerCase();
    return (!search.trim() || text.includes(search.trim().toLocaleLowerCase())) &&
      (region === 'all' || s.region === region) && (category === 'all' || s.category === category) &&
      (!videoOnly || !!(s.videoUrl || s.blobStorageId));
  }), [items, search, region, category, videoOnly]);
  const clear = () => { setSearch(''); setRegion('all'); setCategory('all'); setVideoOnly(false); };
  const activeFilter = search || region !== 'all' || category !== 'all' || videoOnly;
  return <div className="catalog-page">
    <header className="site-header page-width">
      <Brand onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
      <nav aria-label="Главная навигация"><a href="#collection" onClick={e => { e.preventDefault(); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }); }} className="nav-link">Коллекция</a><button className="nav-link" onClick={() => setAbout(true)}>О проекте</button><span className="nav-locale">RU</span></nav>
    </header>
    <main>
      <section className="catalog-hero page-width">
        <div className="hero-copy">
          <p className="eyebrow"><span className="tiny-diamond"/> ЦИФРОВАЯ КОЛЛЕКЦИЯ · АЗЕРБАЙДЖАН</p>
          <h1>У каждой детали —<br/><em>своя история.</em></h1>
          <p className="hero-description">Откройте мир национального костюма.<br className="desktop-break"/> Рассмотрите силуэт, прикоснитесь к деталям<br className="desktop-break"/> и узнайте, что стоит за каждым узором.</p>
          <a className="button button-gold hero-cta" href="#collection" onClick={e => { e.preventDefault(); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }); }}>Исследовать коллекцию <ArrowDown size={17}/></a>
          <div className="hero-footnote"><span className="line"/> Milli geyim. Yaşayan irs.</div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-orbit"/><span className="orbit-word">İRSDƏN GƏLƏCƏYƏ</span>
          {items[0] && <CostumeArt item={items[0]} className="hero-art"/>}
          <div className="hero-detail"><span className="detail-dot"/><span>Маленькая деталь.<br/><strong>Большое наследие.</strong></span></div>
          <span className="hero-index">01 / MİLLİ GEYİM</span>
        </div>
      </section>
      <section id="collection" className="collection page-width" aria-labelledby="collection-title">
        <div className="section-heading"><div><p className="eyebrow">ВЫБЕРИТЕ СВОЮ ИСТОРИЮ</p><h2 id="collection-title">Коллекция костюмов<span className="sup-count">{items.length.toString().padStart(2, '0')}</span></h2></div><span className="collection-note"><Sparkles size={15}/> От силуэта к деталям</span></div>
        <div className="catalog-filters">
          <label className="search-field"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Найти костюм, регион, деталь…" aria-label="Поиск по каталогу"/>{search && <button onClick={() => setSearch('')} aria-label="Очистить поиск"><X size={16}/></button>}</label>
          <div className="filter-selects"><SlidersHorizontal size={16} aria-hidden="true"/><label className="sr-only" htmlFor="region-filter">Регион</label><select id="region-filter" value={region} onChange={e => setRegion(e.target.value)}><option value="all">Все регионы</option>{Object.entries(REGIONS).map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select><label className="sr-only" htmlFor="category-filter">Тип костюма</label><select id="category-filter" value={category} onChange={e => setCategory(e.target.value)}><option value="all">Все костюмы</option>{Object.entries(CATEGORIES).map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></div>
        </div>
        <div className="results-bar"><span>Показано {filtered.length} из {items.length}</span><div><label className="checkbox-label"><input type="checkbox" checked={videoOnly} onChange={e => setVideoOnly(e.target.checked)}/><Film size={14}/> С видеопоказом</label>{activeFilter && <button className="text-button" onClick={clear}>Сбросить <X size={13}/></button>}</div></div>
        {filtered.length ? <div className="costume-grid">{filtered.map((item, index) => {
          const hasVideo = !!(item.videoUrl || item.blobStorageId);
          return <button className="costume-card" key={item.id} onClick={() => onSelect(item.id)}>
            <div className="card-visual"><CostumeArt item={item}/><span className="card-number">{(index + 1).toString().padStart(2, '0')}</span><span className={`media-tag ${hasVideo ? 'has-video' : ''}`}>{hasVideo ? <><Film size={12}/> Видеопоказ</> : 'История костюма'}</span><span className="card-open" aria-hidden="true"><ArrowUpRight size={22}/></span></div>
            <div className="card-meta"><span>{REGIONS[item.region!] ?? item.culture}</span><span>{CATEGORIES[item.category!]}</span></div>
            <h3>{item.title}</h3><p className="card-native">{item.subtitle}</p><span className="card-action">{hasVideo ? 'Смотреть и исследовать' : 'Открыть экспонат'} <ArrowRight size={15}/></span>
          </button>;
        })}</div> : <div className="empty-state"><Search size={30}/><h3>{items.length ? 'Пока ничего не нашлось' : 'Коллекция ждёт первую историю'}</h3><p>{items.length ? 'Попробуйте другой запрос или сбросьте фильтры.' : 'Добавьте костюм и видео в студии проекта.'}</p><button className="button button-outline" onClick={items.length ? clear : onStudio}>{items.length ? 'Сбросить фильтры' : 'Открыть студию'}</button></div>}
      </section>
      <section className="how-it-works page-width"><p className="eyebrow">КАК ИССЛЕДОВАТЬ</p><div><article><span>01</span><h3>Выберите костюм</h3><p>Найдите историю, которая вам близка.</p></article><article><span>02</span><h3>Управляйте движением</h3><p>Прокрутите видео, проведите пальцем или включите показ.</p></article><article><span>03</span><h3>Откройте деталь</h3><p>Нажмите на метку, чтобы прочитать её историю.</p></article></div></section>
    </main>
    <footer className="site-footer page-width"><Brand onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}/><p>Наследие, которое можно рассмотреть ближе.</p><button className="text-button" onClick={onStudio}>Студия проекта <ArrowUpRight size={14}/></button></footer>
    {about && <Dialog title="Наследие в деталях" eyebrow="О ПРОЕКТЕ AZHERITAGE" onClose={() => setAbout(false)}><p>azheritage — цифровая коллекция традиционного костюма Азербайджана. Здесь можно изучать ансамбли разных регионов, материалы, крой и украшения.</p><p>Видеопоказы дополняются метками: выберите деталь на кадре, чтобы открыть описание. Положение и время появления меток настраивает автор экспоната.</p><p>Иллюстрации в каталоге служат визуальными ориентирами. Сведения и видеоматериалы для публикации проверяет редактор проекта.</p></Dialog>}
  </div>;
}
