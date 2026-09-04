import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Instagram, Map, Facebook, User } from 'lucide-react';
import { useI18n } from './i18n';

export const TikTokIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export const LogoIcon = ({ className = "", isDark = false, colorHex }: { className?: string, isDark?: boolean, colorHex?: string }) => {
  if (colorHex) {
    return (
      <div className={`relative ${className}`}>
        <img 
          src="https://res.cloudinary.com/dbnhwdyve/image/upload/f_auto,q_auto/v1774900461/Untitled_3_fsmi4e.webp" 
          alt="Royal Park Logo" 
          className="w-full h-full opacity-0"
        />
        <div 
          className="absolute inset-0 transition-colors duration-500"
          style={{
            backgroundColor: colorHex,
            WebkitMaskImage: `url(https://res.cloudinary.com/dbnhwdyve/image/upload/f_auto,q_auto/v1774900461/Untitled_3_fsmi4e.webp)`,
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: `url(https://res.cloudinary.com/dbnhwdyve/image/upload/f_auto,q_auto/v1774900461/Untitled_3_fsmi4e.webp)`,
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          }}
        />
      </div>
    );
  }

  return (
    <img 
      src="https://res.cloudinary.com/dbnhwdyve/image/upload/f_auto,q_auto/v1774900461/Untitled_3_fsmi4e.webp" 
      alt="Royal Park Logo" 
      className={`object-contain transition-all duration-500 ${isDark ? 'brightness-0 opacity-70' : 'brightness-0 invert'} ${className}`} 
    />
  );
};

