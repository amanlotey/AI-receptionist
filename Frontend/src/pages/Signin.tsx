import React from "react"
import { useAuth0 } from "@auth0/auth0-react"
import logo from "../assets/logo.jpg"

const Signin: React.FC = () => {
  const { loginWithRedirect } = useAuth0()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100 text-white text-center">
      <img
        src={logo}
        alt="United Cloud Logo"
        className="mb-6 animate-pulse"
      />
      <h1 className="text-3xl font-bold mb-6 text-green-700">Welcome to United Cloud</h1>
      <button
        onClick={() => loginWithRedirect()}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-all"
      >
        🔐 Sign In with Auth0
      </button>
    </div>
  )
}

export default Signin
