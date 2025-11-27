// components/add-transaction-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, Plus, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

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

interface AddTransactionDialogProps {
  onTransactionAdded?: () => void
  transaction?: Transaction // For editing
  children?: React.ReactNode // For custom trigger
  open?: boolean // For controlled dialog
  onOpenChange?: (open: boolean) => void // For controlled dialog
}

const expenseCategories = [
  { value: "food", label: "Food", subcategories: ["Groceries", "Dining Out", "Coffee", "Snacks"] },
  { value: "transportation", label: "Transportation", subcategories: ["Fuel", "Public Transport", "Taxi", "Maintenance"] },
  { value: "entertainment", label: "Entertainment", subcategories: ["Movies", "Games", "Concerts", "Subscriptions"] },
  { value: "utilities", label: "Utilities", subcategories: ["Electricity", "Water", "Internet", "Mobile"] },
  { value: "shopping", label: "Shopping", subcategories: ["Clothing", "Electronics", "Home", "Personal Care"] },
  { value: "healthcare", label: "Healthcare", subcategories: ["Doctor", "Medicine", "Insurance", "Fitness"] },
  { value: "education", label: "Education", subcategories: ["Books", "Courses", "Tuition", "Supplies"] },
  { value: "other", label: "Other", subcategories: ["Miscellaneous"] }
]

const incomeSources = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Rental",
  "Gift",
  "Bonus",
  "Other"
]

const types = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" }
]

export function AddTransactionDialog({
  onTransactionAdded,
  transaction,
  children,
  open: externalOpen,
  onOpenChange
}: AddTransactionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [selectedCategory, setSelectedCategory] = useState("")

  // Use external open state if provided, otherwise use internal
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    description: "",
    category: "",
    subcategory: "",
    incomeSource: "",
    remark: "",
    date: new Date().toISOString().split('T')[0]
  })

  // Initialize form when transaction changes or dialog opens
  useEffect(() => {
    if (transaction) {
      // Editing existing transaction
      const amount = Math.abs(transaction.amount)
      setFormData({
        type: transaction.type,
        amount: amount.toString(),
        description: transaction.description,
        category: transaction.category || "",
        subcategory: transaction.subcategory || "",
        incomeSource: transaction.income_source || "",
        remark: transaction.remark || "",
        date: transaction.date
      })
      setSelectedCategory(transaction.category || "")
      setDate(new Date(transaction.date))
    } else if (open) {
      // New transaction - reset form
      setFormData({
        type: "expense",
        amount: "",
        description: "",
        category: "",
        subcategory: "",
        incomeSource: "",
        remark: "",
        date: new Date().toISOString().split('T')[0]
      })
      setSelectedCategory("")
      setDate(new Date())
      setError("")
    }
  }, [transaction, open])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")

    // Reset subcategory when category changes
    if (field === "category") {
      setSelectedCategory(value)
      setFormData(prev => ({ ...prev, subcategory: "" }))
    }
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      setFormData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0]
      }))
    }
  }

  const handleRemarkChange = (value: string) => {
    // Limit to 25 words
    const words = value.trim().split(/\s+/)
    if (words.length <= 25) {
      setFormData(prev => ({ ...prev, remark: value }))
    }
  }

  const getWordCount = (text: string) => {
    return text.trim() === "" ? 0 : text.trim().split(/\s+/).length
  }

  const getCurrentCategory = () => {
    return expenseCategories.find(cat => cat.value === selectedCategory)
  }

  // In your AddTransactionDialog, update the handleSubmit function:
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate form based on type
      if (!formData.amount) {
        setError("Amount is required")
        return
      }

      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        setError("Please enter a valid amount")
        return
      }

      // Prepare data for API - use correct field names that match your API
      const apiData: any = {
        amount: formData.type === "expense" ? -Math.abs(amount) : Math.abs(amount),
        type: formData.type,
        description: formData.description,
        date: formData.date
      }

      if (formData.type === "expense") {
        if (!formData.category) {
          setError("Category is required for expenses")
          return
        }
        if (!formData.remark) {
          setError("Remark is required for expenses")
          return
        }

        apiData.category = formData.category
        apiData.subcategory = formData.subcategory
        apiData.remark = formData.remark
        apiData.income_source = null // Explicitly set to null
      } else {
        if (!formData.incomeSource) {
          setError("Income source is required for income")
          return
        }

        apiData.income_source = formData.incomeSource // Note: income_source not incomeSource
        apiData.category = null // Explicitly set to null
        apiData.subcategory = null // Explicitly set to null
        apiData.remark = formData.remark || ""
      }

      const url = transaction ? `/api/transactions/${transaction.id}` : '/api/transactions'
      const method = transaction ? 'PUT' : 'POST'

      console.log('Sending data:', apiData) // Debug log

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save transaction')
      }

      // Reset form and close dialog
      if (!transaction) {
        setFormData({
          type: "expense",
          amount: "",
          description: "",
          category: "",
          subcategory: "",
          incomeSource: "",
          remark: "",
          date: new Date().toISOString().split('T')[0]
        })
        setSelectedCategory("")
        setDate(new Date())
      }

      setOpen(false)
      if (onTransactionAdded) {
        onTransactionAdded()
      }

    } catch (err) {
      console.error('Error saving transaction:', err)
      setError(err instanceof Error ? err.message : "Failed to save transaction. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const currentCategory = getCurrentCategory()
  const isEditing = !!transaction

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditing && (
        <DialogTrigger asChild>
          {children || (
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Transaction" : "Add New Transaction"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the transaction details below."
                : "Add a new expense or income to track your finances."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Transaction Type */}
            <div className="grid gap-3">
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="grid gap-3">
              <Label htmlFor="amount">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Income Source (only for income) */}
            {formData.type === "income" && (
              <div className="grid gap-3">
                <Label htmlFor="incomeSource">Income Source</Label>
                <Select
                  value={formData.incomeSource}
                  onValueChange={(value) => handleInputChange("incomeSource", value)}
                  disabled={loading}
                >
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

            {/* Category and Subcategory (only for expenses) */}
            {formData.type === "expense" && (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {currentCategory && currentCategory.subcategories.length > 1 && (
                  <div className="grid gap-3">
                    <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) => handleInputChange("subcategory", value)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentCategory.subcategories.map((subcat) => (
                          <SelectItem key={subcat} value={subcat}>
                            {subcat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {/* Remark */}
            <div className="grid gap-3">
              <Label htmlFor="remark">
                Remark {formData.type === "expense" ? "(Required)" : "(Optional)"}
                <span className="text-xs text-muted-foreground ml-2">
                  {getWordCount(formData.remark)}/25 words
                </span>
              </Label>
              <Textarea
                id="remark"
                placeholder={
                  formData.type === "expense"
                    ? "Enter remark about this expense..."
                    : "Enter any additional notes about this income..."
                }
                value={formData.remark}
                onChange={(e) => handleRemarkChange(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            {/* Date */}
            <div className="grid gap-3">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                    disabled={loading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Saving..." : (isEditing ? "Update Transaction" : "Add Transaction")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
