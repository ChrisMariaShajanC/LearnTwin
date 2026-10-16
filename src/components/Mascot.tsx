interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  mood?: 'happy' | 'thinking' | 'excited' | 'celebrating' | 'waving'
  className?: string
  animated?: boolean
}

const dim = { xs: 48, sm: 72, md: 110, lg: 160, xl: 220 }

export default function Mascot({
  size = 'md',
  mood = 'happy',
  className = '',
  animated = true,
}: Props) {
  const d = dim[size]
  const isExcited = mood === 'excited' || mood === 'celebrating'
  const isThinking = mood === 'thinking'
  const isWaving = mood === 'waving'

  /* Eye position shifts by mood */
  const pupilOffset = isThinking ? { x: -1, y: -2 } : isExcited ? { x: 0, y: -1 } : { x: 1, y: 1 }

  return (
    <div
      className={`relative inline-flex items-end justify-center ${className}`}
      style={{ width: d, height: d * 1.28 }}
    >
      {/* Soft shadow / glow beneath */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full opacity-30 blur-xl"
        style={{
          width: d * .8,
          height: d * .22,
          background: 'var(--primary)',
        }}
      />

      <svg
        viewBox="0 0 120 154"
        fill="none"
        style={{ width: d, height: d * 1.28 }}
        aria-hidden="true"
      >
        {/* ── Feet ── */}
        <ellipse cx="43" cy="148" rx="16" ry="8" fill="#3ABDB5" />
        <ellipse cx="77" cy="148" rx="16" ry="8" fill="#3ABDB5" />

        {/* ── Left arm ── */}
        <path
          d={isWaving ? 'M 20 78 Q 4 60 10 46' : 'M 20 80 Q 5 90 12 102'}
          stroke="#3ABDB5"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          style={isWaving ? { animation: 'wiggle 1.4s ease-in-out infinite', transformOrigin: '20px 80px' } : undefined}
        />
        <circle cx={isWaving ? 10 : 12} cy={isWaving ? 46 : 102} r="7" fill="#4ECDC4" />

        {/* ── Right arm ── */}
        <path
          d="M 100 80 Q 115 90 108 102"
          stroke="#3ABDB5"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="108" cy="102" r="7" fill="#4ECDC4" />

        {/* ── Body ── */}
        <path
          d="M 60 18 C 95 18 108 42 108 72 C 108 106 90 138 60 140 C 30 138 12 106 12 72 C 12 42 25 18 60 18 Z"
          fill="var(--primary)"
        />
        {/* Inner shine */}
        <ellipse cx="60" cy="52" rx="28" ry="20" fill="rgba(255,255,255,.14)" />

        {/* ── Eyes ── */}
        {/* Left eye white */}
        <circle cx="43" cy="66" r="13" fill="white" />
        {/* Left pupil */}
        <circle cx={43 + pupilOffset.x} cy={66 + pupilOffset.y} r="7" fill="#1C1B2E" />
        {/* Left shine */}
        <circle cx={46 + pupilOffset.x} cy={62 + pupilOffset.y} r="3" fill="white" />

        {/* Right eye white */}
        <circle cx="77" cy="66" r="13" fill="white" />
        {/* Right pupil */}
        <circle cx={77 + pupilOffset.x} cy={66 + pupilOffset.y} r="7" fill="#1C1B2E" />
        {/* Right shine */}
        <circle cx={80 + pupilOffset.x} cy={62 + pupilOffset.y} r="3" fill="white" />

        {/* Eyebrows — excited */}
        {isExcited && (
          <>
            <path d="M 34 51 Q 43 46 52 51" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 68 51 Q 77 46 86 51" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        )}

        {/* ── Mouth ── */}
        {mood === 'happy' || mood === 'waving' ? (
          <path d="M 46 86 Q 60 98 74 86" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        ) : mood === 'excited' || mood === 'celebrating' ? (
          /* Open happy mouth */
          <>
            <path d="M 44 84 Q 60 100 76 84" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <ellipse cx="60" cy="91" rx="10" ry="6" fill="rgba(255,255,255,.25)" />
          </>
        ) : (
          /* Thinking — small line */
          <path d="M 50 88 Q 60 92 70 88" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}

        {/* ── Cheek blush (excited) ── */}
        {isExcited && (
          <>
            <ellipse cx="33" cy="78" rx="7" ry="4" fill="rgba(255,107,107,.35)" />
            <ellipse cx="87" cy="78" rx="7" ry="4" fill="rgba(255,107,107,.35)" />
          </>
        )}

        {/* ── Antenna ── */}
        <line x1="60" y1="18" x2="60" y2="4" stroke="#3ABDB5" strokeWidth="3.5" strokeLinecap="round" />
        {/* Antenna ball */}
        <circle cx="60" cy="-2" r="9" fill="#FF6B6B" />
        <circle cx="60" cy="-2" r="5" fill="#FF8F8F" />
        <circle cx="63" cy="-5" r="2" fill="rgba(255,255,255,.7)" />
      </svg>

      {/* Sparkle decorations */}
      {(isExcited || animated) && (
        <>
          <span
            className="absolute animate-wiggle select-none pointer-events-none"
            style={{
              top: '4%',
              right: '-10%',
              fontSize: d * .18,
              animationDelay: '.2s',
            }}
          >
            ✨
          </span>
          <span
            className="absolute animate-float-b select-none pointer-events-none"
            style={{
              bottom: '12%',
              left: '-12%',
              fontSize: d * .14,
              animationDelay: '.7s',
            }}
          >
            ⭐
          </span>
        </>
      )}
      {mood === 'celebrating' && (
        <span
          className="absolute animate-bounce-in select-none pointer-events-none"
          style={{ top: '-4%', left: '-14%', fontSize: d * .16 }}
        >
          🎉
        </span>
      )}
    </div>
  )
}
