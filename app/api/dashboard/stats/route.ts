// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const userId = 1 // Get from auth in real app

    // Current month expenses total (only negative amounts from transactions)
    const currentMonthExpenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = ?
      AND type = 'expense'
      AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
    `).get(userId)

    // Previous month expenses total
    const previousMonthExpenses = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = ?
      AND type = 'expense'
      AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now', '-1 month')
    `).get(userId)

    // Transaction count (both income and expenses)
    const transactionCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM transactions
      WHERE user_id = ?
      AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
    `).get(userId)

    // Previous month transaction count
    const previousTransactionCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM transactions
      WHERE user_id = ?
      AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now', '-1 month')
    `).get(userId)

    // Category breakdown (only expenses)
    const categories = db.prepare(`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE user_id = ?
      AND type = 'expense'
      AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
      GROUP BY category
    `).all(userId)

    // Total income for the month
    const currentMonthIncome = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = ?
      AND type = 'income'
      AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
    `).get(userId)

    const budget = 3000 // Default budget

    const stats = {
      totalSpent: Math.abs(currentMonthExpenses.total), // Convert to positive number
      previousMonthTotal: Math.abs(previousMonthExpenses.total),
      transactionCount: transactionCount.count,
      previousTransactionCount: previousTransactionCount.count,
      totalIncome: currentMonthIncome.total,
      budget,
      categories,
      remainingBudget: budget - Math.abs(currentMonthExpenses.total)
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
