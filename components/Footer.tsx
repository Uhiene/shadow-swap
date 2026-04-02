import { Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="mt-auto py-6"
      style={{ borderTop: '1px solid rgba(167, 139, 250, 0.08)' }}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold"
            style={{
              background: 'var(--gradient-crystal)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ShadowSwap
          </span>
          <span className="text-[var(--text-muted)] text-xs">Trade Large. Stay Hidden.</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
          <span>Built on Arbitrum Sepolia</span>
          <span>·</span>
          <span>Powered by iExec Nox</span>
          <span>·</span>
          <span
            className="hidden-badge px-2 py-0.5 rounded-full text-white text-[10px] font-semibold inline-flex items-center gap-1"
          >
            <Lock size={9} /> Confidential
          </span>
        </div>
      </div>
    </footer>
  );
}
