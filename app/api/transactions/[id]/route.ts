// app/api/transactions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

interface RouteContext {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const transactionId = parseInt(params.id)

    const transaction = db.prepare(`
      SELECT * FROM transactions WHERE id = ?
    `).get(transactionId)

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const transactionId = parseInt(params.id)
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

    // Check if transaction exists
    const existingTransaction = db.prepare(`
      SELECT id FROM transactions WHERE id = ?
    `).get(transactionId)

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Update transaction
    const result = db.prepare(`
      UPDATE transactions SET
        amount = ?,
        type = ?,
        description = ?,
        category = ?,
        subcategory = ?,
        income_source = ?,
        remark = ?,
        date = ?
      WHERE id = ?
    `).run(
      amount,
      type,
      description,
      category || null,
      subcategory || null,
      income_source || null,
      remark || null,
      date,
      transactionId
    )

    return NextResponse.json({
      message: 'Transaction updated successfully'
    })

  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const transactionId = parseInt(params.id)

    // Check if transaction exists
    const existingTransaction = db.prepare(`
      SELECT id FROM transactions WHERE id = ?
    `).get(transactionId)

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Delete transaction
    db.prepare(`
      DELETE FROM transactions WHERE id = ?
    `).run(transactionId)

    return NextResponse.json({
      message: 'Transaction deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
