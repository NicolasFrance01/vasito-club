const IG_URL = 'https://www.instagram.com/vasitoclub?igsh=MW1hMWN6aXlqY3V3aQ==';

const WA_MSG = encodeURIComponent(
  'Hola buenas, les hablo desde su página de catálogo de los postres, estoy interesado en pedir ...',
);

const contacts = [
  { label: '+54 9 3512 01-1783', phone: '5493512011783' },
  { label: '+54 9 3516 00-2716', phone: '5493516002716' },
  { label: '+54 9 3517 71-8804', phone: '5493517718804' },
];

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
            <a href={IG_URL} target="_blank" rel="noreferrer" className="cat-footer-link">
              Instagram
            </a>
          </div>

          <div className="cat-footer-col">
            <h4>WhatsApp</h4>
            {contacts.map((c, i) => (
              <a
                key={i}
                href={`https://wa.me/${c.phone}?text=${WA_MSG}`}
                target="_blank"
                rel="noreferrer"
                className="cat-footer-link"
              >
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="cat-footer-bottom">
        <p>© {new Date().getFullYear()} Vasito Club. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
