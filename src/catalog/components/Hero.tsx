import logoUrl from '../../assets/logo.png';

export default function Hero() {
  return (
    <section className="cat-hero">
      <div className="cat-hero-glow" />
      <div className="cat-hero-content">
        <div className="cat-hero-logo-wrap">
          <img src={logoUrl} alt="Vasito Club" className="cat-hero-logo" />
        </div>
        <h1 className="cat-hero-title">Catálogo de Postres</h1>
        <p className="cat-hero-subtitle">
          Elaborados con ingredientes frescos, amor y precisión artesanal
        </p>
        <div className="cat-hero-scroll-hint">
          <span>Scrolleá para descubrir</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
        </div>
      </div>
      <div className="cat-hero-line" />
    </section>
  );
}
