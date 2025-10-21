"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import Cookies from "js-cookie"

type UserRole = "client" | "freelancer" | null

interface UserData {
  userId: string | null
  name: string | null
  email: string | null
}

interface UserContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  isClient: boolean
  isFreelancer: boolean
  userId: string | null
  userName: string | null
  userEmail: string | null
  setUser: (userData: UserData & { role: UserRole }) => void
  clearUser: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Load user data from cookies on mount
  useEffect(() => {
    const savedRole = Cookies.get("userRole") as UserRole
    const savedUserId = Cookies.get("userId")
    const savedUserName = Cookies.get("userName")
    const savedUserEmail = Cookies.get("userEmail")

    if (savedRole) {
      setRoleState(savedRole)
    }
    if (savedUserId) {
      setUserId(savedUserId)
    }
    if (savedUserName) {
      setUserName(savedUserName)
    }
    if (savedUserEmail) {
      setUserEmail(savedUserEmail)
    }

    setIsInitialized(true)
  }, [])

  // Redirect to role selection if no role is set and not on role selection page
  useEffect(() => {
    if (isInitialized && !role && pathname !== "/select-role") {
      router.push("/select-role")
    }
  }, [role, pathname, router, isInitialized])

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole)
    if (newRole) {
      Cookies.set("userRole", newRole, { expires: 365 })
    } else {
      Cookies.remove("userRole")
    }
  }

  const setUser = (userData: UserData & { role: UserRole }) => {
    setRoleState(userData.role)
    setUserId(userData.userId)
    setUserName(userData.name)
    setUserEmail(userData.email)

    if (userData.role) {
      Cookies.set("userRole", userData.role, { expires: 365 })
    }
    if (userData.userId) {
      Cookies.set("userId", userData.userId, { expires: 365 })
    }
    if (userData.name) {
      Cookies.set("userName", userData.name, { expires: 365 })
    }
    if (userData.email) {
      Cookies.set("userEmail", userData.email, { expires: 365 })
    }
  }

  const clearUser = () => {
    setRoleState(null)
    setUserId(null)
    setUserName(null)
    setUserEmail(null)
    Cookies.remove("userRole")
    Cookies.remove("userId")
    Cookies.remove("userName")
    Cookies.remove("userEmail")
  }

  return (
    <UserContext.Provider
      value={{
        role,
        setRole,
        isClient: role === "client",
        isFreelancer: role === "freelancer",
        userId,
        userName,
        userEmail,
        setUser,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
