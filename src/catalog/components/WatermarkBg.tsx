import logoUrl from '../../assets/logo.png';

/* 300 logos fill the 200vw × 200vh rotated grid on any screen size */
const COUNT = 300;

export default function WatermarkBg() {
  return (
    <div className="wm-bg" aria-hidden="true">
      {Array.from({ length: COUNT }, (_, i) => (
        <img key={i} src={logoUrl} alt="" className="wm-logo" />
      ))}
    </div>
  );
}
