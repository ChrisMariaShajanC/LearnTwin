export default function GeometricAccents() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Large soft circles */}
      <div
        className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-[0.06]"
        style={{ background: 'var(--primary)' }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-[0.06]"
        style={{ background: 'var(--accent)' }}
      />

      {/* Medium accent circles */}
      <div
        className="absolute top-1/3 -right-8 w-32 h-32 rounded-full opacity-[0.08] animate-float-b"
        style={{ background: 'var(--primary)', animationDuration: '6s' }}
      />
      <div
        className="absolute bottom-1/3 -left-8 w-24 h-24 rounded-full opacity-[0.07] animate-float-b"
        style={{ background: '#A78BFA', animationDelay: '2s', animationDuration: '7s' }}
      />

      {/* Small dot clusters */}
      <div className="absolute top-20 right-24 flex gap-2 opacity-20">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />
        ))}
      </div>
      <div className="absolute bottom-24 left-32 flex flex-col gap-2 opacity-15">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
        ))}
      </div>

      {/* Diamond / rotated square accents */}
      <div
        className="absolute top-40 left-16 w-6 h-6 opacity-15 rotate-45"
        style={{ background: '#F59E0B', borderRadius: '2px' }}
      />
      <div
        className="absolute bottom-40 right-32 w-5 h-5 opacity-20 rotate-45"
        style={{ background: 'var(--primary)', borderRadius: '2px' }}
      />

      {/* Zigzag / triangle hint via SVG */}
      <svg
        className="absolute top-1/2 right-8 opacity-10"
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
      >
        <polygon points="20,4 36,36 4,36" fill="currentColor" style={{ color: 'var(--accent)' }} />
      </svg>
      <svg
        className="absolute top-16 left-1/3 opacity-10"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
      >
        <polygon points="16,2 30,30 2,30" fill="currentColor" style={{ color: 'var(--primary)' }} />
      </svg>
    </div>
  )
}
