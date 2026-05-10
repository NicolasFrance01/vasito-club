import logoUrl from '../../assets/logo.png';

export default function CatalogNavbar() {
  return (
    <nav className="cat-navbar">
      <div className="cat-navbar-inner">
        <img src={logoUrl} alt="Vasito Club" className="cat-navbar-logo" />
        <div className="cat-navbar-links">
          <a href="#contacto" className="cat-nav-link">Contacto</a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noreferrer"
            className="cat-nav-link cat-nav-cta"
          >
            Instagram
          </a>
        </div>
      </div>
    </nav>
  );
}
