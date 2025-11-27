// app/dashboard/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getUser, logout } from '@/lib/auth'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = getUser()
    setUser(userData)
  }, [])

  const handleLogout = () => {
    logout()
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Expense Tracker</h1>
            <div className="flex items-center gap-4">
              <span>Welcome, {user?.name}</span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard</CardTitle>
              <CardDescription>
                Welcome to your expense tracker dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Your expense management journey starts here!</p>
              {/* We'll add expense components here later */}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
