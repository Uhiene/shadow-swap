'use client';

const bubbles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 12 + 4, // 4px - 16px
  left: Math.random() * 100 + '%',
  duration: Math.random() * 10 + 8, // 8s - 18s
  delay: Math.random() * 5,
  opacity: Math.random() * 0.3 + 0.1,
}));

export default function Bubbles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <style>{`
        @keyframes bubbleUp {
          0% { transform: translateY(100vh) scale(1); opacity: var(--opacity); }
          100% { transform: translateY(-20px) scale(0.8); opacity: 0; }
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
            background: 'rgba(173, 216, 230, 0.4)', // soft bubble color
            opacity: b.opacity,
            animation: `bubbleUp ${b.duration}s linear infinite`,
            animationDelay: `-${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}