import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AdminProvider, useAdmin } from './context/AdminContext'
import { getPocketBase } from './lib/pocketbase'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PortalLayout from './components/PortalLayout'
import AdminLayout from './components/AdminLayout'
import Home from './pages/Home'
import Services from './pages/Services'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/portal/Register'
import VerifyEmail from './pages/portal/VerifyEmail'
import ForgotPassword from './pages/portal/ForgotPassword'
import ResetPassword from './pages/portal/ResetPassword'
import Dashboard from './pages/portal/Dashboard'
import SubmitRequest from './pages/portal/SubmitRequest'
import ActiveRequests from './pages/portal/ActiveRequests'
import CompletedRequests from './pages/portal/CompletedRequests'
import ReminderCenter from './pages/portal/ReminderCenter'
import NotificationCenter from './pages/portal/NotificationCenter'
import MyLifeProfile from './pages/portal/MyLifeProfile'
import AdminDashboard from './pages/admin/Dashboard'
import AdminRequests from './pages/admin/Requests'
import AdminUsers from './pages/admin/Users'
import Operations from './pages/admin/Operations'
import SystemHealth from './pages/admin/SystemHealth'
import TeamLayout from './components/TeamLayout'
import TeamDashboard from './pages/team/Dashboard'
import TeamRequests from './pages/team/Requests'
import Onboarding from './pages/Onboarding'
import PortalConsultation from './pages/portal/Consultation'
import ConsultationRequests from './pages/admin/ConsultationRequests'
import CommandCenter from './pages/admin/CommandCenter'
import HealthCheck from './pages/HealthCheck'

function ProtectedPortal({ children }) {
  const { user, verified } = useAuth()
  const pb = getPocketBase()
  if (!user) return <Navigate to="/login" replace />
  if (pb.authStore.record?.disabled) {
    pb.authStore.clear()
    return <Navigate to="/login" replace />
  }
  if (!verified) return <Navigate to="/verify" replace />
  return children
}

function ProtectedAdmin({ children }) {
  const { admin } = useAdmin()
  const pb = getPocketBase()
  const record = admin || pb.authStore.record
  if (!record) return <Navigate to="/login" replace />
  if (record.disabled) {
    pb.authStore.clear()
    return <Navigate to="/login" replace />
  }
  if (record.role !== 'Admin') return <Navigate to="/login" replace />
  return children
}

function ProtectedTeam({ children }) {
  const pb = getPocketBase()
  const record = pb.authStore.record
  if (!record) return <Navigate to="/login" replace />
  if (record.disabled) {
    pb.authStore.clear()
    return <Navigate to="/login" replace />
  }
  if (record.role !== 'Team Member') return <Navigate to="/login" replace />
  return children
}

function PortalRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<ProtectedPortal><PortalLayout><Dashboard /></PortalLayout></ProtectedPortal>} />
      <Route path="/submit" element={<ProtectedPortal><PortalLayout><SubmitRequest /></PortalLayout></ProtectedPortal>} />
      <Route path="/requests/active" element={<ProtectedPortal><PortalLayout><ActiveRequests /></PortalLayout></ProtectedPortal>} />
      <Route path="/requests/completed" element={<ProtectedPortal><PortalLayout><CompletedRequests /></PortalLayout></ProtectedPortal>} />
      <Route path="/reminders" element={<ProtectedPortal><PortalLayout><ReminderCenter /></PortalLayout></ProtectedPortal>} />
      <Route path="/notifications" element={<ProtectedPortal><PortalLayout><NotificationCenter /></PortalLayout></ProtectedPortal>} />
      <Route path="/life-profile" element={<ProtectedPortal><PortalLayout><MyLifeProfile /></PortalLayout></ProtectedPortal>} />
      <Route path="/consultation" element={<ProtectedPortal><PortalLayout><PortalConsultation /></PortalLayout></ProtectedPortal>} />
      <Route path="*" element={<Navigate to="/portal/dashboard" replace />} />
    </Routes>
  )
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<ProtectedAdmin><AdminLayout><AdminDashboard /></AdminLayout></ProtectedAdmin>} />
      <Route path="/requests" element={<ProtectedAdmin><AdminLayout><AdminRequests /></AdminLayout></ProtectedAdmin>} />
      <Route path="/users" element={<ProtectedAdmin><AdminLayout><AdminUsers /></AdminLayout></ProtectedAdmin>} />
      <Route path="/operations" element={<ProtectedAdmin><AdminLayout><Operations /></AdminLayout></ProtectedAdmin>} />
      <Route path="/system-health" element={<ProtectedAdmin><AdminLayout><SystemHealth /></AdminLayout></ProtectedAdmin>} />
      <Route path="/consultations" element={<ProtectedAdmin><AdminLayout><ConsultationRequests /></AdminLayout></ProtectedAdmin>} />
      <Route path="/command-center" element={<ProtectedAdmin><AdminLayout><CommandCenter /></AdminLayout></ProtectedAdmin>} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  )
}

function TeamRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<ProtectedTeam><TeamLayout><TeamDashboard /></TeamLayout></ProtectedTeam>} />
      <Route path="/requests" element={<ProtectedTeam><TeamLayout><TeamRequests /></TeamLayout></ProtectedTeam>} />
      <Route path="*" element={<Navigate to="/team/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        <Route path="/*" element={
          <AuthProvider>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/services" element={<Services />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify" element={<VerifyEmail />} />
                <Route path="/consultation" element={<PortalConsultation />} />
                <Route path="/health" element={<HealthCheck />} />
              </Routes>
            </main>
            <Footer />
          </AuthProvider>
        } />
        <Route path="/portal/*" element={
          <AuthProvider>
            <PortalRoutes />
          </AuthProvider>
        } />
        <Route path="/admin/*" element={
          <AdminProvider>
            <AdminRoutes />
          </AdminProvider>
        } />
        <Route path="/team/*" element={
          <AdminProvider>
            <TeamRoutes />
          </AdminProvider>
        } />
      </Routes>
    </div>
  )
}
