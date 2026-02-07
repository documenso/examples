"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Menu, User, Briefcase, LogOut, UserCircle, FileText, Settings } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from "@/lib/user-context"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { role, isClient, isFreelancer, clearUser } = useUser()
  const router = useRouter()

  const handleSignOut = () => {
    clearUser()
    router.push("/select-role")
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">          <Link href={isClient ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">FreelanceHub</span>
            {role && (
              <Badge variant="secondary" className="ml-2 capitalize">
                {role}
              </Badge>
            )}
          </Link>          <div className="hidden items-center gap-8 md:flex">
            {isFreelancer && (
              <Link href="/" className="text-sm font-medium text-foreground transition-colors hover:text-primary">
                Browse Jobs
              </Link>
            )}
            {isClient && (
              <Link
                href="/post-job"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Post a Job
              </Link>
            )}
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
          </div>          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full bg-transparent">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <UserCircle className="mr-1 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {isFreelancer && (
                  <DropdownMenuItem>
                    <FileText className="mr-1 h-4 w-4" />
                    My Applications
                  </DropdownMenuItem>
                )}
                {isClient && (
                  <DropdownMenuItem>
                    <Briefcase className="mr-1 h-4 w-4" />
                    My Jobs
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <FileText className="mr-1 h-4 w-4" />
                  My Contracts
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-1 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-1 h-4 w-4" />
                  Switch Account Type
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>        {isMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {isFreelancer && (
                <Link href="/" className="text-sm font-medium text-foreground" onClick={() => setIsMenuOpen(false)}>
                  Browse Jobs
                </Link>
              )}
              {isClient && (
                <Link
                  href="/post-job"
                  className="text-sm font-medium text-muted-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Post a Job
                </Link>
              )}
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
