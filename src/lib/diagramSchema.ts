export type DiagramSpec = {
  type: 'waterCycle' | 'photosynthesis' | 'binaryTree' | 'fraction' | 'flowchart' | 'timeline' | 'conceptMap'
  title?: string
  complexity?: 'simple' | 'guided' | 'detailed'
  steps?: { label: string; detail?: string }[]
  nodes?: { id: string; label: string }[]
  edges?: { from: string; to: string }[]
  fraction?: { numerator: number; denominator: number }
}

export function validateDiagramSpec(input: unknown): { ok: boolean; errors: string[]; spec?: DiagramSpec } {
  const errors: string[] = []
  if (!input || typeof input !== 'object') { errors.push('Diagram spec must be an object'); return { ok: false, errors } }
  const spec = input as any
  const allowed = ['waterCycle', 'photosynthesis', 'binaryTree', 'fraction', 'flowchart', 'timeline', 'conceptMap']
  if (!allowed.includes(spec.type)) errors.push('Unsupported diagram type')
  if (spec.complexity && !['simple', 'guided', 'detailed'].includes(spec.complexity)) errors.push('Invalid complexity')
  if (spec.steps && !Array.isArray(spec.steps)) errors.push('steps must be an array')
  if (spec.nodes && !Array.isArray(spec.nodes)) errors.push('nodes must be an array')
  if (spec.edges && !Array.isArray(spec.edges)) errors.push('edges must be an array')
  if (spec.fraction && (typeof spec.fraction.numerator !== 'number' || typeof spec.fraction.denominator !== 'number' || spec.fraction.denominator <= 0)) errors.push('Invalid fraction')
  if (errors.length) return { ok: false, errors }
  return { ok: true, errors: [], spec: spec as DiagramSpec }
}
