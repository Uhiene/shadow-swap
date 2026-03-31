'use client';

export default function CrystalBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Large background crystal — top left */}
      <svg
        className="absolute -top-32 -left-32 opacity-10 crystal-float"
        width="500"
        height="500"
        viewBox="0 0 500 500"
        fill="none"
        style={{ animationDelay: '0s' }}
      >
        <polygon
          points="250,20 480,180 420,420 80,420 20,180"
          fill="url(#grad1)"
        />
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A1FB8" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Medium crystal — top right */}
      <svg
        className="absolute -top-16 -right-16 opacity-10 crystal-float"
        width="380"
        height="380"
        viewBox="0 0 380 380"
        fill="none"
        style={{ animationDelay: '2s' }}
      >
        <polygon
          points="190,10 360,130 320,340 60,340 20,130"
          fill="url(#grad2)"
        />
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* Small diamond — center right */}
      <svg
        className="absolute top-1/2 -right-10 opacity-8 crystal-float"
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        style={{ animationDelay: '4s' }}
      >
        <polygon
          points="100,10 190,100 100,190 10,100"
          fill="url(#grad3)"
        />
        <defs>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D946EF" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>

      {/* Small triangle — bottom left */}
      <svg
        className="absolute bottom-20 -left-10 opacity-8 crystal-float"
        width="240"
        height="240"
        viewBox="0 0 240 240"
        fill="none"
        style={{ animationDelay: '1s' }}
      >
        <polygon
          points="120,10 230,210 10,210"
          fill="url(#grad4)"
        />
        <defs>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>

      {/* Tiny hexagon — mid left */}
      <svg
        className="absolute top-1/3 left-10 opacity-6 crystal-float"
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        style={{ animationDelay: '3s' }}
      >
        <polygon
          points="60,5 110,30 110,90 60,115 10,90 10,30"
          fill="url(#grad5)"
        />
        <defs>
          <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
        </defs>
      </svg>

      {/* Radial glow — center */}
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
