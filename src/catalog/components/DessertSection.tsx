import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import IngredientLabel from './IngredientLabel';
import type { Dessert } from '../data';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  dessert: Dessert;
}

export default function DessertSection({ dessert }: Props) {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const imgFullRef  = useRef<HTMLImageElement>(null);
  const imgExpRef   = useRef<HTMLImageElement>(null);
  const labelsRef   = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const descRef     = useRef<HTMLParagraphElement>(null);
  const listRef     = useRef<HTMLUListElement>(null);
  const priceRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    /* ── Desktop: full scroll-driven animation ── */
    mm.add('(min-width: 769px)', () => {
      const section   = sectionRef.current;
      const imgFull   = imgFullRef.current;
      const imgExp    = imgExpRef.current;
      const labels    = labelsRef.current.filter(Boolean) as HTMLDivElement[];

      if (!section || !imgFull || !imgExp) return;

      /* Main scrubbed timeline — drives the exploded-view transition */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.4,
        },
      });

      /* Phase 1 (0 → 0.5): cross-fade full → exploded */
      tl.to(imgFull, { opacity: 0, scale: 1.03, duration: 0.5 }, 0)
        .fromTo(imgExp, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.5 }, '<');

      /* Phase 2 (0.3 → end): labels appear one by one */
      labels.forEach((label, i) => {
        const fromX = label.classList.contains('ing-label--right') ? 24 : -24;
        tl.fromTo(
          label,
          { opacity: 0, x: fromX },
          { opacity: 1, x: 0, duration: 0.28 },
          0.32 + i * 0.1,
        );
      });

      /* Right-panel text — non-scrubbed, triggers once on enter */
      const textEls = [titleRef.current, descRef.current, listRef.current, priceRef.current];
      textEls.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: 'power2.out',
            delay: i * 0.08,
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          },
        );
      });
    });

    /* ── Mobile: just make everything visible ── */
    mm.add('(max-width: 768px)', () => {
      const targets = [
        imgExpRef.current,
        ...labelsRef.current,
        titleRef.current,
        descRef.current,
        listRef.current,
        priceRef.current,
      ].filter(Boolean);
      gsap.set(targets, { opacity: 1, x: 0, y: 0, scale: 1 });
    });

    return () => mm.revert();
  }, []);

  return (
    <div className="ds-section" ref={sectionRef}>
      {/* ── Left: sticky visual panel ── */}
      <div className="ds-sticky">
        <div className="ds-visual">
          <img
            ref={imgFullRef}
            src={dessert.imageFull}
            alt={dessert.name}
            className="ds-img"
          />
          <img
            ref={imgExpRef}
            src={dessert.imageExploded}
            alt={`${dessert.name} - capas`}
            className="ds-img ds-img--exploded"
          />
          {dessert.layers.map((layer, i) => (
            <IngredientLabel
              key={i}
              layer={layer}
              ref={(el) => { labelsRef.current[i] = el; }}
            />
          ))}
        </div>
      </div>

      {/* ── Right: scrollable info panel ── */}
      <div className="ds-scroll-panel">
        <div className="ds-info">
          <span className="ds-tag">{dessert.tag}</span>

          <h2 ref={titleRef} className="ds-name">{dessert.name}</h2>
          <p  ref={descRef}  className="ds-desc">{dessert.description}</p>

          <div className="ds-layers-block">
            <h3 className="ds-layers-heading">Capas &amp; Ingredientes</h3>
            <ul ref={listRef} className="ds-layers-list">
              {dessert.layers.map((layer, i) => (
                <li key={i} className="ds-layer-item">
                  <span className="ds-layer-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ds-layer-name">{layer.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div ref={priceRef} className="ds-price-block">
            <span className="ds-price-label">Precio unitario</span>
            <span className="ds-price">{dessert.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
