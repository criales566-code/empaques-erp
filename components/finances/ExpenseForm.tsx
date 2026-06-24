'use client'

import { useState } from 'react'
import { createExpense } from '@/lib/actions/expenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORIES = [
  { value: 'arriendo', label: 'Arriendo' },
  { value: 'nomina', label: 'Nómina' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'materia_prima', label: 'Materia prima' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'impuestos', label: 'Impuestos' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'general', label: 'General' },
]

export function ExpenseForm({ onClose }: { onClose: () => void }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('general')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() || !amount) {
      toast.error('Completa todos los campos')
      return
    }
    setLoading(true)
    try {
      await createExpense({ description, amount: parseFloat(amount), category })
      toast.success('Gasto registrado')
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-900">Nuevo gasto</h3>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Descripción</Label>
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej: Arriendo local" required />
        </div>
        <div className="space-y-1">
          <Label>Monto (COP)</Label>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500000" min="0" required />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label>Categoría</Label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
        <Button type="submit" size="sm" variant="destructive" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar gasto'}
        </Button>
      </div>
    </form>
  )
}
