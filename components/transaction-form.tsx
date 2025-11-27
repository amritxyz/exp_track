// components/transaction-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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

interface TransactionFormProps {
  transaction?: Transaction
  onSuccess: () => void
  onCancel: () => void
}

const expenseCategories = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Travel",
  "Education",
  "Other"
]

const incomeSources = [
  "Salary",
  "Freelance",
  "Investment",
  "Bonus",
  "Gift",
  "Other"
]

export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: transaction?.amount.toString() || '',
    type: transaction?.type || 'expense',
    description: transaction?.description || '',
    category: transaction?.category || '',
    subcategory: transaction?.subcategory || '',
    incomeSource: transaction?.income_source || '',
    remark: transaction?.remark || '',
    date: transaction?.date || new Date().toISOString().split('T')[0]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = transaction
        ? `/api/transactions/${transaction.id}`
        : '/api/transactions'

      const method = transaction ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          type: formData.type,
          description: formData.description,
          category: formData.category,
          subcategory: formData.subcategory || null,
          incomeSource: formData.incomeSource || null,
          remark: formData.remark || null,
          date: formData.date
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save transaction')
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving transaction:', error)
      alert(error instanceof Error ? error.message : 'Failed to save transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Transaction Type */}
      <div className="space-y-2">
        <Label>Transaction Type</Label>
        <RadioGroup
          value={formData.type}
          onValueChange={(value: 'expense' | 'income') => handleChange('type', value)}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="expense" id="expense" />
            <Label htmlFor="expense">Expense</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="income" id="income" />
            <Label htmlFor="income">Income</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          required
        />
      </div>

      {/* Category or Income Source */}
      {formData.type === 'expense' ? (
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="incomeSource">Income Source</Label>
          <Select value={formData.incomeSource} onValueChange={(value) => handleChange('incomeSource', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select income source" />
            </SelectTrigger>
            <SelectContent>
              {incomeSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Subcategory (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="subcategory">Subcategory (Optional)</Label>
        <Input
          id="subcategory"
          placeholder="Enter subcategory"
          value={formData.subcategory}
          onChange={(e) => handleChange('subcategory', e.target.value)}
        />
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          required
        />
      </div>

      {/* Remark */}
      <div className="space-y-2">
        <Label htmlFor="remark">Remark (Optional)</Label>
        <Textarea
          id="remark"
          placeholder="Add any additional notes"
          value={formData.remark}
          onChange={(e) => handleChange('remark', e.target.value)}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : transaction ? "Update Transaction" : "Add Transaction"}
        </Button>
      </div>
    </form>
  )
}
