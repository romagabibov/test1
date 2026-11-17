import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';

export function Dialog({ title, eyebrow, onClose, children }: { title: string; eyebrow?: string; onClose(): void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    const cancel = (event: Event) => { event.preventDefault(); close.current(); };
    dialog.addEventListener('cancel', cancel);
    return () => {
      dialog.removeEventListener('cancel', cancel);
      dialog.close(); document.body.style.overflow = overflow; previous?.focus();
    };
  }, []);
  return <dialog ref={ref} className="detail-dialog" aria-labelledby="dialog-title" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="dialog-content">
      <button className="icon-button dialog-close" onClick={onClose} aria-label="Закрыть описание"><X size={20} /></button>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id="dialog-title">{title}</h2>
      <div className="dialog-body">{children}</div>
    </div>
  </dialog>;
}
