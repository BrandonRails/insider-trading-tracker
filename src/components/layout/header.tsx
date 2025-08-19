/**
 * Header Navigation Component - Main site navigation
 */

"use client"

import * as React from "react"
import Link from "next/link"
// import { useSession, signIn, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PersonAvatar } from "@/components/ui/person-avatar"
import { cn } from "@/lib/utils"
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Menu,
  X,
  PlusCircle,
  Crown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavigationItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  requiresAuth?: boolean
  requiresPaid?: boolean
}

const navigation: NavigationItem[] = [
  { name: "Feed", href: "/" },
  { name: "Search", href: "/search" },
  { name: "Companies", href: "/companies" },
  { name: "Politicians", href: "/politicians" },
  { name: "Watchlist", href: "/watchlist", requiresAuth: true },
  { name: "Alerts", href: "/alerts", requiresAuth: true },
  { name: "Analytics", href: "/analytics", requiresPaid: true, badge: "Pro" },
]

export function Header() {
  // const { data: session, status } = useSession()
  const session = null // Temporary - will implement auth later
  const status = "unauthenticated" // Temporary
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const isAuthenticated = status === "authenticated"
  const isPaidUser = session?.user?.plan === "PAID"

  const filteredNavigation = navigation.filter(item => {
    if (item.requiresAuth && !isAuthenticated) return false
    if (item.requiresPaid && !isPaidUser) return false
    return true
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              IP
            </div>
            <span className="hidden font-bold sm:inline-block text-xl">
              Insider Pilot
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
                {item.badge && (
                  <Badge variant="premium" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications (Auth Required) */}
          {isAuthenticated && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              <span className="sr-only">Notifications</span>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <PersonAvatar
                    name={session.user?.name || "User"}
                    size="sm"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge 
                        variant={isPaidUser ? "premium" : "secondary"}
                        className="text-xs"
                      >
                        {isPaidUser ? "Pro" : "Free"}
                      </Badge>
                      {session.user?.role === "ADMIN" && (
                        <Badge variant="destructive" className="text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                {!isPaidUser && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/upgrade">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => {}} // signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" onClick={() => {}} // signIn()}>
                Sign in
              </Button>
              <Button onClick={() => {}} // signIn()}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="container space-y-1 py-4">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center justify-between">
                  {item.name}
                  {item.badge && (
                    <Badge variant="premium" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}

            {!isAuthenticated && (
              <div className="border-t pt-4 space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => {
                    signIn()
                    setMobileMenuOpen(false)
                  }}
                >
                  Sign in
                </Button>
                <Button 
                  className="w-full"
                  onClick={() => {
                    signIn()
                    setMobileMenuOpen(false)
                  }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}