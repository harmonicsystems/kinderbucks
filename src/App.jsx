import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Demo from './pages/Demo'
import About from './pages/About'
import Benefits from './pages/Benefits'
import Businesses from './pages/Businesses'
import Exchange from './pages/Exchange'
import Account from './pages/Account'
import Profile from './pages/Profile'
import Scan from './pages/Scan'
import CheckIn from './pages/CheckIn'
import AdminDashboard from './pages/AdminDashboard'
import AdminGenerate from './pages/AdminGenerate'
import AdminIssue from './pages/AdminIssue'
import AdminBusinesses from './pages/AdminBusinesses'
import './App.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/about" element={<About />} />
        <Route path="/benefits" element={<Benefits />} />
        <Route path="/businesses" element={<Businesses />} />
        <Route path="/exchange" element={<Exchange />} />

        {/* Member Pages */}
        <Route path="/account" element={<Account />} />
        <Route path="/profile" element={<Profile />} />

        {/* Verification & Check-in */}
        <Route path="/scan/:serial" element={<Scan />} />
        <Route path="/checkin/:businessCode" element={<CheckIn />} />

        {/* Admin Pages */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/generate" element={<AdminGenerate />} />
        <Route path="/admin/issue" element={<AdminIssue />} />
        <Route path="/admin/businesses" element={<AdminBusinesses />} />
      </Routes>
    </HashRouter>
  )
}

export default App
