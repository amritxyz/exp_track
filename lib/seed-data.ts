// scripts/seed-data.ts
import { db } from '@/lib/database'

// Insert sample user
const userId = db.prepare(`
  INSERT OR IGNORE INTO users (id, email, password_hash, name)
  VALUES (?, ?, ?, ?)
`).run(1, 'demo@example.com', 'hashed_password', 'Demo User').lastInsertRowid

// Insert sample categories
const categories = [
  { name: 'Food', budget: 600, color: 'bg-red-500' },
  { name: 'Transportation', budget: 300, color: 'bg-blue-500' },
  { name: 'Entertainment', budget: 200, color: 'bg-purple-500' },
  { name: 'Utilities', budget: 250, color: 'bg-green-500' },
]

categories.forEach(category => {
  db.prepare(`
    INSERT OR IGNORE INTO categories (user_id, name, budget, color)
    VALUES (?, ?, ?, ?)
  `).run(userId, category.name, category.budget, category.color)
})

// Insert sample transactions
const transactions = [
  { amount: 156.30, type: 'expense', description: 'Groceries', category: 'Food', date: '2024-01-15' },
  { amount: 89.50, type: 'expense', description: 'Electric Bill', category: 'Utilities', date: '2024-01-14' },
  { amount: 15.99, type: 'expense', description: 'Netflix Subscription', category: 'Entertainment', date: '2024-01-13' },
  { amount: 45.00, type: 'expense', description: 'Gas Station', category: 'Transportation', date: '2024-01-12' },
  { amount: 120.00, type: 'expense', description: 'Restaurant', category: 'Food', date: '2024-01-10' },
]

transactions.forEach(transaction => {
  db.prepare(`
    INSERT INTO transactions (user_id, amount, type, description, category, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, transaction.amount, transaction.type, transaction.description, transaction.category, transaction.date)
})

console.log('Sample data inserted successfully!')
