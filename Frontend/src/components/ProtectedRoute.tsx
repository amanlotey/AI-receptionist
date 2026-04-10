// src/components/ProtectedRoute.tsx
import React from "react"
import { useAuth0 } from "@auth0/auth0-react"

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()

  if (isLoading) return <div className="p-6 text-gray-700">Checking authentication...</div>

  if (!isAuthenticated) {
    loginWithRedirect()
    return null
  }

  return children
}

export default ProtectedRoute
