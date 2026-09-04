/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { I18nProvider } from './i18n';
import { Preloader, Layout } from './components';
import { Home, AboutPage, MapPage, VillasPage, TownhousesPage, GalleryPage, OffersPage, Contact } from './pages';

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <I18nProvider>
      <Router>
        {/* Layout and page content mount immediately in the background so hero images preload during preloader */}
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/location" element={<MapPage />} />
            <Route path="/villas" element={<VillasPage />} />
            <Route path="/townhouses" element={<TownhousesPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/offers" element={<OffersPage />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Layout>

        {/* Preloader overlay on top that smoothly fades out to reveal the fully loaded website */}
        <AnimatePresence>
          {loading && <Preloader key="preloader" onComplete={() => setLoading(false)} />}
        </AnimatePresence>
      </Router>
      <SpeedInsights />
    </I18nProvider>
  );
}
