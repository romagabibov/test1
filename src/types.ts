export type CultureRegion = 
  | 'karabakh'       // Карабах и Шуша (Шелк, тирма, чепкен, кюрдю)
  | 'baku_absheron'  // Баку и Апшерон (Рукава нилюфяр, синебенд, арахчин)
  | 'shaki_shirvan'  // Шеки и Ширван (Шелковый путь, кялагаи, лаббада)
  | 'ganja_gazakh'   // Гянджа и Газах (Бархатный бяхари, пышные туманы)
  | 'nakhchivan'     // Нахчыван (Кюляджа, узорчатые джорабы, филигрань)
  | 'lankaran';      // Ленкорань и Юг (Яркие шелковые накидки, гюлабетин)

export type GenderType = 'female' | 'male' | 'unisex' | 'wedding' | 'festive' | 'royal';

export interface CostumeLayer {
  id: string;
  name: string;
  nativeName?: string;
  type: 'headdress' | 'outerwear' | 'innerwear' | 'bottom' | 'jewelry' | 'footwear' | 'belt';
  description: string;
  material: string;
  symbolism: string;
  arItemId?: string;
  accentColor?: string;
}

export interface OrnamentInfo {
  id: string;
  name: string;
  nativeName?: string;
  culture: string;
  meaning: string;
  placement: string;
  protective: string;
  category: 'buta' | 'botanical' | 'shebeke' | 'craft';
  svgData?: string;
}

export interface ArTryOnItem {
  id: string;
  name: string;
  nativeName: string;
  category: 'headdress' | 'jewelry' | 'chest' | 'belt';
  culture: string;
  previewColor: string;
  defaultScale: number;
  defaultOffsetY: number;
  defaultOffsetX: number;
  description: string;
  symbolism: string;
  renderType: 'kelaghayi' | 'arakhchin_female' | 'arakhchin_male' | 'papakha' | 'sinebend' | 'kemer' | 'gazyr' | 'arkhalyg_collar';
}

export interface HotspotTrajectoryKeyframe {
  timeSec: number; // Точная секунда трекинга (например, 1.0, 2.0, 3.0...)
  xPercent: number; // Положение X на этой секунде (0-100)
  yPercent: number; // Положение Y на этой секунде (0-100)
}

export interface VideoHotspot {
  id: string;
  timeSec: number; // Точный тайминг появления (в секундах)
  visibleDurationSec?: number; // Продолжительность показа (сек)
  xPercent: number; // 0 - 100 (начальная точка на видео)
  yPercent: number; // 0 - 100 (начальная точка на видео)
  textXPercent?: number; // Положение текста (0-100), настраивается в админке
  textYPercent?: number; // Положение текста (0-100), настраивается в админке
  title: string;
  partName: string;
  description: string;
  arItemId?: string;
  culture?: string;
  linkCatalogCostumeId?: string;
  trajectory?: HotspotTrajectoryKeyframe[]; // Посекундный трекинг траектории движения точки
}

export interface VideoChapter {
  id: string;
  title: string;
  startSec: number;
  durationSec: number;
  description?: string;
  costumeId?: string;
}

export interface VideoShowcase {
  id: string;
  title: string;
  subtitle: string;
  culture?: string;
  durationSec: number;
  costumeId: string;
  videoUrl?: string;
  videoWidth?: number;
  videoHeight?: number;
  sceneTheme?: 'karabakh' | 'baku_flame' | 'shaki_palace' | 'caspian_night' | 'palace' | 'mountains' | 'museum';
  ambientAudio?: 'tar' | 'kamancha' | 'balaban' | 'saz';
  description?: string;
  chapters: VideoChapter[];
  hotspots: VideoHotspot[];
  isCustomUploaded?: boolean;
  blobStorageId?: string;
  isTest15Sec?: boolean;
  region?: CultureRegion;
  category?: GenderType;
  posterUrl?: string;
  posterStorageId?: string;
}

export interface Costume {
  id: string;
  title: string;
  nativeTitle: string;
  culture: string;
  region: CultureRegion;
  gender: GenderType;
  era: string;
  occasion: string;
  tagline: string;
  description: string;
  historicalContext: string;
  bgGradient: string;
  primaryColor: string;
  secondaryColor: string;
  materials: string[];
  layers: CostumeLayer[];
  ornaments: OrnamentInfo[];
  audioAmbiance: 'tar' | 'kamancha' | 'balaban' | 'saz';
  arAvailableItems: string[];
  featuredInVideo?: boolean;
}

export interface StylistConsultationResult {
  outfitTitle: string;
  overview: string;
  layersRecommendation: Array<{
    layerName: string;
    material: string;
    colorPalette: string;
    historicalNote: string;
  }>;
  headdressAndJewelry: string;
  ornamentSymbolism: string;
  modernStylingTips: string;
  recommendedArItemId?: string;
}
