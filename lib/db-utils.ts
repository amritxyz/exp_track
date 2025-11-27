// lib/db-utils.ts
import { db } from './database'

export interface Transaction {
  id: number
  user_id: number
  amount: number
  type: 'expense' | 'income'
  description: string
  category: string | null
  subcategory: string | null
  income_source: string | null
  remark: string | null
  date: string
  created_at: string
}

export interface Category {
  id: number
  user_id: number
  name: string
  budget: number | null
  color: string | null
}

export interface DashboardStats {
  totalSpent: number
  monthlyBudget: number
  transactionCount: number
  savingsRate: number
  remainingBudget: number
}

// For demo purposes - you'll want to replace with actual user authentication
const DEMO_USER_ID = 1

export async function getDashboardData() {
  // Get current month and year
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Get transactions for current month
  const transactions = db.prepare(`
    SELECT * FROM transactions
    WHERE user_id = ?
    AND strftime('%m', date) = ?
    AND strftime('%Y', date) = ?
    ORDER BY date DESC
    LIMIT 10
  `).all(DEMO_USER_ID, currentMonth.toString().padStart(2, '0'), currentYear.toString()) as Transaction[]

  // Get categories with budgets
  const categories = db.prepare(`
    SELECT * FROM categories
    WHERE user_id = ?
  `).all(DEMO_USER_ID) as Category[]

  // Calculate stats
  const expenseTransactions = transactions.filter(t => t.type === 'expense')
  const totalSpent = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
  const transactionCount = transactions.length

  // Calculate category spending
  const categorySpending: Record<string, number> = {}
  expenseTransactions.forEach(transaction => {
    if (transaction.category) {
      categorySpending[transaction.category] = (categorySpending[transaction.category] || 0) + transaction.amount
    }
  })

  // Calculate monthly budget (sum of all category budgets)
  const monthlyBudget = categories.reduce((sum, category) => sum + (category.budget || 0), 0)
  const remainingBudget = monthlyBudget - totalSpent

  // Calculate savings rate (simplified - you might want to include income)
  const savingsRate = monthlyBudget > 0 ? ((remainingBudget / monthlyBudget) * 100) : 0

  return {
    transactions,
    categories: categories.map(category => ({
      ...category,
      amount: categorySpending[category.name] || 0,
      budget: category.budget || 0
    })),
    stats: {
      totalSpent,
      monthlyBudget,
      transactionCount,
      savingsRate,
      remainingBudget
    }
  }
}

export async function getRecentTransactions(limit = 10) {
  return db.prepare(`
    SELECT * FROM transactions
    WHERE user_id = ?
    ORDER BY date DESC
    LIMIT ?
  `).all(DEMO_USER_ID, limit) as Transaction[]
}
