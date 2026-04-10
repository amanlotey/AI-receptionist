// src/components/Layout.tsx
import React from "react"
import { Link } from "react-router-dom"
import { useAuth0 } from "@auth0/auth0-react"

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, user } = useAuth0()

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <nav className="bg-neutral-900 text-white p-3 flex justify-center gap-6 border-b border-neutral-800">
        <Link to="/" className="hover:text-blue-400">
          🎙️ Assistant
        </Link>

        <Link to="/dashboard" className="hover:text-blue-400">
          📊 Dashboard
        </Link>

        <button
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
          className="hover:text-red-400"
        >
          🚪 Logout ({user?.name?.split(" ")[0]})
        </button>
      </nav>

      <main>{children}</main>
    </div>
  )
}

export default Layout
