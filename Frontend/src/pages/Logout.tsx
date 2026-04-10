import React, { useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"

const Logout: React.FC = () => {
  const { logout, isAuthenticated } = useAuth0()

  useEffect(() => {
    if (isAuthenticated) {
      logout({ logoutParams: { returnTo: window.location.origin } })
    }
  }, [isAuthenticated, logout])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
      <h1 className="text-2xl font-bold mb-2">Signing you out...</h1>
      <p className="text-gray-600">You will be redirected shortly.</p>
    </div>
  )
}

export default Logout
