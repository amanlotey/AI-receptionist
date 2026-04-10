import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import VoiceAssistant from "./pages/VoiceAssistant"
import Dashboard from "./pages/Dashboard"
import Signin from "./pages/Signin"
import Logout from "./pages/Logout"
import Layout from "./components/Layout"
import { useAuth0 } from "@auth0/auth0-react"

const App: React.FC = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mr-3" />
        <p>Loading...</p>
      </div>
    )

  return (
    <Router>
      <Routes>
        {/* Sign In screen (no navbar) */}
        {!isAuthenticated && <Route path="*" element={<Signin />} />}

        {/* Authenticated routes */}
        {isAuthenticated && (
          <>
            <Route
              path="/"
              element={
                <Layout>
                  <VoiceAssistant />
                </Layout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
          </>
        )}
      </Routes>
    </Router>
  )
}

export default App
