// ============================================================
// Calculations — ERP Empaques Jheimy
// ============================================================

import type { Product, CartItem, Sale, Expense, Income } from '@/lib/types'

/** Valor total del inventario: sum(stock * cost_price) */
export function calculateInventoryValue(products: Product[]): number {
  return products.reduce((acc, p) => acc + p.stock * p.cost_price, 0)
}

/** Utilidad de una venta */
export function calculateSaleProfit(items: CartItem[]): number {
  return items.reduce((acc, item) => {
    return acc + (item.unit_price - item.unit_cost) * item.quantity
  }, 0)
}

/** Total de una venta */
export function calculateSaleTotal(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0)
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
