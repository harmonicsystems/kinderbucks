import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Scan from './pages/Scan'
import CheckIn from './pages/CheckIn'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import AdminGenerate from './pages/AdminGenerate'
import AdminIssue from './pages/AdminIssue'
import AdminBusinesses from './pages/AdminBusinesses'
import './App.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan/:serial" element={<Scan />} />
        <Route path="/checkin/:businessCode" element={<CheckIn />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/generate" element={<AdminGenerate />} />
        <Route path="/admin/issue" element={<AdminIssue />} />
        <Route path="/admin/businesses" element={<AdminBusinesses />} />
      </Routes>
    </HashRouter>
  )
}

export default App
