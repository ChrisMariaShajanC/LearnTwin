const FONTS = [
  { value: 'default', label: 'Normal letters', css: "system-ui, sans-serif" },
  { value: 'opendyslexic', label: 'Bouncy letters (OpenDyslexic)', css: "'OpenDyslexic', Verdana, sans-serif" },
  { value: 'atkinson', label: 'Clear letters (Atkinson Hyperlegible)', css: "'Atkinson Hyperlegible', Verdana, sans-serif" },
]

export default function FontChoice({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <fieldset>
      <legend><strong>Which letters are easiest for you to read?</strong></legend>
      <p style={{ fontSize: '0.9em', color: '#555' }}>This is only what <em>you</em> like. No font is better for everyone — pick what looks easiest. You can change it any time.</p>
      <div role="radiogroup" aria-label="Font choice" style={{ display: 'grid', gap: 10 }}>
        {FONTS.map(f => (
          <label key={f.value} className="chip" style={{ display: 'block' }}>
            <input type="radio" name="font" value={f.value} checked={value === f.value} onChange={() => onChange(f.value)} style={{ marginRight: 8 }} />
            <span>{f.label}</span>
            <span className="learning-text" style={{ display: 'block', fontFamily: f.css, marginTop: 6, fontSize: '1.05em' }}>Plants need water and light to grow.<br />b d p q &nbsp; 6 9 &nbsp; 1 2 3</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
