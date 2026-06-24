// ============================================================
// Types — ERP Empaques Jheimy
// ============================================================

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'credito'

export type ExpenseCategory =
  | 'arriendo'
  | 'nomina'
  | 'servicios'
  | 'materia_prima'
  | 'transporte'
  | 'marketing'
  | 'impuestos'
  | 'mantenimiento'
  | 'general'

export interface Product {
  id: string
  user_id: string
  sku: string | null
  barcode: string | null
  name: string
  description: string | null
  category: string | null
  image_url: string | null
  cost_price: number
  sale_price: number
  stock: number
  minimum_stock: number
  supplier: string | null
  created_at: string
  updated_at: string
}

export interface ProductFormData {
  sku?: string
  barcode?: string
  name: string
  description?: string
  category?: string
  image_url?: string
  cost_price: number
  sale_price: number
  stock: number
  minimum_stock: number
  supplier?: string
}

export interface Sale {
  id: string
  user_id: string
  customer_name: string
  total: number
  profit: number
  payment_method: PaymentMethod
  notes: string | null
  created_at: string
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  unit_cost: number
  product?: Product
}

export interface SaleWithItems extends Sale {
  sales_items: SaleItem[]
}

export interface CartItem {
  product: Product
  quantity: number
  unit_price: number
  unit_cost: number
  discount_pct: number
}

export interface Expense {
  id: string
  user_id: string
  description: string
  amount: number
  category: ExpenseCategory
  notes: string | null
  created_at: string
}

export interface Income {
  id: string
  user_id: string
  description: string
  amount: number
  category: string | null
  notes: string | null
  created_at: string
}

// Dashboard
export interface DashboardStats {
  salesToday: number
  salesMonth: number
  inventoryValue: number
  accumulatedProfit: number
  totalExpenses: number
  netProfit: number
  cashFlow: number
  roi: number
}

export interface MonthlySalesData {
  month: string
  ventas: number
  gastos: number
  utilidad: number
}

export interface StockStatus {
  outOfStock: Product[]
  lowStock: Product[]
  normalStock: Product[]
}
