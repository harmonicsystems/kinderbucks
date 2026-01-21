import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Demo from './pages/Demo'
import About from './pages/About'
import Benefits from './pages/Benefits'
import Businesses from './pages/Businesses'
import Exchange from './pages/Exchange'
import Account from './pages/Account'
import Profile from './pages/Profile'
import Login from './pages/Login'
import MyCard from './pages/MyCard'
import Scan from './pages/Scan'
import CheckIn from './pages/CheckIn'
import BusinessDashboard from './pages/BusinessDashboard'
import AdminDashboard from './pages/AdminDashboard'
import AdminGenerate from './pages/AdminGenerate'
import AdminIssue from './pages/AdminIssue'
import AdminBusinesses from './pages/AdminBusinesses'
import AdminExchanges from './pages/AdminExchanges'
import AdminMembers from './pages/AdminMembers'
import AdminUsers from './pages/AdminUsers'
import AdminBusinessDetail from './pages/AdminBusinessDetail'
import AdminRedemptions from './pages/AdminRedemptions'
import AdminLandmarks from './pages/AdminLandmarks'
import AdminHunts from './pages/AdminHunts'
import AcceptPayment from './pages/AcceptPayment'
import VillageMapPage from './pages/VillageMap'
import Hunts from './pages/Hunts'
import LandmarkScan from './pages/LandmarkScan'
import Pitch from './pages/Pitch'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/about" element={<About />} />
          <Route path="/benefits" element={<Benefits />} />
          <Route path="/businesses" element={<Businesses />} />
          <Route path="/map" element={<VillageMapPage />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/login" element={<Login />} />

          {/* Secret Pitch Room (not linked in nav) */}
          <Route path="/pitch" element={<Pitch />} />

          {/* Member Pages */}
          <Route path="/account" element={<Account />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/card" element={<MyCard />} />

          {/* Scavenger Hunts */}
          <Route path="/hunts" element={<Hunts />} />
          <Route path="/landmark/:landmarkCode" element={<LandmarkScan />} />

          {/* Verification & Check-in */}
          <Route path="/scan/:serial" element={<Scan />} />
          <Route path="/checkin/:businessCode" element={<CheckIn />} />

          {/* Business Owner Pages */}
          <Route path="/business/dashboard" element={
            <ProtectedRoute allowedRoles={['business', 'admin']}>
              <BusinessDashboard />
            </ProtectedRoute>
          } />
          <Route path="/business/accept-payment" element={
            <ProtectedRoute allowedRoles={['business', 'admin']}>
              <AcceptPayment />
            </ProtectedRoute>
          } />

          {/* Admin Pages */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/exchanges" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminExchanges />
            </ProtectedRoute>
          } />
          <Route path="/admin/members" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminMembers />
            </ProtectedRoute>
          } />
          <Route path="/admin/generate" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminGenerate />
            </ProtectedRoute>
          } />
          <Route path="/admin/issue" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminIssue />
            </ProtectedRoute>
          } />
          <Route path="/admin/businesses" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminBusinesses />
            </ProtectedRoute>
          } />
          <Route path="/admin/businesses/:businessCode" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminBusinessDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/redemptions" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRedemptions />
            </ProtectedRoute>
          } />
          <Route path="/admin/landmarks" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLandmarks />
            </ProtectedRoute>
          } />
          <Route path="/admin/hunts" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminHunts />
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App
