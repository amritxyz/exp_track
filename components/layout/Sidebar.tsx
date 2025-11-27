// components/layout/Sidebar.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  DollarSign,
  PieChart,
  Settings,
  Tags,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Overview"
  },
  {
    href: "/dashboard/expenses",
    icon: DollarSign,
    label: "Expenses"
  },
  {
    href: "/dashboard/categories",
    icon: Tags,
    label: "Categories"
  },
  {
    href: "/dashboard/analytics",
    icon: BarChart3,
    label: "Analytics"
  },
  {
    href: "/dashboard/reports",
    icon: PieChart,
    label: "Reports"
  },
  {
    href: "/dashboard/settings",
    icon: Settings,
    label: "Settings"
  }
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Expense Tracker
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
