"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function DashboardNav() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [userName, setUserName] = useState("User")
  const [userEmail, setUserEmail] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Run Simulation", href: "/simulation" },
    { label: "Track Calories", href: "/calories" },
    { label: "Check Health Alerts", href: "/alerts" },
    { label: "Explore Working", href: "/mlops" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMounted(true)
    const storedName = localStorage.getItem("userName")
    const storedEmail = localStorage.getItem("userEmail")

    if (storedName) setUserName(storedName)
    if (storedEmail) setUserEmail(storedEmail)
  }, [])

  if (!isMounted) {
    return (
      <nav className="sticky top-0 z-50 border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
              <span className="text-xl font-bold">
                Simulafy{" "}
                <span className="bg-gradient-to-r from-accent via-destructive to-foreground bg-clip-text text-transparent">
                  Me
                </span>
              </span>
            </Link>
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="px-4 py-2 rounded-lg">{item.label}</div>
                </Link>
              ))}
            </div>
            <div className="w-10 h-10" />
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        isScrolled ? "bg-background/80 backdrop-blur-lg" : "bg-background",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
            <span className="text-xl font-bold">
              Simulafy{" "}
              <span className="bg-gradient-to-r from-accent via-destructive to-foreground bg-clip-text text-transparent">
                Me
              </span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "relative px-4 py-2 rounded-lg transition-all duration-300",
                      isActive
                        ? "bg-foreground text-background font-medium shadow-lg"
                        : "hover:bg-foreground/10 text-foreground",
                    )}
                    style={{
                      filter: isActive && isScrolled ? `hue-rotate(${index * 30}deg) brightness(0.9)` : "none",
                    }}
                  >
                    {item.label}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar>
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline font-medium">{userName}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2 border-b">
                <p className="font-medium">{userName}</p>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/">Logout</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
