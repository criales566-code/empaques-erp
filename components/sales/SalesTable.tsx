'use client'

import { useState } from 'react'
import type { Sale } from '@/lib/types'
import { deleteSale } from '@/lib/actions/sales'
import { formatCOP } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Trash2, ShoppingCart, Plus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  credito: 'Crédito',
}

const PAYMENT_VARIANTS: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
  efectivo: 'success',
  transferencia: 'info',
  tarjeta: 'warning',
  credito: 'default',
}

export function SalesTable({ sales }: { sales: Sale[] }) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteSale(deleteId)
      toast.success('Venta eliminada y stock restaurado')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-xl">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <ShoppingCart className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Sin ventas registradas</p>
        <p className="text-xs text-slate-400 mt-1 mb-4">Registra tu primera venta para comenzar</p>
        <Link href="/sales/new">
          <Button size="sm">
            <Plus className="w-3.5 h-3.5" />
            Nueva venta
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Pago</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Utilidad</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map(sale => (
                <tr key={sale.id} className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {format(new Date(sale.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{sale.customer_name}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge variant={PAYMENT_VARIANTS[sale.payment_method] || 'default'}>
                      {PAYMENT_LABELS[sale.payment_method] || sale.payment_method}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCOP(sale.total)}</td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <span className="text-emerald-600 font-medium">{formatCOP(sale.profit)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteId(sale.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar venta?</DialogTitle>
            <DialogDescription>
              El stock de los productos será restaurado automáticamente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
