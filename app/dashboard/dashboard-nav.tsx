"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function DashboardNav() {
  const pathname = usePathname()
  const navItems = [
    { href: "/dashboard/videos", label: "Vídeos" },
    { href: "/dashboard/leads", label: "Inscritos" },
  ]

  return (
    <div className="grid w-full grid-cols-2 bg-gray-800/60 border-gray-700 rounded-md p-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            pathname === item.href ? "bg-gray-900/80 text-white shadow-sm" : "hover:bg-gray-700/50",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