export const Preloader = ({ onComplete }: { onComplete: () => void; key?: React.Key }) => {
  useEffect(() => {
    // Proactively preload first hero images for both desktop and mobile
    const desktopImg = new Image();
    desktopImg.src = "https://res.cloudinary.com/dbnhwdyve/image/upload/f_auto,q_auto,w_1920/v1788460157/1_%D0%9F%D0%95%D0%A0%D0%92%D0%90%D0%AF_%D0%A4%D0%9E%D0%A2%D0%9E%D0%93%D0%A0%D0%90%D0%A4%D0%98%D0%AF_Photo_302_-_16%D1%859_vvlgb3.jpg";
    const mobileImg = new Image();
    mobileImg.src = "https://res.cloudinary.com/dbnhwdyve/image/upload/f_auto,q_auto,w_1080/v1788460155/1_%D0%9F%D0%95%D0%A0%D0%92%D0%90%D0%AF_%D0%A4%D0%9E%D0%A2%D0%9E%D0%93%D0%A0%D0%90%D0%A4%D0%98%D0%AF_Photo_302_-_9%D1%8516_tqifo1.jpg";

    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-olive flex flex-col items-center justify-center text-milky overflow-hidden px-4"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      style={{ willChange: "opacity" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
        exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)", transition: { duration: 0.6, ease: "easeInOut" } }}
        className="flex flex-col items-center text-center gap-5 sm:gap-6"
        style={{ willChange: "transform, opacity, filter" }}
      >
        <img 
          src="https://res.cloudinary.com/dbnhwdyve/image/upload/v1786111313/Emblem_nizhxq.png" 
          alt="Royal Park Emblem"
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain brightness-0 invert"
        />
        <span className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-[0.2em] font-light text-[#edebe1] uppercase">
          yeni həyat tərzi
        </span>
        <img 
          src="https://res.cloudinary.com/dbnhwdyve/image/upload/v1786111313/Emblem_nizhxq.png" 
          alt="Royal Park Emblem"
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain brightness-0 invert"
        />
      </motion.div>
    </motion.div>
  );
};

export const HandDrawnImage = ({ src, alt, className = "" }: { src: string, alt: string, className?: string }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        initial={{ 
          opacity: 0, 
          scale: 1.05
        }}
        whileInView={{ 
          opacity: 1, 
          scale: 1
        }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: true }}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const { lang, setLang, t } = useI18n();
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  const getPillStyle = (path: string) => {
    if (isActive(path)) {
      return "w-full border-2 border-white text-[#56565c] font-bold rounded-full py-2 sm:py-2.5 px-4 text-center text-xs sm:text-base md:text-lg font-serif transition-all duration-300 block shadow-sm";
    }
    return "w-full border-2 border-white rounded-full py-2 sm:py-2.5 px-4 text-center text-xs sm:text-base md:text-lg font-serif text-white hover:bg-white/10 transition-all duration-300 block shadow-sm";
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navBg = menuOpen ? 'bg-[#b1ba88]' : 'bg-[#b1ba88] shadow-sm';
  const navText = 'text-[#edebe1]';
  const logoColor = '#edebe1';

  return (
    <>
      <div className="texture-bg" />
      <div className="min-h-screen bg-milky text-charcoal font-sans selection:bg-olive selection:text-milky flex flex-col relative z-10">
        {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 md:px-8 xl:px-12 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300 ${navBg} ${navText}`}>
        <div className="flex items-center gap-3 sm:gap-6 xl:gap-8 shrink-0 min-w-0 flex-1">
          <Link 
            to="/" 
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex flex-col items-center group shrink-0"
          >
            <LogoIcon colorHex={logoColor} className="w-12 sm:w-14 md:w-16 xl:w-20 h-auto transition-transform group-hover:scale-105" />
          </Link>

          {/* Nav items on desktop in header (hidden when burger menu is open) */}
          {!menuOpen && (
            <div className="hidden md:flex items-center gap-2.5 sm:gap-4 xl:gap-6 text-[11px] sm:text-xs xl:text-sm tracking-wider uppercase font-medium overflow-x-auto no-scrollbar py-1">
              <Link to="/about" className={`transition-colors whitespace-nowrap shrink-0 ${isActive('/about') ? 'text-[#56565c] font-bold' : 'hover:text-white'}`}>{t.nav.about}</Link>
              <Link to="/map" className={`transition-colors whitespace-nowrap shrink-0 ${isActive('/map') ? 'text-[#56565c] font-bold' : 'hover:text-white'}`}>{t.nav.map}</Link>
              <Link to="/villas" className={`transition-colors whitespace-nowrap shrink-0 ${isActive('/villas') ? 'text-[#56565c] font-bold' : 'hover:text-white'}`}>{t.nav.villas}</Link>
              <Link to="/townhouses" className={`transition-colors whitespace-nowrap shrink-0 ${isActive('/townhouses') ? 'text-[#56565c] font-bold' : 'hover:text-white'}`}>{t.nav.townhouses}</Link>
              <Link to="/gallery" className={`transition-colors whitespace-nowrap shrink-0 ${isActive('/gallery') ? 'text-[#56565c] font-bold' : 'hover:text-white'}`}>{t.nav.gallery}</Link>
              <Link to="/offers" className={`transition-colors whitespace-nowrap shrink-0 ${isActive('/offers') ? 'text-[#56565c] font-bold' : 'hover:text-white'}`}>{t.nav.offers}</Link>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 pl-1 relative z-50">
          {menuOpen && (
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm tracking-widest font-serif uppercase text-white/90 mr-1 sm:mr-2">
              <button 
                onClick={() => setLang('en')} 
                className={`py-0.5 px-1 transition-all cursor-pointer ${lang === 'en' ? 'text-white font-bold border-b-2 border-white' : 'opacity-70 hover:opacity-100'}`}
              >
                EN
              </button>
              <span className="opacity-40 text-[10px]">|</span>
              <button 
                onClick={() => setLang('ru')} 
                className={`py-0.5 px-1 transition-all cursor-pointer ${lang === 'ru' ? 'text-white font-bold border-b-2 border-white' : 'opacity-70 hover:opacity-100'}`}
              >
                RU
              </button>
              <span className="opacity-40 text-[10px]">|</span>
              <button 
                onClick={() => setLang('az')} 
                className={`py-0.5 px-1 transition-all cursor-pointer ${lang === 'az' ? 'text-white font-bold border-b-2 border-white' : 'opacity-70 hover:opacity-100'}`}
              >
                AZ
              </button>
            </div>
          )}
          <button onClick={toggleMenu} className="p-1.5 hover:opacity-70 transition-opacity cursor-pointer text-[#edebe1] ml-1" aria-label="Toggle Menu">
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* Fullscreen Burger Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#b1ba88] text-[#edebe1] flex flex-col justify-center items-center px-4 py-16 sm:py-20 overflow-y-auto overscroll-contain"
            style={{ touchAction: 'pan-y' }}
          >
            {/* Pill Buttons Container */}
            <div className="flex flex-col items-center justify-center gap-2.5 sm:gap-3.5 w-full max-w-[240px] sm:max-w-[300px] md:max-w-[340px] my-auto py-4">
              <Link 
                to="/" 
                onClick={toggleMenu} 
                className={getPillStyle('/')}
              >
                {t.nav.home}
              </Link>

              {/* Section links in pill style - shown on mobile, hidden on desktop */}
              <div className="w-full flex flex-col gap-2.5 sm:gap-3.5 md:hidden">
                <Link 
                  to="/about" 
                  onClick={toggleMenu} 
                  className={getPillStyle('/about')}
                >
                  {t.nav.about}
                </Link>
                <Link 
                  to="/map" 
                  onClick={toggleMenu} 
                  className={getPillStyle('/map')}
                >
                  {t.nav.map}
                </Link>
                <Link 
                  to="/villas" 
                  onClick={toggleMenu} 
                  className={getPillStyle('/villas')}
                >
                  {t.nav.villas}
                </Link>
                <Link 
                  to="/townhouses" 
                  onClick={toggleMenu} 
                  className={getPillStyle('/townhouses')}
                >
                  {t.nav.townhouses}
                </Link>
                <Link 
                  to="/gallery" 
                  onClick={toggleMenu} 
                  className={getPillStyle('/gallery')}
                >
                  {t.nav.gallery}
                </Link>
                <Link 
                  to="/offers" 
                  onClick={toggleMenu} 
                  className={getPillStyle('/offers')}
                >
                  {t.nav.offers}
                </Link>
              </div>
              
              <Link 
                to="/contact" 
                onClick={toggleMenu} 
                className={getPillStyle('/contact')}
              >
                {t.nav.contact}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-footer-bg text-footer-text py-12 md:py-10 px-6 md:px-12 transition-colors duration-500">
        <div className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-stretch gap-10 mb-12 md:mb-8">
            {/* Logo & Desc */}
            <div className="flex justify-center md:justify-start items-center md:items-start text-center md:text-left w-full md:w-auto">
              <LogoIcon colorHex="#efefe6" className="w-40 md:w-48 h-auto" />
            </div>
            
            {/* Action & Socials */}
            <div className="flex flex-col justify-between items-center md:items-end w-full md:w-auto mt-6 md:mt-0">
              <Link to="/contact" className="text-[#edebe1] uppercase tracking-widest text-sm font-medium hover:text-white transition-all text-center mb-8 md:mb-0">
                {t.nav.contact}
              </Link>
              <div className="flex items-center gap-4 w-full justify-center md:justify-end">
                <a href="https://www.instagram.com/royalpark.residentialcomplex/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#edebe1]/30 text-[#edebe1] flex items-center justify-center hover:bg-olive hover:text-milky hover:border-olive transition-all">
                  <Instagram size={18} />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61585679425959&mibextid=wwXIfr&rdid=kORMTXlJpUhgkRLe&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AMA4sLMge%2F%3Fmibextid%3DwwXIfr#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#edebe1]/30 text-[#edebe1] flex items-center justify-center hover:bg-olive hover:text-milky hover:border-olive transition-all">
                  <Facebook size={18} />
                </a>
                <a href="https://www.tiktok.com/@royalpark.baku" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#edebe1]/30 text-[#edebe1] flex items-center justify-center hover:bg-olive hover:text-milky hover:border-olive transition-all">
                  <TikTokIcon size={18} />
                </a>
                <a href="https://maps.app.goo.gl/ju6vDLKyYsS4odJDA" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-[#edebe1]/30 text-[#edebe1] flex items-center justify-center hover:bg-olive hover:text-milky hover:border-olive transition-all">
                  <Map size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Horizontal Bar */}
          <div className="pt-6 border-t border-footer-text/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-footer-text/60 font-light">
            <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4">
              <button onClick={() => setLegalModalOpen(true)} className="hover:text-olive transition-colors">{t.footer.privacy}</button>
              <button onClick={() => setLegalModalOpen(true)} className="hover:text-olive transition-colors">{t.footer.terms}</button>
              <button onClick={() => setLegalModalOpen(true)} className="hover:text-olive transition-colors">{t.footer.cookies}</button>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8 text-center md:text-right">
              <div>&copy; 2026 Royal Park. {t.footer.rights}</div>
              <div className="uppercase tracking-widest text-[10px]">
                Powered by <a href="https://coyora.studio/" target="_blank" rel="noopener noreferrer" className="hover:text-olive transition-colors underline underline-offset-2">Coyora Studio</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      <AnimatePresence>
        {legalModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-charcoal/40"
            onClick={() => setLegalModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-milky w-full max-w-2xl mx-auto max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl p-6 md:p-10 relative text-charcoal"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setLegalModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-charcoal/50 hover:text-olive transition-colors"
              >
                <X size={24} />
              </button>
              
              <h2 className="text-2xl md:text-3xl font-serif mb-8 text-olive">{t.legal.title}</h2>
              
              <div className="space-y-8 font-light text-sm md:text-base leading-relaxed text-charcoal/80">
                <section>
                  <h3 className="text-lg font-medium text-charcoal mb-3">{t.legal.data_protection_title}</h3>
                  <p className="mb-2">{t.legal.data_protection_p1}</p>
                  <p>{t.legal.data_protection_p2}</p>
                </section>
                
                <section>
                  <h3 className="text-lg font-medium text-charcoal mb-3">{t.legal.rights_title}</h3>
                  <p className="mb-2">{t.legal.rights_p1}</p>
                  <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>{t.legal.rights_li1}</li>
                    <li>{t.legal.rights_li2}</li>
                    <li>{t.legal.rights_li3}</li>
                  </ul>
                  <p>{t.legal.rights_p2} <a href="mailto:office@royalpark.az" className="text-olive hover:underline">office@royalpark.az</a></p>
                </section>
                
                <section>
                  <h3 className="text-lg font-medium text-charcoal mb-3">{t.legal.cookies_title}</h3>
                  <p className="mb-2">{t.legal.cookies_p1}</p>
                  <p className="mb-2">{t.legal.cookies_p2}</p>
                  <p>{t.legal.cookies_p3}</p>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};
