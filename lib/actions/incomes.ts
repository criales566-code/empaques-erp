'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/** Obtener ingresos */
export async function getIncomes(limit?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  let query = supabase
    .from('incomes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

/** Crear ingreso */
export async function createIncome(formData: {
  description: string
  amount: number
  category?: string
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data, error } = await supabase
    .from('incomes')
    .insert([{ ...formData, user_id: user.id }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/finances')
  revalidatePath('/')
  return data
}

/** Actualizar ingreso */
export async function updateIncome(id: string, formData: {
  description?: string
  amount?: number
  category?: string
  notes?: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('incomes')
    .update(formData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/finances')
  return data
}

/** Eliminar ingreso */
export async function deleteIncome(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('incomes')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/finances')
  revalidatePath('/')
}
