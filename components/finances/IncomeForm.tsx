'use client'

import { useState } from 'react'
import { createIncome } from '@/lib/actions/incomes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

export function IncomeForm({ onClose }: { onClose: () => void }) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('otros')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() || !amount) {
      toast.error('Completa todos los campos')
      return
    }
    setLoading(true)
    try {
      await createIncome({ description, amount: parseFloat(amount), category })
      toast.success('Ingreso registrado')
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-[#2a2a38] bg-[#1a1a24] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">Nuevo ingreso</h3>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Descripción</Label>
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej: Ingreso por consultoría" required />
        </div>
        <div className="space-y-1">
          <Label>Monto (COP)</Label>
          <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="200000" min="0" required />
        </div>
        <div className="sm:col-span-2 space-y-1">
          <Label>Categoría</Label>
          <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej: Consultoría, Otros..." />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
        <Button type="submit" size="sm" variant="success" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar ingreso'}
        </Button>
      </div>
    </form>
  )
}
