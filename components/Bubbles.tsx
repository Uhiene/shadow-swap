'use client';

const bubbleCount = 30;

export default function Bubbles() {
  const bubbles = Array.from({ length: bubbleCount }, (_, i) => ({
    id: i,
    size: Math.random() * 20 + 8,          // bubble size: 8px - 28px
    left: Math.random() * 100 + '%',       // horizontal start
    duration: Math.random() * 12 + 8,      // float duration: 8s - 20s
    delay: Math.random() * 5,              // random delay
    opacity: Math.random() * 0.4 + 0.3,    // visible but soft
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <style>{`
        @keyframes bubbleUp {
          0% {
            transform: translateY(100vh) scale(1);
            opacity: var(--opacity);
          }
          100% {
            transform: translateY(-10vh) scale(1.2);
            opacity: 0;
          }
        }
      `}</style>

      {bubbles.map((b) => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            bottom: 0,
            left: b.left,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            opacity: b.opacity,
            animation: `bubbleUp ${b.duration}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}