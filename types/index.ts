// types/index.ts
export interface User {
  id: number
  email: string
  name?: string
  created_at: string
}

export interface Expense {
  id: number
  user_id: number
  amount: number
  description: string
  category: string
  date: string
  created_at: string
}

export interface Category {
  id: number
  user_id: number
  name: string
  budget?: number
  color?: string
}
