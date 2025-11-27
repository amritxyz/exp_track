// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email)

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash)
      VALUES (?, ?, ?)
    `).run(name, email, passwordHash)

    // Create default categories for the user
    const defaultCategories = [
      { name: 'Food', budget: 300, color: '#ef4444' },
      { name: 'Transportation', budget: 150, color: '#3b82f6' },
      { name: 'Entertainment', budget: 100, color: '#8b5cf6' },
      { name: 'Utilities', budget: 200, color: '#10b981' },
      { name: 'Shopping', budget: 150, color: '#f59e0b' },
      { name: 'Other', budget: 100, color: '#6b7280' },
    ]

    const insertCategory = db.prepare(`
      INSERT INTO categories (user_id, name, budget, color)
      VALUES (?, ?, ?, ?)
    `)

    defaultCategories.forEach(category => {
      insertCategory.run(result.lastInsertRowid, category.name, category.budget, category.color)
    })

    return NextResponse.json({
      message: 'User created successfully',
      userId: result.lastInsertRowid
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
