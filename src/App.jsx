import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Scan from './pages/Scan'
import AdminDashboard from './pages/AdminDashboard'
import AdminGenerate from './pages/AdminGenerate'
import AdminIssue from './pages/AdminIssue'
import './App.css'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan/:serial" element={<Scan />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/generate" element={<AdminGenerate />} />
        <Route path="/admin/issue" element={<AdminIssue />} />
      </Routes>
    </HashRouter>
  )
}

export default App
