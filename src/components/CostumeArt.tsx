import { useId } from 'react';
import { VideoShowcase } from '../types';
import { findCostume } from '../utils/showcaseStore';
import { useMediaSource } from '../utils/useVideo';

// Lightweight illustrations make unfilmed catalogue entries recognizable without inventing footage.
export function CostumeArt({ item, className = '' }: { item: VideoShowcase; className?: string }) {
  const costume = findCostume(item.costumeId);
  const { src } = useMediaSource(item.posterUrl, item.posterStorageId);
  const id = useId().replace(/:/g, '');
  const primary = costume?.primaryColor ?? '#8c2441';
  const male = item.category === 'male';
  return <div className={`costume-art ${className}`} style={{ '--costume-color': primary } as React.CSSProperties}>
    {src ? <img src={src} loading="lazy" alt={item.title} /> : <svg viewBox="0 0 400 500" role="img" aria-label={`Иллюстрация: ${item.title}`}>
      <defs>
        <linearGradient id={`${id}fabric`}><stop stopColor="#17171b"/><stop offset=".5" stopColor={primary}/><stop offset="1" stopColor="#351524"/></linearGradient>
        <radialGradient id={`${id}light`}><stop stopColor={primary} stopOpacity=".19"/><stop offset="1" stopColor={primary} stopOpacity="0"/></radialGradient>
        <pattern id={`${id}pattern`} width="28" height="36" patternUnits="userSpaceOnUse"><path d="M14 5C2 17 7 31 16 29C28 26 22 14 14 5ZM14 13C8 23 18 26 18 20" fill="none" stroke="#d4b996" strokeWidth=".9" opacity=".3"/></pattern>
      </defs>
      <ellipse cx="200" cy="255" rx="170" ry="225" fill={`url(#${id}light)`}/>
      <g fill="none" stroke="#d4b996" opacity=".12"><circle cx="200" cy="237" r="161"/><circle cx="200" cy="237" r="174" strokeDasharray="2 12"/><path d="M200 33V68M200 408V450M14 237H50M350 237H386"/></g>
      <ellipse cx="200" cy="452" rx="98" ry="12" fill="#000" opacity=".35"/>
      <path d="M183 107L183 130H217V107" fill="#aa8262"/>
      <ellipse cx="200" cy="86" rx="24" ry="33" fill="#b18e70"/>
      {male ? <>
        <path d="M171 56Q200 42 229 56V85Q200 72 171 85Z" fill="#202020" stroke="#a48a68" strokeWidth="2"/>
        <path d="M164 256L155 438H189L200 305L210 438H244L237 256" fill="#242023" stroke="#6f6150"/>
        <path d="M150 141L173 128L200 148L227 128L250 141L270 316L243 327L227 244L238 360L200 341L162 360L173 244L157 327L130 316Z" fill={`url(#${id}fabric)`} stroke="#b89968" strokeWidth="2"/>
        <path d="M200 149V340M174 143L190 255M226 143L210 255" stroke="#d4b996" strokeWidth="2" fill="none"/>
        {[0,1,2,3,4].map(n => <g key={n} stroke="#bda784" strokeWidth="5"><path d={`M${156+n*6} 177v30M${218+n*6} 177v30`}/></g>)}
      </> : <>
        <path d="M169 228L231 228Q258 301 294 433Q200 473 106 433Q142 301 169 228Z" fill={`url(#${id}fabric)`} stroke="#b89968" strokeWidth="2"/>
        <path d="M169 228L231 228Q258 301 294 433Q200 473 106 433Q142 301 169 228Z" fill={`url(#${id}pattern)`}/>
        <g stroke="#bd9260" opacity=".25" fill="none">{[0,1,2,3,4,5,6].map(n => <path key={n} d={`M${176+n*8} 249L${130+n*23} 434`}/>)}</g>
        <path d="M152 141L178 125L200 160L222 125L248 141L279 280L252 293L229 203L231 236H169L171 203L148 293L121 280Z" fill={`url(#${id}fabric)`} stroke="#d4b996" strokeWidth="2"/>
        <path d="M177 128L190 221M223 128L210 221M128 277L146 283M255 283L274 277" stroke="#d4b996" strokeWidth="3"/>
        <path d="M172 63Q200 36 228 63L257 200L231 214L219 108Q200 131 181 108L169 214L143 200Z" fill="#deceae" opacity=".8" stroke="#d4b996"/>
        <path d="M184 153Q200 184 216 153M181 167Q200 195 219 167" fill="none" stroke="#deceae" strokeWidth="3"/>
        <path d="M113 429Q200 464 287 429" stroke="#b89968" fill="none" strokeWidth="7"/>
      </>}
      <path d="M168 228H232V242H168Z" fill="#c5b38d"/>
      <path d="M200 222L211 235L200 248L189 235Z" fill="#d9c498" stroke="#826b49"/>
    </svg>}
    {!src && <span className="art-caption">Иллюстрация</span>}
  </div>;
}
