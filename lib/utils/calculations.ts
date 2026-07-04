// ============================================================
// Calculations — ERP Empaques Jheimy
// ============================================================

import type { Product, CartItem, Sale, Expense, Income } from '@/lib/types'

/** Valor total del inventario: sum(stock * cost_price) */
export function calculateInventoryValue(products: Product[]): number {
  return products.reduce((acc, p) => acc + p.stock * p.cost_price, 0)
}

/** Precio efectivo de un ítem después del descuento */
export function effectivePrice(item: CartItem): number {
  return item.unit_price * (1 - (item.discount_pct ?? 0) / 100)
}

/** Utilidad de una venta (considera descuentos por ítem) */
export function calculateSaleProfit(items: CartItem[], saleDiscountAmt = 0): number {
  const itemsProfit = items.reduce((acc, item) => {
    return acc + (effectivePrice(item) - item.unit_cost) * item.quantity
  }, 0)
  return itemsProfit - saleDiscountAmt
}

/** Total de una venta (considera descuentos por ítem) */
export function calculateSaleTotal(items: CartItem[], saleDiscountAmt = 0): number {
  const itemsTotal = items.reduce((acc, item) => acc + effectivePrice(item) * item.quantity, 0)
  return Math.max(0, itemsTotal - saleDiscountAmt)
}

/** Total gastos */
export function totalExpenses(expenses: Expense[]): number {
  return expenses.reduce((acc, e) => acc + e.amount, 0)
}

/** Total ingresos adicionales */
export function totalIncomes(incomes: Income[]): number {
  return incomes.reduce((acc, i) => acc + i.amount, 0)
}

/** Total ventas */
export function totalSales(sales: Sale[]): number {
  return sales.reduce((acc, s) => acc + s.total, 0)
}

/** Total utilidad de ventas */
export function totalProfit(sales: Sale[]): number {
  return sales.reduce((acc, s) => acc + s.profit, 0)
}

/**
 * ROI = (Utilidad neta / Capital invertido) * 100
 * Capital invertido = Valor del inventario inicial + Gastos operativos
 */
export function calculateROI(netProfit: number, investedCapital: number): number {
  if (investedCapital === 0) return 0
  return (netProfit / investedCapital) * 100
}

/** Flujo de caja = Ingresos totales - Gastos totales */
export function calculateCashFlow(totalRevenue: number, totalExpense: number): number {
  return totalRevenue - totalExpense
}

/** Filtrar ventas del día actual */
export function filterSalesToday(sales: Sale[]): Sale[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return sales.filter(s => new Date(s.created_at) >= today)
}

/** Filtrar ventas del mes actual */
export function filterSalesThisMonth(sales: Sale[]): Sale[] {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  return sales.filter(s => new Date(s.created_at) >= firstDay)
}

/** Productos agotados */
export function getOutOfStock(products: Product[]): Product[] {
  return products.filter(p => p.stock === 0)
}

/** Productos con stock bajo */
export function getLowStock(products: Product[]): Product[] {
  return products.filter(p => p.stock > 0 && p.stock <= p.minimum_stock)
}

// ============================================================
// Trend helpers para KPIs con sparklines
// ============================================================

/** Serie de últimos N días con total diario de ventas */
export function dailySalesSeries(sales: Sale[], days = 7): number[] {
  const series: number[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date(today)
    start.setDate(today.getDate() - i)
    const end = new Date(start)
    end.setDate(start.getDate() + 1)
    const total = sales
      .filter(s => {
        const d = new Date(s.created_at)
        return d >= start && d < end
      })
      .reduce((acc, s) => acc + s.total, 0)
    series.push(total)
  }
  return series
}

/** Serie de últimos N meses con total mensual de ventas */
export function monthlySalesSeries(sales: Sale[], months = 6): number[] {
  const series: number[] = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const total = sales
      .filter(s => {
        const d = new Date(s.created_at)
        return d >= start && d < end
      })
      .reduce((acc, s) => acc + s.total, 0)
    series.push(total)
  }
  return series
}

/** Serie de utilidad mensual */
export function monthlyProfitSeries(sales: Sale[], months = 6): number[] {
  const series: number[] = []
  const now = new Date()
  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const total = sales
      .filter(s => {
        const d = new Date(s.created_at)
        return d >= start && d < end
      })
      .reduce((acc, s) => acc + s.profit, 0)
    series.push(total)
  }
  return series
}

/** % de cambio entre dos valores (retorna null si el base es 0) */
export function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return ((current - previous) / Math.abs(previous)) * 100
}

/** Ventas del mes anterior */
export function filterSalesLastMonth(sales: Sale[]): Sale[] {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const last = new Date(now.getFullYear(), now.getMonth(), 1)
  return sales.filter(s => {
    const d = new Date(s.created_at)
    return d >= first && d < last
  })
}

/** Ventas de ayer */
export function filterSalesYesterday(sales: Sale[]): Sale[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  return sales.filter(s => {
    const d = new Date(s.created_at)
    return d >= yesterday && d < today
  })
}
