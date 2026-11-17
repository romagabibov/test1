import { Component, lazy, Suspense, useEffect, useState, useSyncExternalStore, ReactNode } from 'react';
import { Catalog } from './components/Catalog';
import { VideoShowcaseComponent } from './components/VideoShowcase';
import { getSavedShowcases, initializeCatalog, subscribeCatalog } from './utils/showcaseStore';

const AdminStudio = lazy(() => import('./components/AdminStudio'));
export function navigate(id?: string) { location.hash = id ? `/costume/${encodeURIComponent(id)}` : '/catalog'; }
function route() {
  const hash = location.hash.slice(1);
  if (hash === '/studio') return { type: 'studio', id: '' };
  const match = hash.match(/^\/costume\/(.+)$/);
  try { if (match) return { type: 'costume', id: decodeURIComponent(match[1]) }; } catch { /* Invalid URL returns to catalog. */ }
  return { type: 'catalog', id: '' };
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) return <div className="fatal-error"><h1>Не удалось открыть страницу</h1><p>Обновите страницу. Сохранённые черновики останутся в браузере.</p><button className="button button-gold" onClick={() => { location.hash = '/catalog'; location.reload(); }}>Вернуться в каталог</button></div>;
    return this.props.children;
  }
}

function Application() {
  const items = useSyncExternalStore(subscribeCatalog, getSavedShowcases);
  const [currentRoute, setRoute] = useState(route);
  const [ready, setReady] = useState(false);
  const [warning, setWarning] = useState('');
  useEffect(() => {
    initializeCatalog().catch(error => setWarning(error instanceof Error ? error.message : 'Не удалось загрузить каталог.')).finally(() => setReady(true));
    const changed = () => { setRoute(route()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', changed);
    return () => window.removeEventListener('hashchange', changed);
  }, []);
  const selected = items.find(s => s.id === currentRoute.id);
  useEffect(() => {
    document.title = selected && currentRoute.type === 'costume' ? `${selected.title} · azheritage` : 'azheritage — Национальный костюм в деталях';
  }, [selected, currentRoute.type]);
  if (!ready) return <div className="app-loading"><span className="brand-mark">a</span><p>Открываем коллекцию…</p></div>;
  return <>
    {warning && <div className="app-warning" role="status">{warning} Показана встроенная коллекция.<button onClick={() => setWarning('')} aria-label="Закрыть уведомление">×</button></div>}
    {currentRoute.type === 'studio' ? <Suspense fallback={<div className="app-loading">Открываем студию…</div>}><AdminStudio onClose={() => navigate()} onPreview={navigate}/></Suspense> :
      currentRoute.type === 'costume' ? selected ? <VideoShowcaseComponent key={selected.id} showcase={selected} onBack={() => navigate()}/> : <div className="fatal-error"><h1>Экспонат не найден</h1><p>Возможно, он был удалён или ещё не опубликован.</p><button className="button button-gold" onClick={() => navigate()}>Открыть каталог</button></div> :
      <Catalog items={items} onSelect={navigate} onStudio={() => { location.hash = '/studio'; }}/>}</>;
}
export default function App() { return <ErrorBoundary><Application/></ErrorBoundary>; }
