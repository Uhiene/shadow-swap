export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        Dashboard
      </h1>
      <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
        Your balances, active trades, and token wrap/unwrap controls.
      </p>
      <div className="glass rounded-2xl p-12 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <p style={{ color: 'var(--text-muted)' }}>
          Dashboard — coming next.
        </p>
      </div>
    </div>
  );
}
