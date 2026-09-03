"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"

interface User {
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("smartland_user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as Partial<User>
        if (typeof parsedUser.email === "string" && typeof parsedUser.name === "string") {
          setUser({ email: parsedUser.email, name: parsedUser.name })
        } else {
          localStorage.removeItem("smartland_user")
        }
      } catch {
        localStorage.removeItem("smartland_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // For demo purposes, accept any valid email/password combination
    if (email && password.length >= 6) {
      const userData = { email, name: email.split("@")[0] }
      setUser(userData)
      localStorage.setItem("smartland_user", JSON.stringify(userData))
      setIsLoading(false)
      return true
    }
    setIsLoading(false)
    return false
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    if (email && password.length >= 6 && name) {
      const userData = { email, name }
      setUser(userData)
      localStorage.setItem("smartland_user", JSON.stringify(userData))
      setIsLoading(false)
      return true
    }
    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("smartland_user")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
