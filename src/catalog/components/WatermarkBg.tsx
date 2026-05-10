import logoUrl from '../../assets/logo.png';

/* Positions hand-tuned so logos feel organically scattered */
const marks = [
  { x: '4%',  y: '6%',  size: 78,  rot: -18 },
  { x: '68%', y: '4%',  size: 62,  rot: 14  },
  { x: '88%', y: '22%', size: 104, rot: -7  },
  { x: '3%',  y: '38%', size: 68,  rot: 27  },
  { x: '46%', y: '16%', size: 88,  rot: -34 },
  { x: '26%', y: '50%', size: 76,  rot: 9   },
  { x: '82%', y: '57%', size: 70,  rot: -21 },
  { x: '13%', y: '70%', size: 96,  rot: 17  },
  { x: '57%', y: '75%', size: 72,  rot: -11 },
  { x: '36%', y: '86%', size: 58,  rot: 31  },
  { x: '74%', y: '88%', size: 108, rot: -4  },
  { x: '52%', y: '44%', size: 64,  rot: 22  },
];

export default function WatermarkBg() {
  return (
    <div className="wm-bg" aria-hidden="true">
      {marks.map((m, i) => (
        <img
          key={i}
          src={logoUrl}
          alt=""
          className="wm-logo"
          style={{
            left: m.x,
            top: m.y,
            width: m.size,
            transform: `rotate(${m.rot}deg)`,
          }}
        />
      ))}
    </div>
  );
}
