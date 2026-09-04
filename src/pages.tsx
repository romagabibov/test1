import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Wind, Shield, Leaf, Phone, Mail, MapPin, X, CheckCircle2, Sparkles, Building2, Home as HomeIcon, FileText, Percent, Maximize2, ChevronRight, ChevronLeft, Filter, Navigation, ExternalLink, Copy, Check, Car, Clock, Compass } from 'lucide-react';
import { useI18n } from './i18n';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import AutoScroll from 'embla-carousel-auto-scroll';
import emailjs from '@emailjs/browser';

import { HandDrawnImage, LogoIcon } from './components';

const getOptimizedUrl = (url: string, transform: string) => {
  if (!url || !url.includes('upload/')) return url;
  if (url.includes('upload/q_') || url.includes('upload/f_')) return url;
  return url.replace('upload/', `upload/${transform}/`);
};

// --- SEAMLESS CROSSFADE SLIDER (БЕСШОВНЫЙ СЛАЙДЕР БЕЗ СЕРЫХ ЭКРАНОВ) ---
interface SeamlessCrossfadeSliderProps {
  images: string[];
  interval?: number;
  transform: string;
  alt?: string;
  className?: string;
  isShuffle?: boolean;
}

export const SeamlessCrossfadeSlider: React.FC<SeamlessCrossfadeSliderProps> = ({
  images,
  interval = 6000,
  transform,
  alt = "Royal Park",
  className = "w-full h-full object-cover object-center",
  isShuffle = true,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(() => images[0] || "");
  const [nextSrc, setNextSrc] = useState<string | null>(null);
  const [isCrossfading, setIsCrossfading] = useState(false);

  const queueRef = useRef<number[]>([]);
  const currentIndexRef = useRef<number>(0);
  const isTransitioningRef = useRef<boolean>(false);

  // Preload helper
  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = getOptimizedUrl(url, transform);
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    });
  };

  useEffect(() => {
    if (!images || images.length === 0) return;

    setCurrentSrc(images[0] || "");
    currentIndexRef.current = 0;
    isTransitioningRef.current = false;

    // Immediately pre-cache first 4 images
    images.slice(0, 4).forEach((u) => {
      const img = new Image();
      img.src = getOptimizedUrl(u, transform);
    });

    if (isShuffle) {
      // First round: start with images[0], queue the remaining indices [1..N-1] shuffled
      const remainingIndices = Array.from({ length: images.length - 1 }, (_, i) => i + 1);
      for (let i = remainingIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingIndices[i], remainingIndices[j]] = [remainingIndices[j], remainingIndices[i]];
      }
      queueRef.current = remainingIndices;
    } else {
      queueRef.current = Array.from({ length: images.length - 1 }, (_, i) => i + 1);
    }

    const timer = setInterval(async () => {
      if (images.length <= 1 || isTransitioningRef.current) return;

      let nextIndex: number;
      if (isShuffle) {
        if (queueRef.current.length === 0) {
          queueRef.current = generateShuffledIndices(images.length, currentIndexRef.current);
        }
        nextIndex = queueRef.current.shift()!;
      } else {
        nextIndex = (currentIndexRef.current + 1) % images.length;
      }
      currentIndexRef.current = nextIndex;

      const targetRawUrl = images[nextIndex];
      const targetOptimized = getOptimizedUrl(targetRawUrl, transform);

      // Proactively pre-cache the next upcoming photo after this one
      const peekIdx = queueRef.current[0] ?? ((nextIndex + 1) % images.length);
      if (images[peekIdx]) {
        const nextImg = new Image();
        nextImg.src = getOptimizedUrl(images[peekIdx], transform);
      }

      // Wait until target photo is completely loaded into browser memory
      isTransitioningRef.current = true;
      await preloadImage(targetRawUrl);

      // Trigger seamless crossfade
      setNextSrc(targetOptimized);
      setIsCrossfading(true);
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval, transform, isShuffle]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-charcoal/5 flex items-center justify-center">
      {/* Base Layer: Always visible, centered */}
      {currentSrc && (
        <img
          src={getOptimizedUrl(currentSrc, transform)}
          className={`absolute inset-0 ${className}`}
          alt={alt}
          loading="eager"
        />
      )}

      {/* Top Smooth Crossfade Layer */}
      <AnimatePresence>
        {isCrossfading && nextSrc && (
          <motion.img
            key={nextSrc}
            src={nextSrc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            onAnimationComplete={() => {
              setCurrentSrc(nextSrc);
              setNextSrc(null);
              setIsCrossfading(false);
              isTransitioningRef.current = false;
            }}
            className={`absolute inset-0 ${className}`}
            alt={alt}
            loading="eager"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// 39 Новых фотографий в формате 16:9 для веб-версии (Desktop Batch 16:9)
// Первая фотография Photo_302 гарантированно открывается первой при загрузке
export const newPhotos16x9 = [
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460157/1_%D0%9F%D0%95%D0%A0%D0%92%D0%90%D0%AF_%D0%A4%D0%9E%D0%A2%D0%9E%D0%93%D0%A0%D0%90%D0%A4%D0%98%D0%AF_Photo_302_-_16%D1%859_vvlgb3.jpg", // 1-я главная
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460155/Photo_69_-_16%D1%859_mzdpcp.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460157/Photo_72_-_16%D1%859_oeo2wo.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460157/Photo_8_-_16%D1%859_tpsjik.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460157/Photo_4_-_16%D1%859_n3xuzy.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460158/Photo_75_-_16%D1%859_prrlly.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460158/Photo_55_-_16%D1%859_wbykk0.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460159/Photo_76_-_16%D1%859_oou10h.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460160/Photo_80_-_16%D1%859_xnwpjc.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460161/Photo_118_-_16%D1%859_yyqyxf.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460161/Photo_146_-_16%D1%859_jcipnw.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460162/Photo_262_16%D1%859_it6wxd.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460162/Photo_243_-_16%D1%859_prlhz1.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460162/Photo_256_-_16%D1%859_xwu0en.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460164/Photo_114_-_16%D1%859_tabeup.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460165/Photo_285_-_16%D1%859_tuaxdn.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788554652/Photo_345_-_16%D1%859.jpg_1_ejii3q.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460166/Photo_296_-16%D1%859_pljljk.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460167/Photo_384_-_16%D1%859_xu866f.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460167/Photo_387_-_16%D1%859_p9eoff.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460168/Photo_396_16%D1%859_tmipqm.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460169/Photo_393_-_16%D1%859_dk27vx.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460170/Photo_458_16%D1%859_bxrfrp.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460171/Photo_473_16%D1%859_uthhej.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460173/Photo_477_16%D1%859_ta7aen.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460174/Photo_506_16%D1%859_w7kgrw.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460174/Photo_602_16%D1%859_rm4jxc.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788554727/Photo_644_16%D1%859.jpg_zktefm.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460177/Photo_661_16%D1%859_yu0eqc.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460177/Photo_470_16%D1%859_iveryg.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460178/Photo_658_16%D1%859_f4lse0.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460178/Photo_663_16%D1%859_fhnekf.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460179/Photo_7214_-_16%D1%859_ochddk.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460180/Photo_7558_-_16%D1%859_ti5pbr.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460181/Photo_7212_16%D1%859_t5slrb.jpg"
];

// Новые фотографии в формате 9:16 для мобильной версии (Mobile Batch 9:16)
// Первая фотография Photo_302 гарантированно открывается первой при загрузке
export const newPhotos9x16 = [
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460155/1_%D0%9F%D0%95%D0%A0%D0%92%D0%90%D0%AF_%D0%A4%D0%9E%D0%A2%D0%9E%D0%93%D0%A0%D0%90%D0%A4%D0%98%D0%AF_Photo_302_-_9%D1%8516_tqifo1.jpg", // 1-я главная
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460155/Photo_72_-_9%D1%8516_vyjuud.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460155/Photo_4_-_9%D1%8516_kmvlje.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460156/Photo_55_-_9%D1%8516_utz4ot.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460156/Photo_8_-_9%D1%8516_cpa2du.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460157/Photo_75_-_9%D1%8516_flevf9.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460157/Photo_69_-_9%D1%8516_e4zunu.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460158/Photo_80_-_9%D1%8516_nqf3vo.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460158/Photo_76_-_9%D1%8516_clcugt.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460159/Photo_114_-_9%D1%8516_brxfll.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460159/Photo_146_-_9%D1%8516_gw81h3.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460160/Photo_118_-_9%D1%8516_gjpejm.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460160/Photo_243_-_9%D1%8516_auljoj.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460161/Photo_256_-_9%D1%8516_hkbqoy.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460162/Photo_262_-_9%D1%8516_rbqbdi.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460163/Photo_276_-_9%D1%8516_zn0yq0.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460164/Photo_285_-_9%D1%8516_rgx1y6.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788554660/Photo_345_-_9%D1%8516.jpg_1_ctq56v.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460166/Photo_384_-_9%D1%8516_bhaqdi.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460167/Photo_387_-_9%D1%8516_m3hceo.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460167/Photo_393_-_9%D1%8516_mqeuo5.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460167/Photo_396_-_9%D1%8516_bw7ca8.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460168/Photo_296_-_9%D1%8516_scsgmx.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460170/Photo_458_9%D1%8516_o5fz73.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460172/Photo_506_9%D1%8516_mj1vr5.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460175/Photo_602_9%D1%8516_btsyeh.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788554728/Photo_644_9%D1%8516.jpg_krhuxj.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460176/Photo_661_9%D1%8516_qjhzrh.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460176/Photo_658_9%D1%8516_dt2ecc.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460178/Photo_7212_9%D1%8516_n6ulyc.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460178/Photo_663_9%D1%8516_zknmb2.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460178/Photo_7214_-_9%D1%8516_npooed.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788460179/Photo_7558_-_9%D1%8516_kat4sl.jpg"
];

// Ранее загруженные оригинальные фотографии (Original Existing Desktop Photos)
export const existingPhotosOriginal = [
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1774897726/IMG_4381_jxltwy.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1774897732/IMG_4420_otyrup.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1775204526/0S3A7695_kaq7fc.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1778133683/Gemini_Generated_Image_3o3g9e3o3g9e3o3g_xpet55.png",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1774899659/0S3A7377_1_fwpxtd.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1774899740/0S3A7602_f7sn49.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1774903934/0S3A7593_nsdfi2.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1774903674/0S3A7568_2_ciamdu.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1778132933/0S3A7738_1_%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F1_1_qllqx4.webp",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1778133119/0S3A7683_1_%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F1_1_%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F2_kxrapt.webp",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1778133185/0S3A7630-_%D0%9F1_q2hmcr.webp",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1778133187/0S3A7632-_%D0%9F1_zt9yul.webp"
];

// Ранее загруженные оригинальные фотографии для мобильных (Original Existing Mobile Photos)
export const existingPhotosMobile = [
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1774903684/0S3A7761_po2euw.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1774903676/0S3A7718_cnue0p.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1774903675/IMG_4383_gzqn05.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1774903674/0S3A7568_2_ciamdu.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1774904901/ChatGPT_Image_31_%D0%BC%D0%B0%D1%80._2026_%D0%B3._01_06_38_dx8iog.png",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1774904902/ChatGPT_Image_31_%D0%BC%D0%B0%D1%80._2026_%D0%B3._01_07_58_ugzvse.png",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1774905331/ChatGPT_Image_31_%D0%BC%D0%B0%D1%80._2026_%D0%B3._01_14_40_rajl2i.png",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1778132933/0S3A7683_1_%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F1_1_v0hogd.webp",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1778133187/0S3A7687-_%D0%9F1_fxped6.webp"
];

// Карусель на главной для Десктопа (Desktop Hero Carousel): Новые 16:9 фото с первой Photo_302
const desktopHeroImages = [
  ...newPhotos16x9
];

// Карусель на главной для Мобильных (Mobile Hero Carousel): Новые 9:16 фото с первой Photo_302
const mobileHeroImages = [
  ...newPhotos9x16
];

export const villaPhotosWeb = [
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461549/Photo_11_16%D1%859_nm8dt8.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461552/Photo_23_16%D1%859_zjkkfy.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461553/Photo_50_-_16%D1%859_t2uh5u.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461554/Photo_18_-16%D1%859_v92ono.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461557/Photo_158_16%D1%859_ujeag5.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461558/Photo_185_-_16x9_zqjeeb.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461560/Photo_201_16%D1%859_g7h0kl.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461561/Photo_59_16%D1%859_afo4xi.jpg"
];

export const villaPhotosMobile = [
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461548/Photo_11_9%D1%8516_flgizp.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461549/Photo_18_-_9%D1%8516_et0ykh.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461551/Photo_23_9%D1%8516_ko1d2g.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461552/Photo_50_-_9%D1%8516_sgyquy.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461555/Photo_59_9%D1%8516_eoi4mw.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461557/Photo_158_9%D1%8516_z3kym9.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461559/Photo_185_-_9x16_ndjqyo.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461559/Photo_201_9%D1%8516_dhxfgd.jpg"
];

const villaImages = [
  ...villaPhotosWeb
];

export const townhousePhotosWeb = [
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461875/Photo_297_9x16_fcqmio.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461876/Photo_308_16%D1%859_va8bg2.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461879/Photo_330_16%D1%859_zgyb1c.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461881/Photo_337_16%D1%859_wxbpue.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461883/Photo_348_-_16x9_zxnfpe.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461887/Photo_352_16x9_fsbxil.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461889/Photo_355_16x9_dymgw5.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461891/Photo_384_-_16x9_ku9t5x.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461893/Photo_394_-_16x9_ylhka3.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461895/Photo_534_16%D1%859_pjgwnt.jpg"
];

export const townhousePhotosMobile = [
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461874/Photo_297_9x16_1_vxrr13.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461875/Photo_308_9%D1%8516_fgfncp.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461877/Photo_330_9%D1%8516_agbtlw.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461880/Photo_337_9%D1%8516_irqexj.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461886/Photo_352_-_9x16_epgus1.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461888/Photo_355_-_9x16_aerhvc.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461890/Photo_384_-_9x16_p35gps.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461892/Photo_394_-_9x16_xz1dv9.jpg",
  "https://res.cloudinary.com/dbnhwdyve/image/upload/v1788461894/Photo_534_9%D1%8516_cvaqil.jpg"
];

const townhouseImages = [
  ...townhousePhotosWeb
];

// Полная коллекция для раздела Галерея - Десктоп (Новые 16:9 фото)
const galleryImages = [
  ...newPhotos16x9.map((src, index) => ({
    src,
    category: index % 2 === 0 ? "architecture" : "atmosphere",
    title: `Royal Park View ${index + 1}`
  }))
];

// Полная коллекция для раздела Галерея - Мобильная версия (Новые 9:16 фото с первой Photo_302)
const mobileGalleryImages = [
  ...newPhotos9x16.map((src, index) => ({
    src,
    category: index % 2 === 0 ? "architecture" : "atmosphere",
    title: `Royal Park Mobile View ${index + 1}`
  }))
];

const generateShuffledIndices = (length: number, lastIndex?: number) => {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  if (lastIndex !== undefined && indices[0] === lastIndex && indices.length > 1) {
    [indices[0], indices[1]] = [indices[1], indices[0]];
  }
  return indices;
};

export const Home = () => {
  const { t } = useI18n();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      {/* Hero Section with Slider */}
      <section className="relative h-screen w-full overflow-hidden bg-[#efefe6] pt-[90px] md:pt-[110px] pb-4 md:pb-6 px-4 md:px-6 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-[1920px] max-h-[calc(100vh-135px)] aspect-[9/16] md:aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl z-10 my-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-charcoal/5 z-10 pointer-events-none" />
          
          {/* Desktop Images (16:9) */}
          <div className="hidden md:block absolute inset-0">
            <SeamlessCrossfadeSlider
              images={desktopHeroImages}
              interval={6000}
              transform="f_auto,q_auto,w_1920"
              alt="Royal Park Desktop View"
              className="w-full h-full object-cover object-center"
              isShuffle={true}
            />
          </div>

          {/* Mobile Images (9:16) */}
          <div className="block md:hidden absolute inset-0">
            <SeamlessCrossfadeSlider
              images={mobileHeroImages}
              interval={6000}
              transform="f_auto,q_auto,w_1080"
              alt="Royal Park Mobile View"
              className="w-full h-full object-cover object-center"
              isShuffle={true}
            />
          </div>
        </div>
      </section>
    </motion.div>
  );
};

/* --- SECTION 1: ABOUT US (О нас) --- */
export const AboutPage = () => {
  const { t } = useI18n();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto min-h-screen">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-widest text-olive font-semibold mb-3 block">Royal Park Baku</span>
        <h1 className="text-[30px] font-serif font-light mb-6 text-charcoal uppercase">{t.about.title}</h1>
        <p className="text-lg md:text-xl font-serif text-olive italic">{t.about.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div className="space-y-6 text-charcoal/80 font-light leading-relaxed text-base md:text-lg">
          <p>{t.about.description1}</p>
          {t.about.description2 ? <p>{t.about.description2}</p> : null}
          <div className="pt-4 flex items-center gap-4">
            <Link to="/contact" className="inline-flex items-center gap-3 bg-olive text-milky px-8 py-3.5 rounded-full text-xs uppercase tracking-widest font-medium hover:bg-olive-dark transition-colors">
              {t.nav.contact} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] bg-gray-100">
          <img 
            src={getOptimizedUrl("https://res.cloudinary.com/dbnhwdyve/image/upload/v1775204526/0S3A7695_kaq7fc.jpg", 'f_auto,q_auto,w_1000')} 
            alt="Royal Park Overview" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        <div className="bg-white p-8 rounded-3xl border border-olive/10 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-olive/10 flex items-center justify-center text-olive">
            <Leaf size={24} />
          </div>
          <h3 className="text-xl font-serif font-medium text-charcoal">{t.about.feature1Title}</h3>
          <p className="text-sm text-charcoal/70 font-light leading-relaxed">{t.about.feature1Desc}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-olive/10 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-olive/10 flex items-center justify-center text-olive">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-serif font-medium text-charcoal">{t.about.feature2Title}</h3>
          <p className="text-sm text-charcoal/70 font-light leading-relaxed">{t.about.feature2Desc}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-olive/10 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-olive/10 flex items-center justify-center text-olive">
            <Wind size={24} />
          </div>
          <h3 className="text-xl font-serif font-medium text-charcoal">{t.about.feature3Title}</h3>
          <p className="text-sm text-charcoal/70 font-light leading-relaxed">{t.about.feature3Desc}</p>
        </div>
      </div>
    </motion.div>
  );
};

/* --- SECTION: ON THE MAP (XƏRİTƏDƏ / НА КАРТЕ / LOCATION) --- */
export const MapPage = () => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(t.map.addressVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const mapEmbedUrl = "https://maps.google.com/maps?q=Royal+Park+Residential+Complex+Baku+K%C9%99nar+dair%C9%99vi+yol&t=&z=15&ie=UTF8&iwloc=&output=embed";
  const googleMapsUrl = "https://maps.app.goo.gl/ju6vDLKyYsS4odJDA";
  const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=Royal+Park+Residential+Complex+Baku";

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      transition={{ duration: 0.5 }} 
      className="pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto min-h-screen"
    >
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-[30px] font-serif font-light text-charcoal uppercase">{t.map.title}</h1>
      </div>

      {/* Main Interactive Map Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-olive/10 mb-12"
      >
        {/* Top Control Bar on Map Card */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-charcoal/10">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center text-olive shrink-0 mt-0.5">
              <MapPin size={20} />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-charcoal-light font-medium block mb-1">
                {t.map.addressTitle}
              </span>
              <p className="text-charcoal font-medium text-sm sm:text-base">{t.map.addressVal}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            <button 
              onClick={copyToClipboard}
              className="px-4 py-2.5 rounded-full border border-charcoal/20 hover:border-olive text-charcoal hover:text-olive text-xs uppercase tracking-wider font-medium transition-all flex items-center gap-2 cursor-pointer bg-milky/50"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              <span>{copied ? t.map.copied : t.map.copyAddress}</span>
            </button>

            <a 
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-full border border-olive text-olive hover:bg-olive hover:text-white text-xs uppercase tracking-wider font-medium transition-all flex items-center gap-2"
            >
              <Navigation size={14} />
              <span>{t.map.getDirections}</span>
            </a>

            <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-full bg-olive hover:bg-olive-dark text-white text-xs uppercase tracking-wider font-medium transition-all flex items-center gap-2 shadow-sm"
            >
              <ExternalLink size={14} />
              <span>{t.map.openInGoogle}</span>
            </a>
          </div>
        </div>

        {/* Embedded Interactive Google Map */}
        <div className="relative w-full h-[380px] sm:h-[450px] md:h-[520px] rounded-2xl overflow-hidden mt-6 bg-charcoal/5 border border-charcoal/10 shadow-inner">
          <iframe 
            title="Royal Park Baku Map"
            src={mapEmbedUrl}
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true}
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        </div>
      </motion.div>

      {/* Proximity / Travel Time Estimates */}
      <div className="mb-14">
        <h2 className="text-xs uppercase tracking-widest text-olive font-semibold mb-6 text-center">
          {t.map.distancesTitle}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-2xl border border-olive/10 shadow-sm text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-olive/10 flex items-center justify-center text-olive mb-3">
              <Clock size={18} />
            </div>
            <div className="text-xl sm:text-2xl font-serif text-olive font-medium mb-1">{t.map.d1Time}</div>
            <p className="text-xs text-charcoal/70 font-light leading-snug">{t.map.d1Name}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-olive/10 shadow-sm text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-olive/10 flex items-center justify-center text-olive mb-3">
              <Clock size={18} />
            </div>
            <div className="text-xl sm:text-2xl font-serif text-olive font-medium mb-1">{t.map.d2Time}</div>
            <p className="text-xs text-charcoal/70 font-light leading-snug">{t.map.d2Name}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-olive/10 shadow-sm text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-olive/10 flex items-center justify-center text-olive mb-3">
              <Clock size={18} />
            </div>
            <div className="text-xl sm:text-2xl font-serif text-olive font-medium mb-1">{t.map.d4Time}</div>
            <p className="text-xs text-charcoal/70 font-light leading-snug">{t.map.d4Name}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-olive/10 shadow-sm text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-olive/10 flex items-center justify-center text-olive mb-3">
              <Clock size={18} />
            </div>
            <div className="text-xl sm:text-2xl font-serif text-olive font-medium mb-1">{t.map.d3Time}</div>
            <p className="text-xs text-charcoal/70 font-light leading-snug">{t.map.d3Name}</p>
          </div>
        </div>
      </div>


      {/* Navigation Assistance & Visit CTA */}
      <div className="bg-[#b1ba88]/20 border border-olive/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-serif text-charcoal mb-2">{t.map.needAssistanceTitle}</h3>
          <p className="text-charcoal/70 font-light text-sm max-w-xl">{t.map.needAssistanceDesc}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
          <a 
            href="tel:+994512525656" 
            className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-olive text-olive hover:bg-olive hover:text-white font-medium text-xs uppercase tracking-widest transition-colors inline-flex items-center justify-center gap-2"
          >
            <Phone size={16} /> {t.map.callUs}
          </a>
          <Link 
            to="/contact" 
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-olive hover:bg-olive-dark text-white font-medium text-xs uppercase tracking-widest transition-colors inline-flex items-center justify-center gap-2 shadow-sm"
          >
            {t.map.bookTour}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

// --- ULTRA-FAST HIGH-FIDELITY LIGHTBOX MODAL ---
interface FastLightboxModalProps {
  isOpen: boolean;
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export const FastLightboxModal: React.FC<FastLightboxModalProps> = ({
  isOpen,
  images,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setHighResLoaded(false);
    }
  }, [isOpen, initialIndex]);

  // Preload adjacent images whenever currentIndex changes
  useEffect(() => {
    if (!isOpen || !images || images.length === 0) return;

    setHighResLoaded(false);

    // Preload current high-res
    const currSrc = images[currentIndex];
    if (currSrc) {
      const img = new Image();
      img.src = getOptimizedUrl(currSrc, 'f_auto,q_auto,w_1920');
      if (img.complete) {
        setHighResLoaded(true);
      } else {
        img.onload = () => setHighResLoaded(true);
      }
    }

    // Proactively preload adjacent images in background
    if (images.length > 1) {
      const nextIdx = (currentIndex + 1) % images.length;
      const prevIdx = (currentIndex - 1 + images.length) % images.length;
      const nextImg = new Image();
      nextImg.src = getOptimizedUrl(images[nextIdx], 'f_auto,q_auto,w_1920');
      const prevImg = new Image();
      prevImg.src = getOptimizedUrl(images[prevIdx], 'f_auto,q_auto,w_1920');
    }
  }, [isOpen, currentIndex, images]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && images.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
      if (e.key === 'ArrowLeft' && images.length > 1) {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, images.length, onClose]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentRawUrl = images[currentIndex] || images[0];
  const thumbUrl = getOptimizedUrl(currentRawUrl, 'f_auto,q_auto,w_800');
  const highResUrl = getOptimizedUrl(currentRawUrl, 'f_auto,q_auto,w_1920');

  const goToPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[110] bg-black/95 p-2 sm:p-4 md:p-8 flex items-center justify-center cursor-zoom-out backdrop-blur-md select-none"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Control Bar */}
        <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-[130] pointer-events-none">
          <div className="text-white/80 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs tracking-widest font-mono pointer-events-auto border border-white/10">
            {currentIndex + 1} / {images.length}
          </div>

          <button
            className="p-2.5 text-white/90 hover:text-white bg-white/15 hover:bg-white/30 rounded-full transition-all shadow-lg pointer-events-auto cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[130] p-2.5 sm:p-3.5 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white transition-all backdrop-blur-sm cursor-pointer hover:scale-105 border border-white/10 shadow-lg"
              aria-label="Previous image"
            >
              <ChevronLeft size={26} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[130] p-2.5 sm:p-3.5 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white transition-all backdrop-blur-sm cursor-pointer hover:scale-105 border border-white/10 shadow-lg"
              aria-label="Next image"
            >
              <ChevronRight size={26} />
            </button>
          </>
        )}

        {/* Main Image Container */}
        <div 
          className="relative max-w-[96vw] max-h-[90vh] flex items-center justify-center overflow-hidden rounded-xl cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Immediate Cached Thumbnail (0ms instant display from browser card cache) */}
          <img
            src={thumbUrl}
            alt="Preview"
            className={`max-w-[96vw] max-h-[90vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
              highResLoaded ? 'opacity-0 absolute inset-0 pointer-events-none' : 'opacity-100'
            }`}
          />

          {/* High-Resolution Streamlined Image (Loaded progressively without freezing UI) */}
          <img
            key={highResUrl}
            src={highResUrl}
            alt="Full Resolution View"
            decoding="async"
            onLoad={() => setHighResLoaded(true)}
            className={`max-w-[96vw] max-h-[90vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
              highResLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/* --- SECTION 2: VILLAS (Виллы) --- */
export const VillasPage = () => {
  const { t } = useI18n();
  const [lightboxState, setLightboxState] = useState<{ images: string[]; index: number } | null>(null);

  const handleCardHover = (src: string) => {
    const img = new Image();
    img.src = getOptimizedUrl(src, 'f_auto,q_auto,w_1920');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto min-h-screen">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-widest text-olive font-semibold mb-3 block">Residences</span>
        <h1 className="text-[30px] font-serif font-light mb-6 text-charcoal uppercase">{t.villas.title}</h1>
      </div>

      {/* Desktop Villa Photos Grid (16:10 / 16:9) */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {villaImages.map((src, index) => (
          <motion.div 
            key={`desktop-${index}`} 
            whileHover={{ y: -5 }} 
            className="group relative aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer shadow-sm bg-gray-100"
            onClick={() => setLightboxState({ images: villaImages, index })}
            onMouseEnter={() => handleCardHover(src)}
          >
            <img 
              src={getOptimizedUrl(src, 'f_auto,q_auto,w_800')} 
              alt={`Villa Photo ${index + 1}`} 
              loading={index < 3 ? "eager" : "lazy"}
              decoding="async"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Maximize2 size={28} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile Villa Photos Grid (9:16 Portrait Optimized) */}
      <div className="grid md:hidden grid-cols-1 sm:grid-cols-2 gap-6 mb-16 justify-items-center w-full max-w-lg sm:max-w-none mx-auto">
        {villaPhotosMobile.map((src, index) => (
          <motion.div 
            key={`mobile-${index}`} 
            whileHover={{ y: -3 }} 
            className="group relative aspect-[9/16] w-full max-w-[360px] sm:max-w-none mx-auto rounded-2xl overflow-hidden cursor-pointer shadow-sm bg-gray-100"
            onClick={() => setLightboxState({ images: villaPhotosMobile, index })}
            onTouchStart={() => handleCardHover(src)}
          >
            <img 
              src={getOptimizedUrl(src, 'f_auto,q_auto,w_720')} 
              alt={`Villa Mobile Photo ${index + 1}`} 
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Maximize2 size={28} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
        <Link to="/contact" className="bg-olive text-milky px-8 py-3.5 rounded-full text-xs uppercase tracking-widest font-medium hover:bg-olive-dark transition-colors inline-flex items-center gap-2">
          {t.nav.contact}
        </Link>
      </div>

      {/* Ultra-Fast Lightbox Modal */}
      <FastLightboxModal 
        isOpen={!!lightboxState}
        images={lightboxState ? lightboxState.images : []}
        initialIndex={lightboxState ? lightboxState.index : 0}
        onClose={() => setLightboxState(null)} 
      />
    </motion.div>
  );
};

/* --- SECTION 3: TOWNHOUSES (Таунхаус) --- */
export const TownhousesPage = () => {
  const { t } = useI18n();
  const [lightboxState, setLightboxState] = useState<{ images: string[]; index: number } | null>(null);

  const handleCardHover = (src: string) => {
    const img = new Image();
    img.src = getOptimizedUrl(src, 'f_auto,q_auto,w_1920');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto min-h-screen">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-widest text-olive font-semibold mb-3 block">Residences</span>
        <h1 className="text-[30px] font-serif font-light mb-6 text-charcoal uppercase">{t.townhouses.title}</h1>
      </div>

      {/* Desktop Townhouse Photos Grid (16:10 / 16:9) */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {townhouseImages.map((src, index) => (
          <motion.div 
            key={`desktop-${index}`} 
            whileHover={{ y: -5 }} 
            className="group relative aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer shadow-sm bg-gray-100"
            onClick={() => setLightboxState({ images: townhouseImages, index })}
            onMouseEnter={() => handleCardHover(src)}
          >
            <img 
              src={getOptimizedUrl(src, 'f_auto,q_auto,w_800')} 
              alt={`Townhouse Photo ${index + 1}`} 
              loading={index < 3 ? "eager" : "lazy"}
              decoding="async"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Maximize2 size={28} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile Townhouse Photos Grid (9:16 Portrait Optimized) */}
      <div className="grid md:hidden grid-cols-1 sm:grid-cols-2 gap-6 mb-16 justify-items-center w-full max-w-lg sm:max-w-none mx-auto">
        {townhousePhotosMobile.map((src, index) => (
          <motion.div 
            key={`mobile-${index}`} 
            whileHover={{ y: -3 }} 
            className="group relative aspect-[9/16] w-full max-w-[360px] sm:max-w-none mx-auto rounded-2xl overflow-hidden cursor-pointer shadow-sm bg-gray-100"
            onClick={() => setLightboxState({ images: townhousePhotosMobile, index })}
            onTouchStart={() => handleCardHover(src)}
          >
            <img 
              src={getOptimizedUrl(src, 'f_auto,q_auto,w_720')} 
              alt={`Townhouse Mobile Photo ${index + 1}`} 
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async"
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Maximize2 size={28} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
        <Link to="/contact" className="bg-olive text-milky px-8 py-3.5 rounded-full text-xs uppercase tracking-widest font-medium hover:bg-olive-dark transition-colors inline-flex items-center gap-2">
          {t.nav.contact}
        </Link>
      </div>

      {/* Ultra-Fast Lightbox Modal */}
      <FastLightboxModal 
        isOpen={!!lightboxState}
        images={lightboxState ? lightboxState.images : []}
        initialIndex={lightboxState ? lightboxState.index : 0}
        onClose={() => setLightboxState(null)} 
      />
    </motion.div>
  );
};

/* --- SECTION 4: GALLERY (Фото Галерея: улицы, детали и т.д.) --- */
export const GalleryPage = () => {
  const desktopGalleryUrls = galleryImages.map(g => g.src);
  const mobileGalleryUrls = mobileGalleryImages.map(g => g.src);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <section className="relative h-screen w-full overflow-hidden bg-[#efefe6] pt-[90px] md:pt-[110px] pb-4 md:pb-6 px-4 md:px-6 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-[1920px] max-h-[calc(100vh-135px)] aspect-[9/16] md:aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl z-10 my-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-charcoal/10 z-10 pointer-events-none" />
          
          {/* Desktop Gallery Slider (16:9) */}
          <div className="hidden md:block absolute inset-0">
            <SeamlessCrossfadeSlider
              images={desktopGalleryUrls}
              interval={6000}
              transform="f_auto,q_auto,w_1920"
              alt="Royal Park Gallery Desktop"
              className="w-full h-full object-cover object-center"
              isShuffle={false}
            />
          </div>

          {/* Mobile Gallery Slider (9:16) */}
          <div className="block md:hidden absolute inset-0">
            <SeamlessCrossfadeSlider
              images={mobileGalleryUrls}
              interval={6000}
              transform="f_auto,q_auto,w_1080"
              alt="Royal Park Gallery Mobile"
              className="w-full h-full object-cover object-center"
              isShuffle={false}
            />
          </div>
        </div>
      </section>
    </motion.div>
  );
};

/* --- SECTION 6: SPECIAL OFFERS / EXCLUSIVE TERMS (Специальные предложения или Особые условия) --- */
export const OffersPage = () => {
  const { t } = useI18n();

  const offerItems = [
    {
      num: "01",
      title: t.offers.item1Title,
      desc: t.offers.item1Desc,
      icon: <Percent size={28} className="text-olive" />
    },
    {
      num: "02",
      title: t.offers.item2Title,
      desc: t.offers.item2Desc,
      icon: <FileText size={28} className="text-olive" />
    },
    {
      num: "03",
      title: t.offers.item3Title,
      desc: t.offers.item3Desc,
      icon: <Shield size={28} className="text-olive" />
    },
    {
      num: "04",
      title: t.offers.item4Title,
      desc: t.offers.item4Desc,
      icon: <Sparkles size={28} className="text-olive" />
    },
    {
      num: "05",
      title: t.offers.item5Title,
      desc: t.offers.item5Desc,
      icon: <CheckCircle2 size={28} className="text-olive" />
    },
    {
      num: "06",
      title: t.offers.item6Title,
      desc: t.offers.item6Desc,
      icon: <Building2 size={28} className="text-olive" />
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto min-h-screen">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-widest text-olive font-semibold mb-3 block">Purchase Advantages</span>
        <h1 className="text-[30px] font-serif font-light mb-6 text-charcoal uppercase">{t.offers.title}</h1>
        <p className="text-charcoal/70 font-light text-base md:text-lg">{t.offers.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {offerItems.map((item) => (
          <motion.div 
            key={item.num}
            whileHover={{ y: -4 }}
            className="bg-white p-8 rounded-3xl border border-olive/10 shadow-sm flex flex-col justify-between space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-olive/10 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="text-3xl font-serif text-olive/30 font-light">{item.num}</span>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-serif font-medium text-charcoal">{item.title}</h3>
              <p className="text-sm text-charcoal/70 font-light leading-relaxed">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-olive/10 border border-olive/20 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-serif text-charcoal mb-4">{t.offers.ctaTitle}</h2>
        <p className="text-charcoal/70 font-light mb-8 max-w-2xl mx-auto">{t.contact.desc}</p>
        <Link to="/contact" className="inline-flex items-center gap-3 bg-olive text-milky px-8 py-4 rounded-full text-xs uppercase tracking-widest font-medium hover:bg-olive-dark transition-colors">
          {t.offers.ctaBtn} <ArrowRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
};

/* --- CONTACT PAGE --- */
export const Contact = () => {
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string>('idle');

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const SERVICE_ID = 'service_30rhtps';
    const TEMPLATE_ID = 'template_zym51wd';
    const PUBLIC_KEY = 'Dt_a9Rc7vlNnLyDb9';

    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, PUBLIC_KEY)
      .then((result) => {
          setSubmitStatus('success');
          formRef.current?.reset();
      }, (error) => {
          setSubmitStatus(error.text || 'error');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto min-h-screen">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[30px] font-serif font-light mb-6 text-center uppercase"
      >
        {t.contact.title}
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-charcoal-light font-light max-w-4xl mx-auto mb-20"
      >
        {t.contact.desc}
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-olive/10"
        >
          <form ref={formRef} onSubmit={sendEmail} className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-charcoal-light font-medium">{t.contact.form_name}</label>
              <input type="text" name="name" required className="w-full border-b border-charcoal/20 pb-2 bg-transparent focus:outline-none focus:border-olive transition-colors font-light" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-charcoal-light font-medium">{t.contact.form_email}</label>
              <input type="email" name="email" required className="w-full border-b border-charcoal/20 pb-2 bg-transparent focus:outline-none focus:border-olive transition-colors font-light" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-charcoal-light font-medium">{t.contact.form_phone}</label>
              <input type="tel" name="phone" className="w-full border-b border-charcoal/20 pb-2 bg-transparent focus:outline-none focus:border-olive transition-colors font-light" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-charcoal-light font-medium">{t.contact.form_message}</label>
              <textarea name="message" required rows={4} className="w-full border-b border-charcoal/20 pb-2 bg-transparent focus:outline-none focus:border-olive transition-colors font-light resize-none"></textarea>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-olive text-milky py-4 rounded-full uppercase tracking-widest text-sm font-medium hover:bg-olive-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Sending...' : t.contact.form_submit}
            </button>
            
            {submitStatus === 'success' && (
              <p className="text-green-600 text-sm text-center mt-4">Message sent successfully!</p>
            )}
            {submitStatus !== 'idle' && submitStatus !== 'success' && (
              <p className="text-red-600 text-sm text-center mt-4">Failed to send message: {submitStatus}. Please try again.</p>
            )}
          </form>
        </motion.div>

        {/* Contact Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col justify-center space-y-12"
        >
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-olive/10 flex items-center justify-center text-olive shrink-0">
              <MapPin size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-widest text-charcoal-light font-medium mb-2">{t.contact.info_address}</h3>
              <p className="font-serif text-2xl">{t.contact.address_val}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-olive/10 flex items-center justify-center text-olive shrink-0">
              <Phone size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-widest text-charcoal-light font-medium mb-2">{t.contact.info_phone}</h3>
              <a 
                href="tel:+994512525656" 
                className="font-serif text-2xl hover:text-olive transition-colors block text-charcoal"
              >
                (+994 51) 252-56-56
              </a>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-olive/10 flex items-center justify-center text-olive shrink-0">
              <Mail size={24} strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-widest text-charcoal-light font-medium mb-2">{t.contact.info_email}</h3>
              <a 
                href="mailto:sales@royalpark.az" 
                className="font-serif text-2xl hover:text-olive transition-colors block text-charcoal"
              >
                sales@royalpark.az
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
