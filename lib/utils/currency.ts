// ============================================================
// Currency utils — COP (Colombian Pesos)
// ============================================================

const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const COP_COMPACT_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  notation: 'compact',
})

export function formatCOP(value: number): string {
  return COP_FORMATTER.format(value)
}

export function formatCOPCompact(value: number): string {
  return COP_COMPACT_FORMATTER.format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-CO').format(value)
}

export function parseCOP(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
}
