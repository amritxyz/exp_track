// app/api/expenses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('=== EXPENSE API CALL ===')

    const requestBody = await request.json()
    console.log('Request body:', requestBody)

    const {
      amount,
      description,
      category,
      date,
      type = 'expense',
      subcategory,
      incomeSource,
      remark
    } = requestBody

    // Log all received fields
    console.log('Parsed fields:', {
      amount, description, category, date, type, subcategory, incomeSource, remark
    })

    // Validate required fields
    if (!amount || !date) {
      console.log('Validation failed: Missing amount or date')
      return NextResponse.json(
        { error: 'Amount and date are required' },
        { status: 400 }
      )
    }

    if (type === 'expense') {
      if (!category || !remark) {
        console.log('Validation failed: Missing category or remark for expense')
        return NextResponse.json(
          { error: 'Category and remark are required for expenses' },
          { status: 400 }
        )
      }
    }

    if (type === 'income') {
      if (!incomeSource) {
        console.log('Validation failed: Missing income source for income')
        return NextResponse.json(
          { error: 'Income source is required for income' },
          { status: 400 }
        )
      }
    }

    // Prepare data for database
    const finalDescription = type === 'income' ? incomeSource : description
    const finalCategory = type === 'income' ? 'Income' : category

    console.log('Final data for DB:', {
      user_id: 1,
      amount,
      description: finalDescription,
      category: finalCategory,
      date,
      type,
      subcategory,
      income_source: incomeSource,
      remark
    })

    // Check if database table has the new columns
    try {
      const tableInfo = db.prepare("PRAGMA table_info(expenses)").all()
      console.log('Table columns:', tableInfo)
    } catch (tableError) {
      console.log('Error checking table schema:', tableError)
    }

    // Insert into database
    const result = db.prepare(`
      INSERT INTO expenses (
        user_id, amount, description, category, date,
        type, subcategory, income_source, remark
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      1, // user_id
      amount,
      finalDescription,
      finalCategory,
      date,
      type,
      subcategory || null,
      incomeSource || null,
      remark || null
    )

    console.log('Database insert successful, ID:', result.lastInsertRowid)

    return NextResponse.json({
      id: result.lastInsertRowid,
      message: 'Transaction added successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('=== API ERROR DETAILS ===')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)

    return NextResponse.json(
      {
        error: 'Failed to create transaction',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
