export default function CatalogFooter() {
  return (
    <footer className="cat-footer" id="contacto">
      <div className="cat-footer-inner">
        <div className="cat-footer-brand">
          <h3 className="cat-footer-name">Vasito Club</h3>
          <p className="cat-footer-tagline">Postres artesanales con amor</p>
        </div>

        <div className="cat-footer-cols">
          <div className="cat-footer-col">
            <h4>Redes</h4>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="cat-footer-link">
              Instagram
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer" className="cat-footer-link">
              Facebook
            </a>
            <a href="https://wa.me/" target="_blank" rel="noreferrer" className="cat-footer-link">
              WhatsApp
            </a>
          </div>
          <div className="cat-footer-col">
            <h4>Contacto</h4>
            <span className="cat-footer-link">@vasitoclub</span>
            <span className="cat-footer-link">Argentina</span>
          </div>
        </div>
      </div>

      <div className="cat-footer-bottom">
        <p>© {new Date().getFullYear()} Vasito Club. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
