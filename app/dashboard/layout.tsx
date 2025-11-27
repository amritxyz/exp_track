// app/dashboard/layout.tsx
"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useState } from "react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleTransactionAdded = () => {
    // Trigger refresh by updating the key
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header onTransactionAdded={handleTransactionAdded} />
        <main className="flex-1 p-4 lg:p-6" key={refreshTrigger}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
