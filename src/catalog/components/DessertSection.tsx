import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Dessert } from '../data';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  dessert: Dessert;
}

export default function DessertSection({ dessert }: Props) {
  const sectionRef      = useRef<HTMLDivElement>(null);
  const imgFullRef      = useRef<HTMLImageElement>(null);
  const imgExpRef       = useRef<HTMLImageElement>(null);
  const labelDotsRef    = useRef<(HTMLDivElement | null)[]>([]);
  const tagRef          = useRef<HTMLSpanElement>(null);
  const titleRef        = useRef<HTMLHeadingElement>(null);
  const descRef         = useRef<HTMLParagraphElement>(null);
  const layersTitleRef  = useRef<HTMLHeadingElement>(null);
  const listItemsRef    = useRef<(HTMLLIElement | null)[]>([]);
  const priceRef        = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    /* ── Desktop: GSAP pin + scrubbed timeline ─────────────── */
    mm.add('(min-width: 769px)', () => {
      const section = sectionRef.current;
      if (!section) return;

      const labels    = labelDotsRef.current.filter(Boolean) as HTMLDivElement[];
      const listItems = listItemsRef.current.filter(Boolean) as HTMLLIElement[];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          /* Pin duration: 2.2× viewport height per dessert */
          end: () => `+=${window.innerHeight * 2.2}`,
          pin: true,
          scrub: 1.3,
          anticipatePin: 1,
        },
      });

      /* ── Phase 1 (0→0.8): image assembled → exploded ── */
      tl.to(imgFullRef.current, { opacity: 0, scale: 1.03, duration: 0.8 }, 0)
        .fromTo(
          imgExpRef.current,
          { opacity: 0, scale: 0.97 },
          { opacity: 1, scale: 1, duration: 0.8 },
          '<',
        );

      /* ── Phase 2 (0.05→0.45): tag + title + description ── */
      tl.fromTo(tagRef.current,   { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.28 }, 0.05)
        .fromTo(titleRef.current, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.35 }, 0.15)
        .fromTo(descRef.current,  { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.38 }, 0.28);

      /* ── Phase 3 (0.32→0.82): ingredient labels staggered ── */
      labels.forEach((label, i) => {
        tl.fromTo(
          label,
          { opacity: 0, x: 22 },
          { opacity: 1, x: 0, duration: 0.28 },
          0.32 + i * 0.1,
        );
      });

      /* ── Phase 4 (0.7→1.4): layers list ── */
      tl.fromTo(
        layersTitleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.26 },
        0.7,
      );
      listItems.forEach((item, i) => {
        tl.fromTo(
          item,
          { opacity: 0, x: -14 },
          { opacity: 1, x: 0, duration: 0.24 },
          0.78 + i * 0.08,
        );
      });

      /* ── Phase 5 (1.5→1.75): price ── */
      tl.fromTo(
        priceRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.25 },
        1.5,
      );
    });

    /* ── Mobile: text visible immediately, image swaps when centered ── */
    mm.add('(max-width: 768px)', () => {
      /* Show all text content right away */
      const textEls = [
        ...labelDotsRef.current,
        tagRef.current,
        titleRef.current,
        descRef.current,
        layersTitleRef.current,
        ...listItemsRef.current,
        priceRef.current,
      ].filter(Boolean);
      gsap.set(textEls, { opacity: 1, x: 0, y: 0, scale: 1 });

      /* Image swap: full ↔ exploded when image center crosses viewport center */
      let swapped = false;

      const checkPosition = () => {
        const img = imgFullRef.current;
        if (!img) return;
        const rect = img.getBoundingClientRect();
        const imgCenter = rect.top + rect.height / 2;
        const vCenter   = window.innerHeight / 2;

        if (imgCenter <= vCenter && !swapped) {
          gsap.to(imgFullRef.current, { opacity: 0, duration: 0.5, overwrite: true });
          gsap.to(imgExpRef.current,  { opacity: 1, duration: 0.5, overwrite: true });
          swapped = true;
        } else if (imgCenter > vCenter && swapped) {
          gsap.to(imgFullRef.current, { opacity: 1, duration: 0.5, overwrite: true });
          gsap.to(imgExpRef.current,  { opacity: 0, duration: 0.5, overwrite: true });
          swapped = false;
        }
      };

      window.addEventListener('scroll', checkPosition, { passive: true });
      checkPosition();

      return () => window.removeEventListener('scroll', checkPosition);
    });

    return () => mm.revert();
  }, []);

  return (
    <div className="ds-section" id={dessert.id} ref={sectionRef}>
      <div className="ds-layout">

        {/* ── Left: image + floating labels ── */}
        <div className="ds-image-col">
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
              alt={`${dessert.name} — capas`}
              className="ds-img ds-img--exploded"
            />

            {/* Floating ingredient labels */}
            {dessert.layers.map((layer, i) => (
              <div
                key={i}
                ref={(el) => { labelDotsRef.current[i] = el; }}
                className="ing-label"
                style={{ top: `${layer.topPercent}%`, opacity: 0 }}
              >
                <div className="ing-dot" />
                <div className="ing-line" />
                <span className="ing-text">{layer.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: text content ── */}
        <div className="ds-text-col">
          <div className="ds-info">
            <span ref={tagRef}   className="ds-tag"  style={{ opacity: 0 }}>{dessert.tag}</span>
            <h2   ref={titleRef} className="ds-name" style={{ opacity: 0 }}>{dessert.name}</h2>
            <p    ref={descRef}  className="ds-desc" style={{ opacity: 0 }}>{dessert.description}</p>

            <div className="ds-layers-block">
              <h3
                ref={layersTitleRef}
                className="ds-layers-heading"
                style={{ opacity: 0 }}
              >
                Capas &amp; Ingredientes
              </h3>
              <ul className="ds-layers-list">
                {/* Reverse so 01 = top layer, last number = base layer */}
                {[...dessert.layers].reverse().map((layer, i) => (
                  <li
                    key={layer.name + i}
                    ref={(el) => { listItemsRef.current[i] = el; }}
                    className="ds-layer-item"
                    style={{ opacity: 0 }}
                  >
                    <span className="ds-layer-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="ds-layer-name">{layer.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div ref={priceRef} className="ds-price-block" style={{ opacity: 0 }}>
              <div className="ds-price-row">
                <span className="ds-price-label">Precio unitario</span>
                <span className="ds-price">{dessert.price}</span>
              </div>
              <div className="ds-price-aside">
                <span className="ds-promo-badge">🎉 3 o más: $4.000 c/u</span>
                <span className="ds-shipping">Envío a consultar</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
