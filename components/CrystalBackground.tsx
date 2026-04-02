'use client';

const sharks = [
  // Large sharks
  { id: 1, size: 320, top: '8%',  duration: 22, delay: 0,    opacity: 0.12, flip: false },
  { id: 2, size: 280, top: '55%', duration: 28, delay: 6,    opacity: 0.10, flip: true  },
  // Medium sharks
  { id: 3, size: 180, top: '25%', duration: 18, delay: 3,    opacity: 0.09, flip: false },
  { id: 4, size: 200, top: '72%', duration: 24, delay: 10,   opacity: 0.08, flip: true  },
  { id: 5, size: 160, top: '42%', duration: 20, delay: 14,   opacity: 0.08, flip: false },
  // Small sharks
  { id: 6, size: 90,  top: '15%', duration: 15, delay: 2,    opacity: 0.07, flip: true  },
  { id: 7, size: 80,  top: '85%', duration: 17, delay: 8,    opacity: 0.06, flip: false },
  { id: 8, size: 100, top: '63%', duration: 19, delay: 5,    opacity: 0.07, flip: true  },
];

export default function CrystalBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <style>{`
        @keyframes swim {
          0%   { transform: translateX(-200px) translateY(0px) scaleX(var(--sx)); }
          15%  { transform: translateX(15vw)   translateY(-18px) scaleX(var(--sx)); }
          30%  { transform: translateX(30vw)   translateY(10px) scaleX(var(--sx)); }
          45%  { transform: translateX(50vw)   translateY(-14px) scaleX(var(--sx)); }
          60%  { transform: translateX(65vw)   translateY(8px) scaleX(var(--sx)); }
          75%  { transform: translateX(80vw)   translateY(-12px) scaleX(var(--sx)); }
          100% { transform: translateX(110vw)  translateY(0px) scaleX(var(--sx)); }
        }
      `}</style>

      {sharks.map((s) => (
        <img
          key={s.id}
          src="/geo-shark-bg.png"
          alt=""
          style={{
            position: 'absolute',
            top: s.top,
            left: 0,
            width: s.size,
            height: 'auto',
            opacity: s.opacity,
            animation: `swim ${s.duration}s linear ${s.delay}s infinite`,
            '--sx': s.flip ? '-1' : '1',
            transformOrigin: 'center center',
          } as React.CSSProperties}
        />
      ))}

      {/* Radial glow — keep the subtle purple ambience */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-96"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 20% 100%, rgba(217,70,239,0.08) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
