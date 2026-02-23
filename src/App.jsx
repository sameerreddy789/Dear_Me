import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import EditorPage from './pages/EditorPage'
import CalendarPage from './pages/CalendarPage'
import MaintenancePage from './pages/MaintenancePage'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Login route — no layout wrapper */}
          <Route path="/login" element={<LoginPage />} />

          {/* Maintenance page for quota exceeded */}
          <Route path="/maintenance" element={<MaintenancePage />} />

          {/* Authenticated routes — protected and wrapped in Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/editor/:entryId?" element={<EditorPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
