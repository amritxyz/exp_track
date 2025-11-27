// app/dashboard/page.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react"
import { useEffect, useState } from "react"
import { AddTransactionDialog } from "@/components/add-transaction-dialog"
import { TransactionActions } from "@/components/transaction-actions"

interface CategoryBreakdown {
  category: string
  total: number
}

interface HeaderProps {
  onTransactionAdded?: () => void
}

interface DashboardStats {
  totalSpent: number
  previousMonthTotal: number
  transactionCount: number
  previousTransactionCount: number
  totalIncome: number
  budget: number
  categories: CategoryBreakdown[]
  remainingBudget: number
}

interface Transaction {
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

export default function DashboardPage({ onTransactionAdded }: HeaderProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch stats from your existing API
      const statsResponse = await fetch('/api/dashboard/stats')
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch stats')
      }
      const statsData = await statsResponse.json()
      setStats(statsData)

      // Fetch recent transactions using your existing API route
      const transactionsResponse = await fetch('/api/transactions?limit=10')
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setRecentTransactions(transactionsData)
      }

      setLastUpdate(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getCategoryColor = (index: number) => {
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
    ]
    return colors[index % colors.length]
  }

  // Calculate percentage change
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error loading data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No data available</h2>
          <p className="text-muted-foreground mb-4">Unable to load dashboard data</p>
          <Button onClick={fetchDashboardData}>Retry</Button>
        </div>
      </div>
    )
  }

  // Prepare stats for display
  const spendingChange = calculatePercentageChange(stats.totalSpent, stats.previousMonthTotal)
  const transactionChange = calculatePercentageChange(stats.transactionCount, stats.previousTransactionCount)
  const savingsRate = stats.totalIncome > 0 ? ((stats.totalIncome - stats.totalSpent) / stats.totalIncome) * 100 : 0

  const displayStats = [
    {
      title: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      description: `${spendingChange >= 0 ? '+' : ''}${spendingChange.toFixed(1)}% from last month`,
      icon: DollarSign,
      trend: spendingChange <= 0 ? "down" : "up" as const,
    },
    {
      title: "Monthly Budget",
      value: formatCurrency(stats.budget),
      description: `${formatCurrency(stats.remainingBudget)} remaining`,
      icon: TrendingUp,
      trend: stats.remainingBudget > 0 ? "up" : "down" as const,
    },
    {
      title: "Transactions",
      value: stats.transactionCount.toString(),
      description: `${transactionChange >= 0 ? '+' : ''}${transactionChange.toFixed(1)}% from last month`,
      icon: Calendar,
      trend: transactionChange <= 0 ? "down" : "up" as const,
    },
    {
      title: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      description: "Based on income & expenses",
      icon: TrendingDown,
      trend: savingsRate > 0 ? "up" : "down" as const,
    }
  ]

  // Calculate quick stats
  const dailyAverage = stats.totalSpent / new Date().getDate()
  const largestExpense = stats.categories.length > 0
    ? Math.max(...stats.categories.map(c => Math.abs(c.total)))
    : 0
  const budgetUsed = stats.budget > 0
    ? (stats.totalSpent / stats.budget) * 100
    : 0

  const recentExpenses = recentTransactions.filter(t => t.type === 'expense')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your financial overview.
            {lastUpdate && <span className="text-xs ml-2">Updated: {lastUpdate}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <AddTransactionDialog onTransactionAdded={onTransactionAdded} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {displayStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === "up" && <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />}
                {stat.trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />}
                {stat.description}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Transactions */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest transactions (including income)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              // In your dashboard component, update the transaction list section:
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                        <DollarSign className={`h-4 w-4 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.type === 'income'
                            ? transaction.income_source || 'Income'
                            : transaction.category || 'Uncategorized'
                          } • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </p>
                      <TransactionActions
                        transaction={transaction}
                        onTransactionUpdated={fetchDashboardData}
                        onTransactionDeleted={fetchDashboardData}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Sidebar - Categories & Quick Stats */}
        <div className="col-span-3 space-y-6">
          {/* Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Categories</CardTitle>
              <CardDescription>
                Expense breakdown by category this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.categories.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No spending categories for this month
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.categories.map((category, index) => {
                    const percentage = stats.totalSpent > 0 ? (Math.abs(category.total) / stats.totalSpent) * 100 : 0
                    return (
                      <div key={category.category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{category.category || 'Uncategorized'}</span>
                          <span>{formatCurrency(Math.abs(category.total))}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getCategoryColor(index)} transition-all`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Daily Average</span>
                <span className="font-medium">{formatCurrency(dailyAverage)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Largest Expense</span>
                <span className="font-medium">{formatCurrency(largestExpense)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Budget Used</span>
                <Badge variant={budgetUsed > 100 ? "destructive" : "secondary"}>
                  {budgetUsed.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Income</span>
                <span className="font-medium text-green-600">{formatCurrency(stats.totalIncome)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
