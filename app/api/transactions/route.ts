// app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit')

    let query = `
      SELECT * FROM transactions
      WHERE user_id = 1
      ORDER BY date DESC, created_at DESC
    `

    if (limit) {
      query += ` LIMIT ${parseInt(limit)}`
    }

    const transactions = db.prepare(query).all()

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      type,
      description,
      category,
      subcategory,
      income_source,
      remark,
      date
    } = await request.json()

    // Validate required fields
    if (!amount || !type || !description || !date) {
      return NextResponse.json(
        { error: 'Amount, type, description, and date are required' },
        { status: 400 }
      )
    }

    if (type === 'expense' && !category) {
      return NextResponse.json(
        { error: 'Category is required for expenses' },
        { status: 400 }
      )
    }

    if (type === 'income' && !income_source) {
      return NextResponse.json(
        { error: 'Income source is required for income' },
        { status: 400 }
      )
    }

    // Insert into transactions table
    const result = db.prepare(`
      INSERT INTO transactions (
        user_id, amount, type, description, category,
        subcategory, income_source, remark, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      1, // user_id
      amount,
      type,
      description,
      category || null,
      subcategory || null,
      income_source || null,
      remark || null,
      date
    )

    return NextResponse.json({
      id: result.lastInsertRowid,
      message: 'Transaction added successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
