'use client'

import type { Product, Sale, Expense, Income } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { formatCOP } from '@/lib/utils/currency'
import {
  calculateInventoryValue,
  totalSales,
  totalProfit,
  totalExpenses,
  totalIncomes,
} from '@/lib/utils/calculations'
import { Package, ShoppingCart, DollarSign, Download, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  products: Product[]
  sales: Sale[]
  expenses: Expense[]
  incomes: Income[]
}

export function ReportsGenerator({ products, sales, expenses, incomes }: Props) {

  async function generateInventoryPDF() {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF()
    const now = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })
    const totalValue = calculateInventoryValue(products)

    doc.setFillColor(99, 102, 241)
    doc.rect(0, 0, 210, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('EMPAQUES JHEIMY — REPORTE DE INVENTARIO', 14, 18)

    doc.setTextColor(80, 80, 80)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generado: ${now}   |   Productos: ${products.length}   |   Valor total: ${formatCOP(totalValue)}`, 14, 36)

    autoTable(doc, {
      startY: 42,
      head: [['Nombre', 'SKU', 'Categoría', 'Costo', 'Precio venta', 'Stock', 'Valor inventario']],
      body: products.map(p => [
        p.name,
        p.sku || '-',
        p.category || '-',
        formatCOP(p.cost_price),
        formatCOP(p.sale_price),
        String(p.stock),
        formatCOP(p.stock * p.cost_price),
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 248, 255] },
      foot: [['', '', '', '', '', 'TOTAL', formatCOP(totalValue)]],
      footStyles: { fillColor: [220, 220, 255], fontStyle: 'bold', fontSize: 9 },
    })

    doc.save(`inventario_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`)
  }

  async function generateSalesPDF() {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF()
    const now = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })
    const totalVentas = totalSales(sales)
    const totalUtil = totalProfit(sales)

    doc.setFillColor(16, 185, 129)
    doc.rect(0, 0, 210, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('EMPAQUES JHEIMY — REPORTE DE VENTAS', 14, 18)

    doc.setTextColor(80, 80, 80)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generado: ${now}   |   Ventas: ${sales.length}   |   Ingresos: ${formatCOP(totalVentas)}   |   Utilidad: ${formatCOP(totalUtil)}`, 14, 36)

    autoTable(doc, {
      startY: 42,
      head: [['Fecha', 'Cliente', 'Método pago', 'Total', 'Utilidad']],
      body: sales.map(s => [
        format(new Date(s.created_at), 'dd/MM/yyyy HH:mm', { locale: es }),
        s.customer_name,
        s.payment_method,
        formatCOP(s.total),
        formatCOP(s.profit),
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 255, 248] },
      foot: [['', '', 'TOTALES', formatCOP(totalVentas), formatCOP(totalUtil)]],
      footStyles: { fillColor: [200, 240, 220], fontStyle: 'bold', fontSize: 9 },
    })

    doc.save(`ventas_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`)
  }

  async function generateCashFlowPDF() {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF()
    const now = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })

    const totalVentas = totalSales(sales)
    const totalInc = totalIncomes(incomes)
    const totalExp = totalExpenses(expenses)
    const totalIngresos = totalVentas + totalInc
    const flujo = totalIngresos - totalExp

    doc.setFillColor(245, 158, 11)
    doc.rect(0, 0, 210, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('EMPAQUES JHEIMY — FLUJO DE CAJA', 14, 18)

    doc.setTextColor(80, 80, 80)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generado: ${now}`, 14, 36)

    autoTable(doc, {
      startY: 42,
      head: [['Concepto', 'Monto (COP)']],
      body: [
        ['Ventas totales', formatCOP(totalVentas)],
        ['Ingresos adicionales', formatCOP(totalInc)],
        ['TOTAL INGRESOS', formatCOP(totalIngresos)],
        ['Gastos totales', formatCOP(totalExp)],
        ['FLUJO DE CAJA NETO', formatCOP(flujo)],
      ],
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
      columnStyles: { 1: { halign: 'right' as const } },
    })

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

    if (expenses.length > 0) {
      autoTable(doc, {
        startY: finalY,
        head: [['Gastos — Descripción', 'Categoría', 'Fecha', 'Monto']],
        body: expenses.map(e => [
          e.description,
          e.category,
          format(new Date(e.created_at), 'dd/MM/yyyy', { locale: es }),
          formatCOP(e.amount),
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        columnStyles: { 3: { halign: 'right' as const } },
      })
    }

    doc.save(`flujo_caja_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`)
  }

  const reportCards = [
    {
      title: 'Inventario',
      description: `${products.length} productos · Valor: ${formatCOP(calculateInventoryValue(products))}`,
      icon: Package,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/30',
      action: generateInventoryPDF,
      btnVariant: 'default' as const,
    },
    {
      title: 'Ventas',
      description: `${sales.length} ventas · Total: ${formatCOP(totalSales(sales))} · Utilidad: ${formatCOP(totalProfit(sales))}`,
      icon: ShoppingCart,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      action: generateSalesPDF,
      btnVariant: 'success' as const,
    },
    {
      title: 'Flujo de caja',
      description: `Ingresos: ${formatCOP(totalSales(sales) + totalIncomes(incomes))} · Gastos: ${formatCOP(totalExpenses(expenses))}`,
      icon: DollarSign,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      action: generateCashFlowPDF,
      btnVariant: 'outline' as const,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reportCards.map(card => (
          <div key={card.title} className={`rounded-xl border p-6 ${card.bg}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-black/20">
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-white">Reporte de {card.title}</h3>
                <p className="text-xs text-slate-400">PDF · Descarga inmediata</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">{card.description}</p>
            <Button onClick={card.action} variant={card.btnVariant} className="w-full">
              <Download className="w-4 h-4" />
              Descargar PDF
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#2a2a38] bg-[#111118] p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-medium text-white">Información sobre los reportes</h3>
        </div>
        <ul className="text-xs text-slate-400 space-y-1.5">
          <li>• Los PDFs se generan con todos los datos actuales del sistema</li>
          <li>• El reporte de inventario incluye la valorización total de cada producto</li>
          <li>• El reporte de ventas incluye utilidad por transacción</li>
          <li>• El flujo de caja consolida ventas, ingresos adicionales y gastos</li>
        </ul>
      </div>
    </div>
  )
}
