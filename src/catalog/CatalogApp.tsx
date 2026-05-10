import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CatalogNavbar from './components/CatalogNavbar';
import Hero from './components/Hero';
import DessertSection from './components/DessertSection';
import CatalogFooter from './components/CatalogFooter';
import WatermarkBg from './components/WatermarkBg';
import { desserts } from './data';
import './catalog.css';

gsap.registerPlugin(ScrollTrigger);

export default function CatalogApp() {
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="cat-root">
      {/* Page-wide watermark — sits behind all sections */}
      <WatermarkBg />

      <CatalogNavbar />
      <Hero />
      <main className="cat-main">
        {desserts.map((dessert) => (
          <DessertSection key={dessert.id} dessert={dessert} />
        ))}
      </main>
      <CatalogFooter />
    </div>
  );
}
